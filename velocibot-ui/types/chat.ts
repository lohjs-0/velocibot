export interface Message {
  role: 'user' | 'bot'
  content: string
  image?: string
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: number
}