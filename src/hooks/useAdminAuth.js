import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { supabaseAdmin } from '../lib/supabaseAdmin'

export function useAdminAuth() {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) verifyAdminRole(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) verifyAdminRole(session.user.id)
        else {
          setAdmin(null)
          setLoading(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function verifyAdminRole(userId) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profile?.role !== 'super_admin') {
      await supabase.auth.signOut()
      setAdmin(null)
      setLoading(false)
      return
    }
    setAdmin(profile)
    setLoading(false)
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password
    })
    return { data, error }
  }

  async function signOut() {
    return await supabase.auth.signOut()
  }

  return { admin, loading, login, signOut }
}
