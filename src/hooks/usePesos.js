import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePesos(userId) {
  const [pesos, setPesos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetchPesos()
  }, [userId])

  async function fetchPesos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('proymoun_pesos')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: true })
    if (error) setError(error.message)
    else setPesos(data || [])
    setLoading(false)
  }

  async function addPeso(pesoData) {
    const { data, error } = await supabase
      .from('proymoun_pesos')
      .insert({ ...pesoData, user_id: userId })
      .select()
      .single()
    if (error) throw error
    setPesos(prev => [...prev, data].sort((a, b) => new Date(a.fecha) - new Date(b.fecha)))
    return data
  }

  async function updatePeso(id, updates) {
    const { data, error } = await supabase
      .from('proymoun_pesos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setPesos(prev => prev.map(p => p.id === id ? data : p))
    return data
  }

  async function deletePeso(id) {
    const { error } = await supabase
      .from('proymoun_pesos')
      .delete()
      .eq('id', id)
    if (error) throw error
    setPesos(prev => prev.filter(p => p.id !== id))
  }

  // Metricas derivadas
  const pesoActual = pesos.length > 0 ? pesos[pesos.length - 1].peso : null
  const pesoInicial = pesos.length > 0 ? pesos[0].peso : null
  const diferencia = pesoActual && pesoInicial ? (pesoActual - pesoInicial).toFixed(1) : null

  return {
    pesos,
    loading,
    error,
    addPeso,
    updatePeso,
    deletePeso,
    pesoActual,
    pesoInicial,
    diferencia,
    refetch: fetchPesos,
  }
}
