'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.href).finally(() => {
      router.replace('/')
    })
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <p className="text-sm opacity-50">Autenticando...</p>
    </div>
  )
}