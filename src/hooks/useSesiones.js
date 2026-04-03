import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const TIPOS_SESION    = ['fuerza', 'cardio', 'flexibilidad', 'caminata', 'mixto', 'otro']
const GRUPOS_MUSCULAR = ['pecho', 'espalda', 'piernas', 'hombros', 'biceps', 'triceps', 'core', 'cardio', 'full_body']
const SENSACIONES     = ['facil', 'moderada', 'dificil', 'fallo']

export function useSesiones(userId) {
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchSesiones = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    setError(null)
    // Trae sesiones con ejercicios y series en una sola consulta
    const { data, error: fetchError } = await supabase
      .from('proymoun_sesiones')
      .select(`
        *,
        proymoun_ejercicios (
          *,
          proymoun_series ( * )
        )
      `)
      .eq('user_id', userId)
      .order('fecha_inicio', { ascending: false })
    if (fetchError) setError(fetchError.message)
    else setSesiones(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchSesiones() }, [fetchSesiones])

  // ── Sesiones ────────────────────────────────────────────────────
  async function addSesion(sesionData) {
    const { data, error: insertError } = await supabase
      .from('proymoun_sesiones')
      .insert({ ...sesionData, user_id: userId })
      .select()
      .single()
    if (insertError) throw insertError
    const sesionConEjercicos = { ...data, proymoun_ejercicios: [] }
    setSesiones(prev => [sesionConEjercicos, ...prev])
    return data
  }

  async function updateSesion(id, updates) {
    const { data, error: updateError } = await supabase
      .from('proymoun_sesiones')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (updateError) throw updateError
    setSesiones(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)))
    return data
  }

  async function deleteSesion(id) {
    const { error: deleteError } = await supabase
      .from('proymoun_sesiones')
      .delete()
      .eq('id', id)
    if (deleteError) throw deleteError
    setSesiones(prev => prev.filter(s => s.id !== id))
  }

  // ── Ejercicios ──────────────────────────────────────────────────
  async function addEjercicio(sesionId, ejercicioData) {
    const { data, error: insertError } = await supabase
      .from('proymoun_ejercicios')
      .insert({ ...ejercicioData, sesion_id: sesionId })
      .select()
      .single()
    if (insertError) throw insertError
    const conSeries = { ...data, proymoun_series: [] }
    setSesiones(prev => prev.map(s =>
      s.id === sesionId
        ? { ...s, proymoun_ejercicios: [...(s.proymoun_ejercicios || []), conSeries] }
        : s
    ))
    return data
  }

  async function updateEjercicio(sesionId, ejercicioId, updates) {
    const { data, error: updateError } = await supabase
      .from('proymoun_ejercicios')
      .update(updates)
      .eq('id', ejercicioId)
      .select()
      .single()
    if (updateError) throw updateError
    setSesiones(prev => prev.map(s =>
      s.id === sesionId
        ? {
            ...s,
            proymoun_ejercicios: (s.proymoun_ejercicios || []).map(e =>
              e.id === ejercicioId ? { ...e, ...data } : e
            ),
          }
        : s
    ))
    return data
  }

  async function deleteEjercicio(sesionId, ejercicioId) {
    const { error: deleteError } = await supabase
      .from('proymoun_ejercicios')
      .delete()
      .eq('id', ejercicioId)
    if (deleteError) throw deleteError
    setSesiones(prev => prev.map(s =>
      s.id === sesionId
        ? { ...s, proymoun_ejercicios: (s.proymoun_ejercicios || []).filter(e => e.id !== ejercicioId) }
        : s
    ))
  }

  // ── Series ──────────────────────────────────────────────────────
  async function addSerie(sesionId, ejercicioId, serieData) {
    const { data, error: insertError } = await supabase
      .from('proymoun_series')
      .insert({ ...serieData, ejercicio_id: ejercicioId })
      .select()
      .single()
    if (insertError) throw insertError
    setSesiones(prev => prev.map(s =>
      s.id === sesionId
        ? {
            ...s,
            proymoun_ejercicios: (s.proymoun_ejercicios || []).map(e =>
              e.id === ejercicioId
                ? { ...e, proymoun_series: [...(e.proymoun_series || []), data] }
                : e
            ),
          }
        : s
    ))
    return data
  }

  async function updateSerie(sesionId, ejercicioId, serieId, updates) {
    const { data, error: updateError } = await supabase
      .from('proymoun_series')
      .update(updates)
      .eq('id', serieId)
      .select()
      .single()
    if (updateError) throw updateError
    setSesiones(prev => prev.map(s =>
      s.id === sesionId
        ? {
            ...s,
            proymoun_ejercicios: (s.proymoun_ejercicios || []).map(e =>
              e.id === ejercicioId
                ? {
                    ...e,
                    proymoun_series: (e.proymoun_series || []).map(sr =>
                      sr.id === serieId ? { ...sr, ...data } : sr
                    ),
                  }
                : e
            ),
          }
        : s
    ))
    return data
  }

  async function deleteSerie(sesionId, ejercicioId, serieId) {
    const { error: deleteError } = await supabase
      .from('proymoun_series')
      .delete()
      .eq('id', serieId)
    if (deleteError) throw deleteError
    setSesiones(prev => prev.map(s =>
      s.id === sesionId
        ? {
            ...s,
            proymoun_ejercicios: (s.proymoun_ejercicios || []).map(e =>
              e.id === ejercicioId
                ? { ...e, proymoun_series: (e.proymoun_series || []).filter(sr => sr.id !== serieId) }
                : e
            ),
          }
        : s
    ))
  }

  // ── Métricas derivadas ──────────────────────────────────────────
  const sesionesEsemana = (() => {
    const hace7 = new Date(); hace7.setDate(hace7.getDate() - 7)
    return sesiones.filter(s => new Date(s.fecha_inicio) >= hace7).length
  })()

  const volumenTotal = sesiones.reduce((total, s) =>
    total + (s.proymoun_ejercicios || []).reduce((t2, e) =>
      t2 + (e.proymoun_series || []).reduce((t3, sr) =>
        t3 + (sr.reps || 0) * (sr.peso || 0), 0
      ), 0
    ), 0
  )

  return {
    sesiones,
    loading,
    error,
    sesionesEsemana,
    volumenTotal,
    TIPOS_SESION,
    GRUPOS_MUSCULAR,
    SENSACIONES,
    addSesion,
    updateSesion,
    deleteSesion,
    addEjercicio,
    updateEjercicio,
    deleteEjercicio,
    addSerie,
    updateSerie,
    deleteSerie,
    refetch: fetchSesiones,
  }
}
