import { motion } from 'framer-motion'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, CheckCircle2, Terminal, FunctionSquare } from 'lucide-react'
import type { Components } from 'react-markdown'
import { detectLanguage } from '@/lib/detectLanguage'
import 'katex/dist/katex.min.css'

interface Props {
  copiedId: number | null
  onCopy: (text: string, id: number) => void
  messageIndex?: number
}

export function buildMarkdownComponents({ copiedId, onCopy, messageIndex }: Props): Components {
  return {
    code({ children, className, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      const explicitLang = match?.[1]
      const codeContent = String(children).replace(/\n$/, '')
      const lang = explicitLang || detectLanguage(codeContent)
      const isInline = !match && !explicitLang

      if (isInline) {
        return (
          <code style={{ background: 'var(--accent-gold-bg)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold-border)' }} className="px-1.5 py-0.5 rounded-md font-mono text-[13px]">
            {children}
          </code>
        )
      }

      const currentId = messageIndex !== undefined ? messageIndex : Math.random()

      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-6 rounded-2xl overflow-hidden shadow-2xl group/code"
          style={{ border: '1px solid var(--border)', background: 'var(--code-bg)' }}
        >
          <div className="flex items-center justify-between px-4 py-2.5" style={{ background: 'var(--code-header)', borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
              </div>
              <div className="h-4 w-[1px] mx-1" style={{ background: 'var(--border)' }} />
              <div className="flex items-center gap-2">
                <Terminal size={14} style={{ color: 'var(--accent-gold)' }} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--foreground-muted)' }}>{lang}</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCopy(codeContent, currentId as number)}
              className="flex items-center gap-2 px-3 py-1 rounded-lg transition-all cursor-pointer"
              style={{ color: 'var(--foreground-muted)' }}
            >
              {copiedId === currentId
                ? <><CheckCircle2 size={14} style={{ color: 'var(--accent-gold)' }} /><span className="text-[10px] font-bold uppercase" style={{ color: 'var(--accent-gold)' }}>Copiado</span></>
                : <><Copy size={14} /><span className="text-[10px] font-bold uppercase">Copiar</span></>
              }
            </motion.button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <SyntaxHighlighter
              language={lang}
              style={atomDark}
              customStyle={{
                margin: 0,
                padding: '1.5rem',
                background: 'transparent',
                fontSize: '13px',
                lineHeight: '1.7',
                fontFamily: 'var(--font-mono, monospace)'
              }}
              showLineNumbers={codeContent.split('\n').length > 3}
              lineNumberStyle={{ color: 'rgba(255, 255, 255, 0.1)', paddingRight: '1.5rem', minWidth: '2.5rem', textAlign: 'right' }}
            >
              {codeContent}
            </SyntaxHighlighter>
          </div>
        </motion.div>
      )
    },

    span: ({ children, className }) => {
      if (className?.includes('katex')) return <span style={{ color: 'var(--accent-gold)' }} className="font-medium">{children}</span>
      return <span className={className}>{children}</span>
    },

    div: ({ children, className }) => {
      if (className?.includes('math-display')) {
        return (
          <div className="my-8 p-6 rounded-2xl flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(234,179,8,0.02)] relative overflow-hidden" style={{ background: 'var(--accent-gold-bg)', border: '1px solid var(--accent-gold-border)' }}>
            <div className="absolute top-3 left-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--accent-gold)' }}>
              <FunctionSquare size={12} />
              Equação
            </div>
            <div className="text-lg md:text-xl overflow-x-auto max-w-full py-4" style={{ color: 'var(--foreground)' }}>{children}</div>
          </div>
        )
      }
      return <div className={className}>{children}</div>
    },

    p: ({ children }) => <p className="mb-5 last:mb-0 leading-relaxed text-[15px]" style={{ color: 'var(--foreground)' }}>{children}</p>,
    ul: ({ children }) => <ul className="space-y-3 mb-6 ml-6 list-disc marker:text-yellow-500/50">{children}</ul>,
    ol: ({ children }) => <ol className="space-y-3 mb-6 ml-6 list-decimal marker:text-yellow-500/50 marker:font-bold">{children}</ol>,
    li: ({ children }) => <li className="text-[15px] pl-1" style={{ color: 'var(--foreground)' }}>{children}</li>,
    h1: ({ children }) => <h1 className="text-3xl font-black mb-6 mt-8 tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-bold mb-4 mt-8 pb-2 tracking-tight" style={{ color: 'var(--foreground)', borderBottom: '1px solid var(--border)' }}>{children}</h2>,
    h3: ({ children }) => (
      <h3 className="text-xl font-bold mb-4 mt-6 flex items-center gap-2 tracking-tight" style={{ color: 'var(--foreground)' }}>
        <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.6)]" style={{ background: 'var(--accent-gold)' }} />
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="px-6 py-4 rounded-r-2xl my-6 italic text-[15px] leading-relaxed" style={{ borderLeft: '4px solid var(--accent-gold-border)', background: 'var(--accent-gold-bg)', color: 'var(--foreground-muted)' }}>
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-8 rounded-2xl shadow-xl" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <table className="w-full text-sm border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead style={{ background: 'var(--border)', borderBottom: '1px solid var(--border)' }}>{children}</thead>,
    tr: ({ children }) => <tr className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>{children}</tr>,
    th: ({ children }) => <th className="px-5 py-4 text-left font-black text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--accent-gold)' }}>{children}</th>,
    td: ({ children }) => <td className="px-5 py-4 leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>{children}</td>,
    hr: () => <hr className="my-8" style={{ borderColor: 'var(--border)' }} />,
    a: ({ children, href }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 transition-all font-bold" style={{ color: 'var(--accent-gold)', textDecorationColor: 'var(--accent-gold-border)' }}>
        {children}
      </a>
    ),
    img: ({ src, alt }) => (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="my-8">
        <img src={src} alt={alt} className="max-w-full h-auto rounded-2xl shadow-2xl mx-auto" style={{ border: '1px solid var(--border)' }} />
        {alt && <p className="text-center text-[11px] mt-3 uppercase tracking-widest font-bold" style={{ color: 'var(--foreground-muted)' }}>{alt}</p>}
      </motion.div>
    ),
  }
}