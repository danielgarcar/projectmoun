import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const DOSIS_VALIDAS = [2.5, 5, 7.5, 10, 12.5, 15]
const ZONAS_VALIDAS = ['abdomen', 'muslo', 'brazo']

export function useDosis(userId) {
  const [dosis, setDosis]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchDosis = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('proymoun_dosis')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false })
    if (fetchError) setError(fetchError.message)
    else setDosis(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchDosis() }, [fetchDosis])

  async function addDosis(dosisData) {
    const { data, error: insertError } = await supabase
      .from('proymoun_dosis')
      .insert({ ...dosisData, user_id: userId })
      .select()
      .single()
    if (insertError) throw insertError
    setDosis(prev => [data, ...prev])
    return data
  }

  async function updateDosis(id, updates) {
    const { data, error: updateError } = await supabase
      .from('proymoun_dosis')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (updateError) throw updateError
    setDosis(prev => prev.map(d => (d.id === id ? data : d)))
    return data
  }

  async function deleteDosis(id) {
    const { error: deleteError } = await supabase
      .from('proymoun_dosis')
      .delete()
      .eq('id', id)
    if (deleteError) throw deleteError
    setDosis(prev => prev.filter(d => d.id !== id))
  }

  // ── Métricas derivadas ──────────────────────────────────────────
  const ultimaDosis      = dosis.length > 0 ? dosis[0] : null
  const dosisActual_mg   = ultimaDosis?.dosis_mg ?? null

  const proximaDosis = ultimaDosis
    ? new Date(new Date(ultimaDosis.fecha).getTime() + 7 * 24 * 60 * 60 * 1000)
    : null

  const diasParaProximaDosis = proximaDosis
    ? Math.max(0, Math.ceil((proximaDosis - new Date()) / (1000 * 60 * 60 * 24)))
    : null

  // Historial de escalada: agrupa por dosis_mg ordenado cronológicamente
  const historialEscalada = [...dosis]
    .reverse()
    .reduce((acc, d) => {
      const last = acc[acc.length - 1]
      if (!last || last.dosis_mg !== d.dosis_mg) {
        acc.push({ dosis_mg: d.dosis_mg, fecha_inicio: d.fecha })
      }
      return acc
    }, [])

  return {
    dosis,
    loading,
    error,
    ultimaDosis,
    dosisActual_mg,
    proximaDosis,
    diasParaProximaDosis,
    historialEscalada,
    DOSIS_VALIDAS,
    ZONAS_VALIDAS,
    addDosis,
    updateDosis,
    deleteDosis,
    refetch: fetchDosis,
  }
}
