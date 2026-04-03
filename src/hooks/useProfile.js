import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function fetchProfile() {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('proymoun_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) {
      // PGRST116 = no rows found — not a real error for new users
      if (fetchError.code === 'PGRST116') {
        setProfile(null)
      } else {
        setError(fetchError.message)
      }
    } else {
      setProfile(data)
    }
    setLoading(false)
  }

  async function updateProfile(updates) {
    if (!userId) throw new Error('No user ID')

    // Upsert handles both insert (new user) and update (existing profile)
    const { data, error: updateError } = await supabase
      .from('proymoun_profiles')
      .upsert({ id: userId, ...updates }, { onConflict: 'id' })
      .select()
      .single()

    if (updateError) throw updateError
    setProfile(data)
    return data
  }

  return { profile, loading, error, updateProfile, refetch: fetchProfile }
}
