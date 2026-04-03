import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const TIPOS_COMIDA = ['desayuno', 'almuerzo', 'cena', 'snack']

export function useComidas(userId) {
  const [comidas, setComidas]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchComidas = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('proymoun_comidas')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false })
    if (fetchError) setError(fetchError.message)
    else setComidas(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchComidas() }, [fetchComidas])

  async function addComida(comidaData) {
    const { data, error: insertError } = await supabase
      .from('proymoun_comidas')
      .insert({ ...comidaData, user_id: userId })
      .select()
      .single()
    if (insertError) throw insertError
    setComidas(prev => [data, ...prev])
    return data
  }

  async function updateComida(id, updates) {
    const { data, error: updateError } = await supabase
      .from('proymoun_comidas')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (updateError) throw updateError
    setComidas(prev => prev.map(c => (c.id === id ? data : c)))
    return data
  }

  async function deleteComida(id) {
    const { error: deleteError } = await supabase
      .from('proymoun_comidas')
      .delete()
      .eq('id', id)
    if (deleteError) throw deleteError
    setComidas(prev => prev.filter(c => c.id !== id))
  }

  // ── Métricas derivadas ──────────────────────────────────────────

  // Comidas de hoy
  const hoy = new Date().toISOString().split('T')[0]
  const comidasHoy = comidas.filter(c => c.fecha?.startsWith(hoy))
  const caloriasHoy = comidasHoy.reduce((sum, c) => sum + (c.calorias || 0), 0)

  // Calorías últimos 7 días agrupadas por día
  const caloriasSemanales = (() => {
    const map = {}
    const hace7 = new Date()
    hace7.setDate(hace7.getDate() - 6)
    for (let i = 0; i < 7; i++) {
      const d = new Date(hace7)
      d.setDate(hace7.getDate() + i)
      map[d.toISOString().split('T')[0]] = 0
    }
    comidas.forEach(c => {
      const dia = c.fecha?.split('T')[0]
      if (dia && map[dia] !== undefined) map[dia] += c.calorias || 0
    })
    return Object.entries(map).map(([fecha, calorias]) => ({ fecha, calorias }))
  })()

  // Comidas agrupadas por fecha (para vista de lista)
  const comidasPorFecha = comidas.reduce((acc, c) => {
    const dia = c.fecha?.split('T')[0] || 'sin fecha'
    if (!acc[dia]) acc[dia] = []
    acc[dia].push(c)
    return acc
  }, {})

  return {
    comidas,
    loading,
    error,
    comidasHoy,
    caloriasHoy,
    caloriasSemanales,
    comidasPorFecha,
    TIPOS_COMIDA,
    addComida,
    updateComida,
    deleteComida,
    refetch: fetchComidas,
  }
}
