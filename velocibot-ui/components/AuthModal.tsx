'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  onClose?: () => void
}

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email ou senha incorretos.',
  'User already registered': 'Este email já está cadastrado.',
  'Email not confirmed': 'Confirme seu email antes de entrar.',
  'Password should be at least 6 characters': 'Senha muito curta.',
  'Nome inválido.': 'Nome inválido.',
  'Senha deve ter pelo menos 8 caracteres.': 'Senha deve ter pelo menos 8 caracteres.',
  'RATE_LIMIT': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
}

function parseError(err: unknown): string {
  const msg = (err as Error).message
  return ERROR_MESSAGES[msg] || 'Algo deu errado. Tente novamente.'
}

export function AuthModal({ onClose }: Props) {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [success, setSuccess] = useState('')
  const [lastAttempt, setLastAttempt] = useState(0)

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    const now = Date.now()
    if (now - lastAttempt < 1500) return
    setLastAttempt(now)

    if (mode === 'forgot') {
      if (!email) return setError('Informe seu email.')
      setLoading(true)
      try {
        await resetPassword(email)
        setSuccess('Email enviado! Verifique sua caixa de entrada (e o spam).')
      } catch (err) {
        setError(parseError(err))
      } finally {
        setLoading(false)
      }
      return
    }

    if (!email || !password) return setError('Preencha todos os campos.')
    if (mode === 'register' && !name.trim()) return setError('Informe seu nome.')
    if (password.length < 8) return setError('Senha deve ter pelo menos 8 caracteres.')

    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        onClose?.()
      } else {
        await signUp(email, password, name)
        setSuccess('Conta criada! Verifique seu email para confirmar.')
      }
    } catch (err) {
      setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoadingGoogle(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(parseError(err))
      setLoadingGoogle(false)
    }
  }

  const switchMode = (next: 'login' | 'register' | 'forgot') => {
    setMode(next)
    setError('')
    setSuccess('')
    setShowPassword(false)
  }

  return (
    <div
      className="fixed inset-0 backdrop-blur-xl z-[200] flex items-center justify-center p-4"
      style={{ background: 'var(--overlay)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
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
            {mode === 'login' && 'Entrar na sua conta'}
            {mode === 'register' && 'Criar conta'}
            {mode === 'forgot' && 'Redefinir senha'}
          </p>
        </div>

        {/* Botão Google — só no login e register */}
        <AnimatePresence>
          {mode !== 'forgot' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                disabled={loadingGoogle}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer disabled:opacity-60"
                style={{ background: 'var(--border)', border: '1px solid var(--border-muted)', color: 'var(--foreground)' }}
              >
                {loadingGoogle ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                    <path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.2-.1-2.5-.4-3.5z" fill="#FFC107"/>
                    <path d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" fill="#FF3D00"/>
                    <path d="M24 44c5.5 0 10.4-2.1 14.1-5.4l-6.5-5.5C29.6 35 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-7.9L6 33.3C9.4 39.7 16.2 44 24 44z" fill="#4CAF50"/>
                    <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.4l6.5 5.5C41.8 36.2 44 30.5 44 24c0-1.2-.1-2.5-.4-3.5z" fill="#1976D2"/>
                  </svg>
                )}
                Continuar com Google
              </motion.button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--foreground-subtle)' }}>ou</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Campos */}
        <div className="flex flex-col gap-3">

          {/* Nome — só no register */}
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{ background: 'var(--border)', border: '1px solid var(--border-muted)' }}
                >
                  <User size={16} style={{ color: 'var(--foreground-muted)' }} className="flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent text-sm flex-1 outline-none"
                    style={{ color: 'var(--foreground)' }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: 'var(--border)', border: '1px solid var(--border-muted)' }}
          >
            <Mail size={16} style={{ color: 'var(--foreground-muted)' }} className="flex-shrink-0" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="bg-transparent text-sm flex-1 outline-none"
              style={{ color: 'var(--foreground)' }}
            />
          </div>

          {/* Senha */}
          <AnimatePresence>
            {mode !== 'forgot' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{ background: 'var(--border)', border: '1px solid var(--border-muted)' }}
                >
                  <Lock size={16} style={{ color: 'var(--foreground-muted)' }} className="flex-shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="bg-transparent text-sm flex-1 outline-none"
                    style={{ color: 'var(--foreground)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="flex-shrink-0 cursor-pointer transition-opacity hover:opacity-100 opacity-50"
                  >
                    {showPassword
                      ? <EyeOff size={16} style={{ color: 'var(--foreground-muted)' }} />
                      : <Eye size={16} style={{ color: 'var(--foreground-muted)' }} />
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Link "Esqueceu a senha?" */}
        <AnimatePresence>
          {mode === 'login' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-end mt-2">
              <button
                onClick={() => switchMode('forgot')}
                className="text-xs cursor-pointer transition-opacity hover:opacity-80"
                style={{ color: 'var(--foreground-muted)' }}
              >
                Esqueceu a senha?
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Erros e sucesso */}
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-3 text-center">
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs mt-3 text-center" style={{ color: 'var(--accent-gold)' }}>
              {success}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Botão principal */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 py-4 rounded-2xl transition-all font-bold text-sm text-black shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          style={{ background: 'var(--accent-gold)', boxShadow: '0 4px 20px rgba(234,179,8,0.2)' }}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {mode === 'login' && 'Entrar'}
          {mode === 'register' && 'Criar conta'}
          {mode === 'forgot' && 'Enviar email'}
        </motion.button>

        {/* Rodapé de navegação */}
        <p className="text-center text-xs mt-5" style={{ color: 'var(--foreground-muted)' }}>
          {mode === 'forgot' ? (
            <>
              Lembrou a senha?{' '}
              <button onClick={() => switchMode('login')} className="font-semibold cursor-pointer" style={{ color: 'var(--accent-gold)' }}>
                Entrar
              </button>
            </>
          ) : (
            <>
              {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
              <button
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="font-semibold cursor-pointer"
                style={{ color: 'var(--accent-gold)' }}
              >
                {mode === 'login' ? 'Criar conta' : 'Entrar'}
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  )
}