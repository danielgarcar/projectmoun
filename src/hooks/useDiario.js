import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const ETIQUETAS_VALIDAS = [
  'bienestar', 'logro', 'dificultad', 'motivacion',
  'alimentacion', 'entrenamiento', 'dosis', 'emociones',
]

export function useDiario(userId) {
  const [entradas, setEntradas] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchEntradas = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('proymoun_diario')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false })
    if (fetchError) setError(fetchError.message)
    else setEntradas(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchEntradas() }, [fetchEntradas])

  async function addEntrada(entradaData) {
    const { data, error: insertError } = await supabase
      .from('proymoun_diario')
      .insert({ ...entradaData, user_id: userId })
      .select()
      .single()
    if (insertError) throw insertError
    setEntradas(prev => [data, ...prev])
    return data
  }

  async function updateEntrada(id, updates) {
    const { data, error: updateError } = await supabase
      .from('proymoun_diario')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (updateError) throw updateError
    setEntradas(prev => prev.map(e => (e.id === id ? data : e)))
    return data
  }

  async function deleteEntrada(id) {
    const { error: deleteError } = await supabase
      .from('proymoun_diario')
      .delete()
      .eq('id', id)
    if (deleteError) throw deleteError
    setEntradas(prev => prev.filter(e => e.id !== id))
  }

  // ── Búsqueda / filtros ──────────────────────────────────────────
  function buscarPorTexto(texto) {
    if (!texto?.trim()) return entradas
    const q = texto.toLowerCase()
    return entradas.filter(
      e => e.contenido?.toLowerCase().includes(q) ||
           e.etiquetas?.some(t => t.toLowerCase().includes(q))
    )
  }

  function filtrarPorEtiqueta(etiqueta) {
    if (!etiqueta) return entradas
    return entradas.filter(e => e.etiquetas?.includes(etiqueta))
  }

  function filtrarPorRangoFechas(desde, hasta) {
    return entradas.filter(e => {
      if (!e.fecha) return false
      const f = new Date(e.fecha)
      return f >= new Date(desde) && f <= new Date(hasta)
    })
  }

  // ── Métricas ────────────────────────────────────────────────────
  const entradaHoy = (() => {
    const hoy = new Date().toISOString().split('T')[0]
    return entradas.find(e => e.fecha === hoy) || null
  })()

  const valoracionMedia = entradas.length
    ? (entradas.reduce((s, e) => s + (e.valoracion || 0), 0) / entradas.length).toFixed(1)
    : null

  return {
    entradas,
    loading,
    error,
    entradaHoy,
    valoracionMedia,
    ETIQUETAS_VALIDAS,
    addEntrada,
    updateEntrada,
    deleteEntrada,
    buscarPorTexto,
    filtrarPorEtiqueta,
    filtrarPorRangoFechas,
    refetch: fetchEntradas,
  }
}
