export const detectMood = (text = '') => {
  const lower = text.toLowerCase()

  // 🔥 CRÍTICO
  if (
    lower.includes('production') ||
    lower.includes('prod') ||
    lower.includes('crash') ||
    lower.includes('down') ||
    lower.includes('duplicação') ||
    lower.includes('race condition') ||
    lower.includes('inconsistente')
  ) {
    return 'critical'
  }

  // ⚠️ SUSPEITO
  if (
    lower.includes('bug') ||
    lower.includes('erro') ||
    lower.includes('quebra') ||
    lower.includes('falha') ||
    lower.includes('weird') ||
    lower.includes('estranho')
  ) {
    return 'suspicious'
  }

  // 😴 ENTEDIADO (coisa simples ou genérica)
  if (
    lower.includes('como') ||
    lower.includes('help') ||
    lower.includes('dúvida') ||
    lower.includes('ajuda')
  ) {
    return 'bored'
  }

  return 'neutral'
}

export const getMoodStyle = (mood) => {
  switch (mood) {
    case 'critical':
      return {
        emoji: '🦖💀',
        tone: 'aggressive',
        intro: [
          'ok… isso aqui está perigoso de verdade',
          'isso aqui vai dar MUITO ruim, prepare o café',
          'já estou vendo produção pegando fogo e eu rindo',
        ]
      }

    case 'suspicious':
      return {
        emoji: '🦖',
        tone: 'alert',
        intro: [
          'hmm… isso aqui está estranho, e não no bom sentido',
          'isso não me cheira bem, parece amadorismo',
          'já vi esse tipo de erro dar muito ruim antes',
        ]
      }

    case 'bored':
      return {
        emoji: '🦖😴',
        tone: 'lazy',
        intro: [
          'ok… isso é básico demais, sério mesmo?',
          'isso aqui é tranquilo, até um estagiário resolveria',
          'nada muito assustador aqui, só falta de atenção',
        ]
      }

    default:
      return {
        emoji: '🦖',
        tone: 'neutral',
        intro: [
          'ok… vamos ver o que você aprontou aqui',
          'deixa eu dar uma olhada nessa obra de arte',
        ]
      }
  }
}