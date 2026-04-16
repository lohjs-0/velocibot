'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, MessageSquare, X } from 'lucide-react'
import type { Chat } from '@/types/chat'
import type { User } from '@supabase/supabase-js'
import { ProfileModal } from './ProfileModal'

interface Props {
  open: boolean
  chats: Chat[]
  currentChatId: string | null
  user?: User | null
  userName?: string | null
  onNewChat: () => void
  onSelectChat: (chat: Chat) => void
  onDeleteRequest: (id: string) => void
  onClose?: () => void
  onSignOut?: () => void
}

export function Sidebar({ open, chats, currentChatId, user, userName, onNewChat, onSelectChat, onDeleteRequest, onClose, onSignOut }: Props) {
  const [profileOpen, setProfileOpen] = useState(false)

  // ✅ Chave isolada por user.id — evita vazamento entre contas
  const storageKey = user?.id ? `velocibot_username_${user.id}` : null

  const [localName, setLocalName] = useState<string | null>(() => {
    if (typeof window === 'undefined' || !storageKey) return null
    return localStorage.getItem(storageKey)
  })

  const displayName = localName ?? userName ?? user?.email?.split('@')[0] ?? 'Usuário'
  const displayEmail = user?.email ?? ''
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <>
      <div
        className="w-[280px] md:w-[300px] h-full flex flex-col overflow-hidden relative z-20 transition-all duration-300 ease-in-out"
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="p-4 md:p-6 pt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="md:hidden mb-4 p-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2"
            style={{ background: 'var(--border)', border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}
          >
            <X size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest">Fechar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewChat}
            className="w-full rounded-[1.5rem] py-4 flex items-center justify-center gap-3 transition-all group relative overflow-hidden cursor-pointer shadow-lg"
            style={{ background: 'var(--border)', border: '1px solid var(--border)' }}
          >
            <div className="w-8 h-8 bg-yellow-500 rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(234,179,8,0.3)] group-hover:rotate-90 transition-transform duration-500">
              <Plus size={18} strokeWidth={3} />
            </div>
            <span className="font-black text-xs uppercase tracking-[0.1em]" style={{ color: 'var(--foreground)' }}>Nova conversa</span>
          </motion.button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 md:px-4 space-y-1.5 custom-scrollbar pb-4">
          <div className="px-3 mb-6 mt-4 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: 'var(--foreground-subtle)' }}>Histórico</span>
            <div className="h-[1px] flex-1 ml-4" style={{ background: 'var(--border)' }} />
          </div>

          {chats.length === 0 ? (
            <div className="px-4 py-12 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--border)', color: 'var(--foreground-subtle)' }}>
                <MessageSquare size={20} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--foreground-subtle)' }}>Vazio</p>
            </div>
          ) : (
            chats.map(chat => (
              <motion.div
                key={chat.id}
                whileHover={{ x: 4 }}
                className="group flex items-center justify-between p-3.5 md:p-4 rounded-[1.25rem] cursor-pointer transition-all duration-300 relative overflow-hidden"
                style={currentChatId === chat.id ? {
                  background: 'var(--accent-gold-bg)',
                  border: '1px solid var(--accent-gold-border)',
                } : {
                  border: '1px solid transparent',
                }}
                onClick={() => onSelectChat(chat)}
              >
                {currentChatId === chat.id && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 rounded-r-full shadow-[0_0_10px_rgba(234,179,8,0.8)]"
                    style={{ background: 'var(--accent-gold)' }}
                  />
                )}
                <div className="flex items-center gap-3 md:gap-4 truncate flex-1 min-w-0 pl-2">
                  <span
                    className="truncate text-sm font-bold tracking-tight"
                    style={{ color: currentChatId === chat.id ? 'var(--foreground)' : 'var(--foreground-muted)' }}
                  >
                    {chat.title}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); onDeleteRequest(chat.id) }}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all hover:text-red-400 cursor-pointer"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  <Trash2 size={14} />
                </motion.button>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer — perfil clicável */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--glass-bg)' }}>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setProfileOpen(true)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl transition-colors cursor-pointer"
            style={{ background: 'transparent' }}
          >
            <div className="w-9 h-9 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <span className="text-black font-black text-sm">{initial}</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0 text-left">
              <span className="text-xs font-black tracking-tight truncate" style={{ color: 'var(--foreground)' }}>{displayName}</span>
              <span className="text-[10px] truncate" style={{ color: 'var(--foreground-muted)' }}>{displayEmail}</span>
            </div>
            <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-gold-border)' }} />
          </motion.button>
        </div>
      </div>

      <ProfileModal
        open={profileOpen}
        user={user}
        userName={displayName}
        onClose={() => setProfileOpen(false)}
        onSignOut={onSignOut}
        onNameChange={(name) => {
          // ✅ Salva isolado por user.id
          if (storageKey) localStorage.setItem(storageKey, name)
          setLocalName(name)
        }}
      />
    </>
  )
}