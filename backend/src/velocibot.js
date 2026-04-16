function mood(quality = 'normal') {
  const normal = [
    "temos alguns pontos técnicos para ajustar aqui",
    "você considerou como isso vai escalar no mundo real?",
    "uma escolha interessante, mas podemos otimizar bastante",
    "isso pode trazer problemas em produção se não cuidarmos agora",
    "já vi esse padrão antes — costuma dar dor de cabeça no banco de dados",
    "encontrei alguns pontos que precisam de atenção imediata",
    "analisando com cuidado para garantir que nada quebre",
    "podemos deixar isso bem mais robusto com alguns ajustes",
    "clássico detalhe que passa batido sem uma revisão minuciosa",
    "vamos refinar isso para evitar surpresas desagradáveis",
    "precisamos garantir que isso suporte a carga em produção",
    "li seu código e tenho algumas sugestões de melhoria",
    "isso aqui é uma solução temporária que pode virar definitiva se não cuidarmos",
    "vamos dar uma olhada crítica para elevar o nível desse código",
    "pô rapaz, essa parte aqui merece um pouco mais de carinho",
    "podia ser mais eficiente se a gente pensasse na escalabilidade",
    "vamos ajustar isso para que veja a luz do dia em produção com segurança"
  ]

  const excellent = [
    "limpo, elegante e funcional — finalmente algo de alto nível",
    "finalmente alguém que sabe o que está fazendo por aqui, mandou bem",
    "isso aqui está muito bem resolvido, parabéns pela execução",
    "nível sênior de verdade, código que dá gosto de ler",
    "raro ver algo tão bem pensado e executado. continue assim, fera"
  ]

  if (quality === 'excellent') {
    return excellent[Math.floor(Math.random() * excellent.length)]
  }

  return normal[Math.floor(Math.random() * normal.length)]
}

function greet(username) {
  const greetings = [
    `🦖 fala, ${username}! bora codar?`,
    `🦖 oi, ${username}, tudo certo?`,
    `🦖 ${username}, vamos elevar o nível desse código`,
    `🦖 e aí, ${username}, pronto para a revisão?`
  ]
  return greetings[Math.floor(Math.random() * greetings.length)]
}

const issueReactions = [
  "vou analisar esses pontos agora mesmo",
  "deixa eu entender o contexto desse problema aqui",
  "vou olhar isso com calma para acharmos a melhor solução",
  "abrindo o microscópio para garantir a qualidade técnica"
]

const prReactions = [
  "deixa eu revisar isso para garantirmos um merge seguro",
  "vou dar uma olhada para manter a main sempre estável",
  "analisando para que o cliente receba a melhor experiência",
  "abrindo o diff agora. vamos deixar isso impecável"
]

const staleReactions = [
  "essa tarefa está parada há um tempo, vamos dar um gás nela?",
  "issue aberta é oportunidade de melhoria esperando para acontecer",
  "isso aqui está acumulando poeira — bora resolver ou planejar o próximo passo?",
  "tempo demais parado. alguém precisa de ajuda para destravar isso aqui?"
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const generateThanksResponse = (username) => {
  const responses = [
    `🦖 tamo junto, ${username}! qualquer coisa é só gritar`,
    `🦖 de nada, ${username}! fico feliz em ajudar a evoluir o código`,
    `🦖 sempre que precisar de uma revisão real, conte comigo, ${username}`,
    `🦖 disponha! agora bora fazer esse sistema rodar liso, ${username}`
  ]
  return pick(responses)
}

export const generateIssueComment = async (issue, username, quality = 'normal') => {
  return `${greet(username)}
${mood(quality)}
"${issue.title}"
${pick(issueReactions)}`
}

export const generatePRComment = async (pr, username, quality = 'normal') => {
  return `${greet(username)}
${mood(quality)}
${pick(prReactions)}`
}

export const generateStaleComment = async (title, username) => {
  return `${greet(username)}
isso está parado há mais tempo do que o ideal
"${title}"
${pick(staleReactions)}`
}