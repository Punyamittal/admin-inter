import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loginAttempts, setLoginAttempts] = useState(() => 
    parseInt(localStorage.getItem('adminLoginAttempts')) || 0
  )
  const [lockedUntil, setLockedUntil] = useState(() => {
    const lockTime = localStorage.getItem('adminLockUntil')
    return lockTime ? new Date(parseInt(lockTime)) : null
  })

  useEffect(() => {
    // Persistent lock check
    localStorage.setItem('adminLoginAttempts', loginAttempts)
    if (lockedUntil) {
      localStorage.setItem('adminLockUntil', lockedUntil.getTime().toString())
    } else {
      localStorage.removeItem('adminLockUntil')
    }
  }, [loginAttempts, lockedUntil])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) verifyAndLoadAdmin(session.user.id)
      else setLoading(false)
    })

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await verifyAndLoadAdmin(session.user.id)
        }
        if (event === 'SIGNED_OUT') {
          setAdmin(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function verifyAndLoadAdmin(userId) {
    console.log('[Auth] Verifying admin identity for ID:', userId);
    
    try {
      // Service client used for definitive role check to bypass RLS
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, role, is_active, avatar_url')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Database error fetching profile:', error.message);
        toast.error('System error: Could not verify identity.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!profile) {
        console.error('[Auth] No profile found in public.profiles for user');
        toast.error('Account record not found.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      console.log('[Auth] Profile retrieved successfully:', profile);

      if (profile.role !== 'super_admin') {
        console.error('[Auth] ACCESS DENIED: Role is', profile.role);
        toast.error('Access Denied: Super Admin role required.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      setAdmin(profile);
      
      // Log the successful login action for auditing
      await supabaseAdmin.from('admin_logs').insert({
        admin_id: userId,
        action: 'admin_login',
        target_type: 'session',
        details: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      console.error('[Auth] Unexpected verification failure:', err);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    if (lockedUntil && new Date() < lockedUntil) {
      const minutes = Math.ceil((lockedUntil - new Date()) / 60000)
      return { error: `Locked out. Try in ${minutes}m.` }
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
       const newAttempts = loginAttempts + 1
       setLoginAttempts(newAttempts)
       if (newAttempts >= 5) {
         setLockedUntil(new Date(Date.now() + 15 * 60 * 1000))
         setLoginAttempts(0)
       }
       setLoading(false)
       return { error: error.message }
    }

    setLoginAttempts(0)
    setLockedUntil(null)
    return { error: null }
  }

  async function logout() {
    const userId = admin?.id
    await supabase.auth.signOut()
    if (userId) {
      await supabaseAdmin.from('admin_logs').insert({
        admin_id: userId,
        action: 'admin_logout',
        target_type: 'session',
        details: { timestamp: new Date().toISOString() }
      })
    }
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, lockedUntil }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
