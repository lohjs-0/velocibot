'use client'
import { useRef, useState, useEffect } from 'react'
import { Send, Plus, Image, ScanLine, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as mammoth from 'mammoth'

interface Props {
  input: string
  loading: boolean
  hasAttachment?: boolean
  textareaRef: React.RefObject<HTMLTextAreaElement>
  onChange: (value: string) => void
  onSend: () => void
  onAttach?: (file: File, extractedText?: string) => void
  onScreenshot?: () => void
}

const MENU_ITEMS = [
  { label: 'Importar imagem', sub: 'JPG, PNG, GIF, WEBP', id: 'image' },
  { label: 'Captura de tela', sub: 'Screenshot da tela', id: 'screenshot' },
  { label: 'Importar documento', sub: 'PDF, DOCX, TXT', id: 'doc' },
] as const

export function ChatInput({
  input,
  loading,
  hasAttachment = false,
  textareaRef,
  onChange,
  onSend,
  onAttach,
  onScreenshot
}: Props) {
  const canSend = (input.trim() || hasAttachment) && !loading
  const [menuOpen, setMenuOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (canSend) onSend()
    }
  }

  const handleSend = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (canSend) onSend()
  }

  const extractTextFromFile = async (file: File): Promise<string | undefined> => {
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'pdf') {
      if (typeof window === 'undefined') return undefined

      try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf')

        pdfjs.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

        const buffer = await file.arrayBuffer()
        const pdf = await pdfjs.getDocument({ data: buffer }).promise

        let text = ''

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()

          const pageText = content.items
            .map((item: unknown) => {
              const t = item as { str?: string }
              return t.str || ''
            })
            .join(' ')

          text += pageText + ' '
        }

        return text.trim()
      } catch (err) {
        console.error(err)
        return 'Erro ao processar o PDF.'
      }
    }

    if (ext === 'docx') {
      const buffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer: buffer })
      return result.value
    }

    if (ext === 'txt') {
      return await file.text()
    }

    return undefined
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file && onAttach) {
      if (file.type.startsWith('image/')) {
        onAttach(file)
      } else {
        const text = await extractTextFromFile(file)
        onAttach(file, text)
      }
    }

    e.target.value = ''
    setMenuOpen(false)
  }

  const handleMenuAction = (id: typeof MENU_ITEMS[number]['id']) => {
    if (id === 'image') imageInputRef.current?.click()
    if (id === 'doc') docInputRef.current?.click()
    if (id === 'screenshot') onScreenshot?.()
    setMenuOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div
      className="px-4 md:px-8 pb-6 md:pb-10 pt-2"
      style={{ background: 'linear-gradient(to top, var(--background) 70%, transparent)' }}
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative flex items-end gap-2 md:gap-4 p-2.5 md:p-3.5 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-500 backdrop-blur-2xl"
          style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--border)',
            boxShadow: '0 0 40px var(--shadow-color)'
          }}
        >
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileChange} />

          <div ref={menuRef} className="relative flex-shrink-0 mb-0.5">
            <motion.button
              type="button"
              onClick={() => setMenuOpen(prev => !prev)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 mb-0.5"
              style={menuOpen ? {
                background: 'var(--accent-gold-bg)',
                border: '1px solid var(--accent-gold-border)',
                color: 'var(--accent-gold)',
              } : {
                background: 'var(--border)',
                border: '1px solid var(--border)',
                color: 'var(--foreground-muted)',
              }}
            >
              <motion.div animate={{ rotate: menuOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                <Plus size={18} />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 8 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                  className="absolute bottom-full left-0 mb-3 w-56 rounded-2xl overflow-hidden z-50"
                  style={{
                    background: 'var(--surface-3)',
                    border: '1px solid var(--border-muted)',
                    boxShadow: '0 8px 40px var(--shadow-color)'
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
                  {MENU_ITEMS.map((item) => (
                    <motion.button
                      key={item.id}
                      type="button"
                      onClick={() => handleMenuAction(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer group"
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0"
                        style={{ background: 'var(--border)', border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}
                      >
                        {item.id === 'image' && <Image size={16} />}
                        {item.id === 'screenshot' && <ScanLine size={16} />}
                        {item.id === 'doc' && <FileText size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-none mb-0.5" style={{ color: 'var(--foreground)' }}>{item.label}</p>
                        <p className="text-[11px]" style={{ color: 'var(--foreground-muted)' }}>{item.sub}</p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mensagem para o VelociBot..."
            className="flex-1 bg-transparent border-none py-1.5 focus:outline-none focus:ring-0 resize-none max-h-[120px] md:max-h-[160px] font-medium leading-relaxed custom-scrollbar text-[15px] cursor-text"
            style={{ outline: 'none', boxShadow: 'none', color: 'var(--foreground)' }}
          />

          <motion.button
            type="button"
            onClick={handleSend}
            onPointerDown={(e) => e.preventDefault()}
            disabled={!canSend}
            whileHover={canSend ? { scale: 1.05 } : {}}
            whileTap={canSend ? { scale: 0.95 } : {}}
            className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 mb-0.5"
            style={canSend ? {
              background: 'var(--accent-gold)',
              color: 'black',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(234,179,8,0.2)'
            } : {
              background: 'var(--border)',
              color: 'var(--foreground-subtle)',
              cursor: 'not-allowed'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={canSend ? 'active' : 'inactive'}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Send size={18} />
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-[10px] font-medium tracking-widest uppercase mt-2 md:mt-3"
          style={{ color: 'var(--foreground-subtle)' }}
        >
          VelociBot pode cometer erros — sempre verifique informações importantes
          {' · '}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--foreground-subtle)' }}
          >
            Privacidade
          </a>
        </motion.p>
      </div>
    </div>
  )
}