'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Menu } from 'lucide-react'
import dynamic from 'next/dynamic'

import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/Sidebar'
import { AuthModal } from '@/components/AuthModal'
import { buildMarkdownComponents } from '@/components/MarkdownComponents'

const MessageList = dynamic(
  () => import('@/components/MessageList').then(mod => mod.MessageList),
  { ssr: false }
)

const ChatInput = dynamic(
  () => import('@/components/ChatInput').then(mod => mod.ChatInput),
  { ssr: false }
)

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null)
  const [attachedFileText, setAttachedFileText] = useState<string | undefined>(undefined)

  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  const { user, userName, loading: authLoading, signOut } = useAuth()
  const showAuthModal = mounted && !authLoading && !user

  const {
    input, setInput,
    messages,
    loading,
    copiedId,
    chats,
    currentChatId,
    deleteConfirmId, setDeleteConfirmId,
    bottomRef,
    textareaRef,
    handleCopy,
    handleShare,
    createNewChat,
    deleteChat,
    selectChat,
    sendMessage,
  } = useChat(user, userName)

  useEffect(() => { document.title = "VelociBot" }, [])

  const components = buildMarkdownComponents({ copiedId, onCopy: handleCopy })

  const handleAttach = (file: File, extractedText?: string) => {
    setAttachedFile(file)
    setAttachedFileText(extractedText)
    setAttachedPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null)
  }

  const handleRemoveAttachment = () => {
    if (attachedPreview) URL.revokeObjectURL(attachedPreview)
    setAttachedFile(null)
    setAttachedFileText(undefined)
    setAttachedPreview(null)
  }

  const handleSend = async (overrideInput?: string) => {
    const messageContent = attachedFileText
      ? `Conteúdo do arquivo ${attachedFile?.name || ''}:\n\n${attachedFileText}\n\n${overrideInput || input}`
      : (overrideInput || input)

    await sendMessage(messageContent, attachedFile)
    handleRemoveAttachment()
  }

  return (
    <div
      className="h-[100dvh] flex overflow-hidden font-sans cursor-default"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[140px] rounded-full"
          style={{ background: 'var(--glow-bg)' }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[140px] rounded-full"
          style={{ background: 'var(--glow-bg)' }}
        />
      </div>

      <AnimatePresence>
        {showAuthModal && <AuthModal />}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-md z-[45] md:hidden cursor-pointer"
            style={{ background: 'var(--overlay)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
            style={{ background: 'var(--overlay)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="p-8 rounded-[2.5rem] max-w-sm w-full relative overflow-hidden"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--accent-gold-border)',
                boxShadow: '0 0 60px rgba(234,179,8,0.15)'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: 'var(--accent-gold-bg)',
                    border: '1px solid var(--accent-gold-border)',
                    color: 'var(--accent-gold)'
                  }}
                >
                  <AlertTriangle size={32} />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Excluir conversa?</h3>
                <p className="mb-8 leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                  Esta ação é permanente e apagará todo o histórico deste chat.
                </p>
                <div className="flex gap-3 w-full">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 py-4 rounded-2xl transition-all font-bold text-sm cursor-pointer"
                    style={{ background: 'var(--border)', color: 'var(--foreground-muted)' }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { deleteChat(deleteConfirmId); setDeleteConfirmId(null) }}
                    className="flex-1 py-4 rounded-2xl transition-all font-bold text-sm shadow-lg text-black cursor-pointer"
                    style={{ background: 'var(--accent-gold)', boxShadow: '0 4px 20px rgba(234,179,8,0.2)' }}
                  >
                    Excluir
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-[50] h-full
        transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${sidebarOpen ? 'translate-x-0 md:w-[300px]' : '-translate-x-full md:w-0 md:overflow-hidden'}
      `}>
        <Sidebar
          open={sidebarOpen}
          chats={chats}
          currentChatId={currentChatId}
          user={user}
          userName={userName}
          onNewChat={() => { createNewChat(); setSidebarOpen(false) }}
          onSelectChat={(chat) => { selectChat(chat); setSidebarOpen(false) }}
          onDeleteRequest={setDeleteConfirmId}
          onClose={() => setSidebarOpen(false)}
          onSignOut={signOut}
        />
      </div>

      <div className="flex-1 flex flex-col relative min-w-0 z-10" style={{ background: 'transparent' }}>
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-auto flex flex-col border-b z-[60] flex-shrink-0 py-4 backdrop-blur-3xl"
          style={{ background: 'var(--header-bg)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center px-4 md:px-8 w-full">
            <div className="flex items-center gap-3 md:gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(prev => !prev)}
                className="p-2.5 md:p-3 rounded-2xl transition-all cursor-pointer"
                style={{ border: '1px solid var(--border)' }}
              >
                {sidebarOpen
                  ? <X size={20} style={{ color: 'var(--foreground-muted)' }} />
                  : <Menu size={20} style={{ color: 'var(--foreground-muted)' }} />
                }
              </motion.button>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-500 rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(234,179,8,0.3)]">
                  <img src="/icon.jpeg" alt="VelociBot" className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                  <h2 className="font-black text-sm tracking-tighter leading-none uppercase" style={{ color: 'var(--foreground)' }}>VelociBot</h2>
                  <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--accent-gold)' }}>Dev Sênior Assistant</span>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 overflow-y-auto px-3 md:px-6 py-6 md:py-12 custom-scrollbar min-h-0">
          <div className="max-w-3xl mx-auto w-full flex flex-col items-center">
            <div className="w-full">
              <MessageList
                messages={messages}
                loading={loading}
                copiedId={copiedId}
                components={components}
                bottomRef={bottomRef}
                onCopy={handleCopy}
                onShare={handleShare}
                onSuggestion={handleSend}
                onEdit={(text) => setInput(text)}
              />
            </div>
          </div>
        </main>

        {/* Preview de anexo */}
        <AnimatePresence>
          {attachedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-4 md:px-8 pb-2"
            >
              <div className="max-w-3xl mx-auto">
                <div
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 w-fit"
                  style={{ background: 'var(--surface-3)', border: '1px solid var(--border-muted)' }}
                >
                  {attachedPreview ? (
                    <img src={attachedPreview} alt="preview" className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black uppercase"
                      style={{ background: 'var(--accent-gold-bg)', border: '1px solid var(--accent-gold-border)', color: 'var(--accent-gold)' }}
                    >
                      {attachedFile.name.split('.').pop() || 'FILE'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate max-w-[180px]" style={{ color: 'var(--foreground-muted)' }}>{attachedFile.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--foreground-subtle)' }}>{(attachedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRemoveAttachment}
                    className="ml-2 p-1.5 rounded-lg transition-all cursor-pointer"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <X size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="z-10">
          <ChatInput
            input={input}
            loading={loading}
            hasAttachment={!!attachedFile}
            textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
            onChange={setInput}
            onSend={handleSend}
            onAttach={handleAttach}
            onScreenshot={() => {}}
          />
        </div>
      </div>
    </div>
  )
}