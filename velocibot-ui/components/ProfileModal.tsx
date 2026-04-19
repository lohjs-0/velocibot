'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogOut, Sun, Moon, Monitor, Pencil, Check, Trash2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

interface Props {
  open: boolean
  user?: User | null
  userName?: string | null
  onClose: () => void
  onSignOut?: () => void
  onNameChange?: (name: string) => void
}

const themes = [
  { id: 'system', label: 'Sistema', icon: Monitor },
  { id: 'dark', label: 'Escuro', icon: Moon },
  { id: 'light', label: 'Claro', icon: Sun },
]

export function ProfileModal({ open, user, userName, onClose, onSignOut, onNameChange }: Props) {
  const fallbackName = user?.email?.split('@')[0] ?? 'Usuário'
  const displayEmail = user?.email ?? ''

  const supabase = useMemo(() => createClient(), [])

  const { theme, setTheme } = useTheme()
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(userName ?? fallbackName)
  const [savedName, setSavedName] = useState(userName ?? fallbackName)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!open || !user?.id) return

    supabase
      .from('user_profiles')
      .select('name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const name = data?.name ?? userName ?? fallbackName
        setSavedName(name)
        setNameValue(name)
      })
  }, [open, user?.id])

  const initial = savedName.charAt(0).toUpperCase()

  function handleClose() {
    setConfirmDelete(false)
    onClose()
  }

  async function handleSaveName() {
    const trimmed = nameValue.trim() || savedName
    setSavedName(trimmed)
    setEditingName(false)
    onNameChange?.(trimmed)

    if (user?.id) {
      await supabase
        .from('user_profiles')
        .upsert({ id: user.id, name: trimmed }, { onConflict: 'id' })
    }
  }

  async function handleDeleteAccount() {
    if (!user?.id) return
    setDeleting(true)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (!token) throw new Error('Sessão inválida.')

      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao excluir conta.')
      }
    } catch (err) {
      console.error('Erro ao deletar conta:', err)
    } finally {
     
      localStorage.clear()
      await supabase.auth.signOut().catch(() => {})
      onSignOut?.()
      handleClose()
      setDeleting(false)
    }
  }

  const content = (
    <div className="flex flex-col gap-1">

      <div className="flex justify-end px-4 pt-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
          className="p-1.5 rounded-xl cursor-pointer transition-opacity hover:opacity-80"
          style={{ color: 'var(--foreground-muted)' }}
        >
          <X size={18} />
        </motion.button>
      </div>

      <div className="flex flex-col items-center gap-3 py-2 px-4 pb-6">
        <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)]">
          <span className="text-black font-black text-2xl">{initial}</span>
        </div>
        <div className="text-center">
          <p className="font-black text-base tracking-tight" style={{ color: 'var(--foreground)' }}>{savedName}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>{displayEmail}</p>
        </div>
      </div>

      <div className="h-[1px] mx-4 mb-2" style={{ background: 'var(--border)' }} />

      <div className="px-4 mb-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1" style={{ color: 'var(--foreground-muted)' }}>Personalização</p>
        <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ background: 'var(--border)', border: '1px solid var(--border)' }}>
          {editingName ? (
            <>
              <input
                autoFocus
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                className="flex-1 bg-transparent text-sm font-bold outline-none"
                style={{ color: 'var(--foreground)' }}
                placeholder="Seu nome"
                maxLength={32}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSaveName}
                className="p-1.5 rounded-xl cursor-pointer"
                style={{ background: 'var(--accent-gold-bg)', border: '1px solid var(--accent-gold-border)', color: 'var(--accent-gold)' }}
              >
                <Check size={13} />
              </motion.button>
            </>
          ) : (
            <>
              <span className="flex-1 text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{savedName}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { setNameValue(savedName); setEditingName(true) }}
                className="p-1.5 rounded-xl transition-all cursor-pointer"
                style={{ color: 'var(--foreground-muted)' }}
              >
                <Pencil size={13} />
              </motion.button>
            </>
          )}
        </div>
      </div>

      <div className="px-4 mb-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1 mt-3" style={{ color: 'var(--foreground-muted)' }}>Aparência</p>
        <div className="flex gap-2">
          {themes.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(id)}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all cursor-pointer text-xs font-black uppercase tracking-wider"
              style={theme === id ? {
                background: 'var(--accent-gold-bg)',
                border: '1px solid var(--accent-gold-border)',
                color: 'var(--accent-gold)',
              } : {
                background: 'var(--border)',
                border: '1px solid var(--border)',
                color: 'var(--foreground-muted)',
              }}
            >
              <Icon size={16} />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="h-[1px] mx-4 mb-2" style={{ background: 'var(--border)' }} />

      {onSignOut && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => { onSignOut(); handleClose() }}
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all cursor-pointer"
            style={{ background: 'var(--border)', border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}
          >
            <LogOut size={15} />
            <span className="text-xs font-black uppercase tracking-wider">Sair da conta</span>
          </motion.button>

          {!confirmDelete ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all cursor-pointer"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
            >
              <Trash2 size={15} />
              <span className="text-xs font-black uppercase tracking-wider">Excluir conta</span>
            </motion.button>
          ) : (
            <div
              className="w-full flex flex-col gap-2 p-3.5 rounded-2xl"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <p className="text-xs font-black text-center" style={{ color: '#ef4444' }}>
                Isso apaga tudo. Sem volta.
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  style={{ background: 'var(--border)', color: 'var(--foreground-muted)' }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  style={{ background: '#ef4444', color: 'white', opacity: deleting ? 0.6 : 1 }}
                >
                  {deleting ? 'Apagando...' : 'Confirmar'}
                </motion.button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div onClick={handleClose} className="fixed inset-0 backdrop-blur-sm z-40" style={{ background: 'var(--overlay)' }} />
          <motion.div className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-[2rem] overflow-hidden" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
            {content}
          </motion.div>
          <motion.div className="hidden md:block fixed bottom-20 left-4 z-50 w-[300px] rounded-[2rem] overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {content}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
