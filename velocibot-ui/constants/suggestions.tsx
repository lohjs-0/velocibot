import { Sparkles, Code, Zap, MessageSquare } from 'lucide-react'

function getDynamicSuggestions() {
  const hour = new Date().getHours()

  // manhã
  if (hour >= 5 && hour < 12) {
    return [
      {
        title: "Modo foco matinal ☀️",
        desc: "Começar o dia sem procrastinar",
        icon: <Zap className="text-purple-400" size={20} />,
        prompt: "Me ajuda a montar uma rotina produtiva de estudos de programação para começar bem o dia."
      },
      {
        title: "Modo aprendizado 🧠",
        desc: "Aprender algo novo hoje",
        icon: <Sparkles className="text-yellow-400" size={20} />,
        prompt: "Explique um conceito importante de programação de forma simples e prática."
      },
      {
        title: "Modo prática 💻",
        desc: "Treinar código de verdade",
        icon: <Code className="text-blue-400" size={20} />,
        prompt: "Me passe um exercício prático de programação com desafio real e depois corrija minha resposta."
      },
      {
        title: "Modo ideias 🚀",
        desc: "Ideias pra projetos",
        icon: <MessageSquare className="text-green-400" size={20} />,
        prompt: "Me dê ideias de projetos simples e úteis para melhorar meu portfólio como dev."
      }
    ]
  }

  // tarde
  if (hour >= 12 && hour < 18) {
    return [
      {
        title: "Modo dev ativo 💻",
        desc: "Bora codar sem dor",
        icon: <Code className="text-blue-400" size={20} />,
        prompt: "Crie um componente React moderno, bem estruturado e com boas práticas."
      },
      {
        title: "Modo produtividade ⚡",
        desc: "Sem distração agora",
        icon: <Zap className="text-purple-400" size={20} />,
        prompt: "Me dê um plano direto pra manter foco total estudando programação hoje."
      },
      {
        title: "Modo explicação 🧠",
        desc: "Entender de verdade",
        icon: <Sparkles className="text-yellow-400" size={20} />,
        prompt: "Explique um conceito técnico de forma simples e com analogias fáceis."
      },
      {
        title: "Modo startup 🚀",
        desc: "Pensar grande",
        icon: <MessageSquare className="text-green-400" size={20} />,
        prompt: "Me dê ideias de startups tech criativas com potencial real."
      }
    ]
  }

  // noite
  return [
    {
      title: "Modo estudo noturno 🌙",
      desc: "Foco silencioso",
      icon: <Zap className="text-purple-400" size={20} />,
      prompt: "Me ajude a montar uma rotina de estudos eficiente para programar à noite."
    },
    {
      title: "Modo entender melhor 🧠",
      desc: "Sem confusão",
      icon: <Sparkles className="text-yellow-400" size={20} />,
      prompt: "Explique um conceito difícil de programação de forma bem simples."
    },
    {
      title: "Modo código limpo 💻",
      desc: "Sem gambiarra",
      icon: <Code className="text-blue-400" size={20} />,
      prompt: "Refatore um código ruim e explique as melhorias feitas."
    },
    {
      title: "Modo ideias leves 💡",
      desc: "Criatividade sem pressão",
      icon: <MessageSquare className="text-green-400" size={20} />,
      prompt: "Me dê ideias simples e criativas de projetos para treinar programação."
    }
  ]
}

export const SUGGESTIONS = getDynamicSuggestions()