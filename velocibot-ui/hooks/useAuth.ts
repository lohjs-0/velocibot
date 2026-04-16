'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserName = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('id', userId)
      .maybeSingle()
    if (data?.name) setUserName(data.name)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) loadUserName(u.id)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) loadUserName(u.id)
      else setUserName(null)
    })
    return () => listener.subscription.unsubscribe()
  }, [loadUserName, supabase])

  const signUp = async (email: string, password: string, name: string) => {
    const trimmedName = name.trim()
    if (!trimmedName) throw new Error('Nome inválido.')
    if (password.length < 8) throw new Error('Senha deve ter pelo menos 8 caracteres.')

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        name: trimmedName,
        preferences: {},
        memory: '',
      })
      setUserName(trimmedName)
    }
    return data
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) await loadUserName(data.user.id)
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUserName(null)
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  return { user, userName, loading, signUp, signIn, signOut, resetPassword }
}