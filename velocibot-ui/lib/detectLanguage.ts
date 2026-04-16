const LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
  javascript: [/\bfunction\b|\bconst\b|\blet\b|\bvar\b|\bimport\b|\bexport\b|\bclass\b|\basync\b|\bawait\b/],
  typescript: [/:\s*(?:string|number|boolean|any|void|interface|type)\b/],
  python: [/\bdef\b|\bclass\b|\bimport\b|\bfrom\b|\bif\s+__name__/],
  jsx: [/<\/?[A-Z][a-zA-Z0-9]*[\s>]/],
  html: [/<(?:html|head|body|div|span|p|h[1-6])\b/],
  css: [/\.[\w-]+\s*\{|#[\w-]+\s*\{|@media|@keyframes/],
  sql: [/\bSELECT\b|\bFROM\b|\bWHERE\b|\bJOIN\b|\bINSERT\b|\bUPDATE\b/i],
  bash: [/\b(?:echo|cat|ls|cd|mkdir|rm|grep|sed|awk)\b/],
  json: [/^\s*\{[\s\S]*\}\s*$|^\s*\[[\s\S]*\]\s*$/],
}

export function detectLanguage(code: string): string {
  const normalizedCode = code.trim()
  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(normalizedCode))) {
      return lang
    }
  }
  return 'plaintext'
}