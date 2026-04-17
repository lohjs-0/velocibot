'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogOut, Sun, Moon, Monitor, Pencil, Check } from 'lucide-react'
import { useTheme } from 'next-themes'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

const supabase = createClient()

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

  const { theme, setTheme } = useTheme()
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(userName ?? fallbackName)
  const [savedName, setSavedName] = useState(userName ?? fallbackName)

  useEffect(() => {
    const newName = userName ?? fallbackName
    setSavedName(newName)
    setNameValue(newName)
  }, [user?.id])

  useEffect(() => {
    if (!open || !user?.id) return

    supabase
      .from('user_profiles')
      .select('name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.name) {
          setSavedName(data.name)
          setNameValue(data.name)
        } else {
          setSavedName(userName ?? fallbackName)
          setNameValue(userName ?? fallbackName)
        }
      })
  }, [open, user?.id])

  const initial = savedName.charAt(0).toUpperCase()

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

  const content = (
    <div className="flex flex-col gap-1">

      {/* Botão X */}
      <div className="flex justify-end px-4 pt-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
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
        <div className="px-4 pb-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => { onSignOut(); onClose() }}
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all cursor-pointer group"
            style={{ background: 'var(--border)', border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}
          >
            <LogOut size={15} />
            <span className="text-xs font-black uppercase tracking-wider">Sair da conta</span>
          </motion.button>
        </div>
      )}
    </div>
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div onClick={onClose} className="fixed inset-0 backdrop-blur-sm z-40" style={{ background: 'var(--overlay)' }} />
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

