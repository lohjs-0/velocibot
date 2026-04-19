'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ERROR_MESSAGES: Record<string, string> = {
  'Auth session missing!': 'Link expirado ou inválido. Solicite um novo.',
  'New password should be different from the old password.': 'A nova senha deve ser diferente da anterior.',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 8 caracteres.',
}

function parseError(err: unknown): string {
  const msg = (err as Error).message
  return ERROR_MESSAGES[msg] || 'Erro ao redefinir senha. Tente novamente.'
}

export default function ResetPassword() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const [lastAttempt, setLastAttempt] = useState(0)

  useEffect(() => {
    
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true)
      }
    })

    const handleRecovery = async () => {
      
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setError('Link expirado ou inválido. Solicite um novo.')
        }
        
        return
      }

      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setReady(true)
        return
      }

      setError('Link expirado ou inválido. Solicite um novo.')
    }

    handleRecovery()

    return () => listener.subscription.unsubscribe()
  }, [supabase])

  const handleReset = useCallback(async () => {
    setError('')

    const now = Date.now()
    if (now - lastAttempt < 1500) return
    setLastAttempt(now)

    if (!password || !confirm) return setError('Preencha todos os campos.')
    if (password.length < 8) return setError('A senha deve ter pelo menos 8 caracteres.')
    if (password !== confirm) return setError('As senhas não coincidem.')

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push('/'), 3000)
    } catch (err) {
      setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }, [password, confirm, lastAttempt, supabase, router])

  return (
    <div
      className="h-[100dvh] flex items-center justify-center p-4"
      style={{ background: 'var(--background)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="p-8 rounded-[2.5rem] max-w-sm w-full relative overflow-hidden"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--accent-gold-border)',
          boxShadow: '0 0 60px rgba(234,179,8,0.15)',
        }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(234,179,8,0.3)] overflow-hidden mb-4">
            <img src="/icon.jpeg" alt="VelociBot" className="w-full h-full object-cover rounded-full" />
          </div>
          <h2 className="font-black text-xl tracking-tight uppercase" style={{ color: 'var(--foreground)' }}>
            VelociBot
          </h2>
          <p className="text-xs mt-1 tracking-widest uppercase" style={{ color: 'var(--foreground-muted)' }}>
            Nova senha
          </p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-4 text-center"
            >
              <CheckCircle2 size={48} style={{ color: 'var(--accent-gold)' }} />
              <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                Senha redefinida com sucesso!
              </p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                Redirecionando para o app...
              </p>
            </motion.div>

          ) : !ready ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-4 text-center"
            >
              {error ? (
                <p className="text-red-400 text-xs text-center">{error}</p>
              ) : (
                <>
                  <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-gold)' }} />
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                    Verificando link...
                  </p>
                </>
              )}
            </motion.div>

          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">

              {/* Nova senha */}
              <div
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: 'var(--border)', border: '1px solid var(--border-muted)' }}
              >
                <Lock size={16} style={{ color: 'var(--foreground-muted)' }} className="flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent text-sm flex-1 outline-none"
                  style={{ color: 'var(--foreground)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="flex-shrink-0 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                >
                  {showPassword
                    ? <EyeOff size={16} style={{ color: 'var(--foreground-muted)' }} />
                    : <Eye size={16} style={{ color: 'var(--foreground-muted)' }} />
                  }
                </button>
              </div>

              {/* Confirmar senha */}
              <div
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: 'var(--border)', border: '1px solid var(--border-muted)' }}
              >
                <Lock size={16} style={{ color: 'var(--foreground-muted)' }} className="flex-shrink-0" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirmar nova senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                  className="bg-transparent text-sm flex-1 outline-none"
                  style={{ color: 'var(--foreground)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="flex-shrink-0 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                >
                  {showConfirm
                    ? <EyeOff size={16} style={{ color: 'var(--foreground-muted)' }} />
                    : <Eye size={16} style={{ color: 'var(--foreground-muted)' }} />
                  }
                </button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-xs text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                disabled={loading}
                className="w-full mt-2 py-4 rounded-2xl font-bold text-sm text-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                style={{ background: 'var(--accent-gold)', boxShadow: '0 4px 20px rgba(234,179,8,0.2)' }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Redefinir senha
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

