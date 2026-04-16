'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import {
  Copy, Share2, CheckCircle2, Send, Sparkles, Pencil,
  ThumbsUp, ThumbsDown, FileText, FileImage, File
} from 'lucide-react'
import type { Message as BaseMessage } from '@/types/chat'
import type { Components } from 'react-markdown'
import { SUGGESTIONS } from '@/constants/suggestions'
import 'katex/dist/katex.min.css'

interface Message extends BaseMessage {
  files?: string[]
}

interface Props {
  messages: Message[]
  loading: boolean
  copiedId: number | null
  components: Components
  bottomRef: React.RefObject<HTMLDivElement | null>
  onCopy: (text: string, id: number) => void
  onShare: (text: string) => void
  onSuggestion: (prompt: string) => void
  onEdit?: (text: string, index: number) => void
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Bom dia! Cedo assim??'
  if (hour >= 12 && hour < 18) return 'Boa tarde, mal consegui almoçar e você já está aqui perturbando!'
  if (hour >= 18 && hour < 24) return 'Boa noite, apenas para mulheres!'
  return 'Você não dorme não?! Bebeu umas 6 latas de Monster certeza.'
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext ?? '')) return <FileImage size={13} />
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext ?? '')) return <FileText size={13} />
  return <File size={13} />
}

function FileBadge({ name }: { name: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold w-fit"
      style={{ background: 'var(--border)', border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}>
      <FileIcon name={name} />
      <span className="max-w-[180px] truncate">{name}</span>
    </div>
  )
}

function ActionBtn({
  onClick, active = false, activeColor, children,
}: {
  onClick: () => void
  active?: boolean
  activeColor?: string
  children: React.ReactNode
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
      style={{
        background: active && activeColor ? `${activeColor}18` : 'var(--border)',
        border: `1px solid ${active && activeColor ? activeColor : 'var(--border)'}`,
        color: active && activeColor ? activeColor : 'var(--foreground-muted)',
      }}>
      {children}
    </motion.button>
  )
}

function ThinkingIndicator() {
  return (
    <div className="flex gap-4 items-start">
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-1 overflow-hidden shadow-lg"
        style={{ background: 'var(--accent-gold-bg)', border: '1px solid var(--accent-gold-border)' }}>
        <img src="/icon.jpeg" alt="VelociBot" className="w-full h-full object-cover rounded-full" />
      </div>
      <div className="flex flex-col gap-2">
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="text-[12px] font-black uppercase tracking-widest"
          style={{ color: 'var(--accent-gold)' }}>
          VelociBot está pensando, rawwr! 🦖
        </motion.p>
        <div
          className="flex items-center gap-1.5 px-4 py-3 rounded-[1.5rem] rounded-tl-sm w-fit"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--accent-gold)' }}
              animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function MessageList({
  messages, loading, copiedId, components, bottomRef,
  onCopy, onShare, onSuggestion, onEdit,
}: Props) {
  const [reactions, setReactions] = useState<Record<number, 'like' | 'dislike' | null>>({})

  function toggleReaction(idx: number, type: 'like' | 'dislike') {
    setReactions(prev => ({ ...prev, [idx]: prev[idx] === type ? null : type }))
  }

  if (messages.length === 0) {
    const greeting = getGreeting()
    return (
      <div className="flex flex-col items-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="relative inline-block mb-10">
            <div className="absolute inset-0 blur-[60px] rounded-full animate-pulse pointer-events-none" style={{ background: 'var(--accent-gold-bg)' }} />
            <div
              className="relative w-32 h-32 rounded-full flex items-center justify-center border overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <img src="/icon.jpeg" alt="VelociBot" className="w-full h-full object-cover rounded-full scale-110" />
            </div>
            <div
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-500 rounded-2xl flex items-center justify-center text-black shadow-lg border-4"
              style={{ borderColor: 'var(--background)' }}>
              <Sparkles size={18} />
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base font-semibold mb-2 tracking-wide"
            style={{ color: 'var(--accent-gold)' }}>
            {greeting}
          </motion.p>

          <h1
            className="text-5xl md:text-6xl font-black mb-4 tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, var(--accent-gold-light) 0%, var(--accent-gold) 50%, var(--accent-gold) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            VelociBot
          </h1>

          <p className="text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
            Seu dinossauro dev favorito
          </p>
        </motion.div>

        {/* Dino centralizado entre título e cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center items-center w-full mb-10"
        >
          <img
            src="/dino2.gif"
            alt="Dino"
            className="w-48 h-48 md:w-56 md:h-56 object-contain mix-blend-screen opacity-80"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full max-w-3xl">
          {SUGGESTIONS.map((sug, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onSuggestion(sug.prompt)}
              className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-0 p-3 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] transition-all text-left group relative overflow-hidden cursor-pointer backdrop-blur-sm shadow-xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="hidden md:block absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black shadow-lg">
                  <Send size={16} />
                </div>
              </div>
              <div className="flex-shrink-0 p-2 md:p-3 md:mb-6 rounded-xl md:rounded-2xl transition-colors" style={{ background: 'var(--border)', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--foreground-muted)' }}>{sug.icon}</div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm md:text-lg md:mb-2 transition-colors truncate" style={{ color: 'var(--foreground)' }}>{sug.title}</span>
                <span className="text-xs md:text-sm leading-relaxed font-medium line-clamp-1 md:line-clamp-none" style={{ color: 'var(--foreground-muted)' }}>{sug.desc}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  const lastMsg = messages[messages.length - 1]
  const isThinking = loading && lastMsg?.role === 'bot' && lastMsg?.content === ''

  return (
    <div className="space-y-10 pb-20">
      {messages.map((msg, i) => {
        const isEmptyBot = msg.role === 'bot' && msg.content === '' && i === messages.length - 1 && loading
        if (isEmptyBot) return null

        const reaction = reactions[i] ?? null

        return (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="group">

            {/* ── USUÁRIO ─────────────────────────────────────────────── */}
            {msg.role === 'user' && (
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-start gap-3 max-w-[85%] md:max-w-[75%]">
                  <div
                    className="flex flex-col gap-2 px-6 py-4 rounded-[2rem] rounded-tl-lg text-[15px] leading-relaxed font-medium shadow-xl"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                    {msg.files && msg.files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-1">
                        {msg.files.map((f: string, fi: number) => (
                          <FileBadge key={fi} name={f} />
                        ))}
                      </div>
                    )}
                    {msg.image && (
                      <img
                        src={msg.image} alt="Imagem enviada"
                        className="max-w-[260px] max-h-[260px] rounded-2xl object-cover"
                        style={{ border: '1px solid var(--border)' }} />
                    )}
                    {msg.content && (
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={components}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  <ActionBtn onClick={() => onCopy(msg.content, i)} active={copiedId === i} activeColor="var(--accent-gold)">
                    {copiedId === i
                      ? <><CheckCircle2 size={11} /><span>Copiado</span></>
                      : <><Copy size={11} /><span>Copiar</span></>
                    }
                  </ActionBtn>
                  <ActionBtn onClick={() => onEdit?.(msg.content, i)}>
                    <Pencil size={11} /><span>Editar</span>
                  </ActionBtn>
                  <ActionBtn onClick={() => onShare(msg.content)}>
                    <Share2 size={11} /><span>Compartilhar</span>
                  </ActionBtn>
                </div>
              </div>
            )}

            {/* ── BOT ─────────────────────────────────────────────────── */}
            {msg.role === 'bot' && (
              <div className="flex gap-4 items-start">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-1 overflow-hidden shadow-lg"
                  style={{ background: 'var(--accent-gold-bg)', border: '1px solid var(--accent-gold-border)' }}>
                  <img src="/icon.jpeg" alt="VelociBot" className="w-full h-full object-cover rounded-full" />
                </div>

                <div className="flex-1 min-w-0 group/bot">
                  <div className="text-[15px] leading-relaxed prose-invert" style={{ color: 'var(--foreground)' }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        ...components,
                        code: (props) => {
                          const { node: _node, ...rest } = props
                          const CodeComp = components.code as React.ComponentType<React.HTMLAttributes<HTMLElement> & { messageIndex?: number }>
                          return CodeComp ? <CodeComp {...rest} messageIndex={i} /> : <code {...rest} />
                        }
                      }}>
                      {msg.content}
                    </ReactMarkdown>
                    {loading && i === messages.length - 1 && msg.content !== '' && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="inline-block w-[3px] h-[1.1em] ml-1 align-middle rounded-sm"
                        style={{ background: 'var(--accent-gold)', boxShadow: '0 0 8px rgba(234,179,8,0.8)' }} />
                    )}
                  </div>

                  {msg.content && (
                    <div className="flex flex-wrap gap-1.5 mt-4 opacity-0 group-hover/bot:opacity-100 transition-all duration-300 translate-y-1 group-hover/bot:translate-y-0">
                      <ActionBtn onClick={() => onCopy(msg.content, i)} active={copiedId === i} activeColor="var(--accent-gold)">
                        {copiedId === i
                          ? <><CheckCircle2 size={11} /><span>Copiado</span></>
                          : <><Copy size={11} /><span>Copiar</span></>
                        }
                      </ActionBtn>
                      <ActionBtn onClick={() => onShare(msg.content)}>
                        <Share2 size={11} /><span>Compartilhar</span>
                      </ActionBtn>
                      <ActionBtn onClick={() => toggleReaction(i, 'like')} active={reaction === 'like'} activeColor="#22c55e">
                        <ThumbsUp size={11} /><span>Curti</span>
                      </ActionBtn>
                      <ActionBtn onClick={() => toggleReaction(i, 'dislike')} active={reaction === 'dislike'} activeColor="#ef4444">
                        <ThumbsDown size={11} /><span>Não curti</span>
                      </ActionBtn>
                    </div>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        )
      })}

      {isThinking && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <ThinkingIndicator />
        </motion.div>
      )}
      <div ref={bottomRef} className="h-4" />
    </div>
  )
}