<div align="center">

```
██╗   ██╗███████╗██╗      ██████╗  ██████╗██╗██████╗  ██████╗ ████████╗
██║   ██║██╔════╝██║     ██╔═══██╗██╔════╝██║██╔══██╗██╔═══██╗╚══██╔══╝
██║   ██║█████╗  ██║     ██║   ██║██║     ██║██████╔╝██║   ██║   ██║   
╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║██║     ██║██╔══██╗██║   ██║   ██║   
 ╚████╔╝ ███████╗███████╗╚██████╔╝╚██████╗██║██████╔╝╚██████╔╝   ██║   
  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝  ╚═════╝╚═╝╚═════╝  ╚═════╝   ╚═╝   
```

**Seu dinossauro dev favorito — assistente de IA focado em código.**


[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Netlify](https://img.shields.io/badge/Netlify-000000?style=for-the-badge&logo=netlify&logoColor=white)](https://netlify.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Licença](https://img.shields.io/badge/Licença-Todos%20os%20direitos%20reservados-red?style=for-the-badge)](#%EF%B8%8F-licença)

</div>

---

## 🦖 O que é o VelociBot?

<p align="left">
  <img src="./1776624020772-removebg-preview.png" align="right" width="220" style="margin-left: 20px; border-radius: 15px;">
  <div>
  <p>Dev Sênior Assistant</p>

  VelociBot é uma plataforma web de chat com IA pensada para devs. Ele conversa sobre qualquer assunto, mas brilha quando o papo é técnico — analisa código, aponta melhorias, explica erros e vai direto ao que importa.
  <br><br>
  Sem complicação. Abre o navegador, loga com e-mail, e já era.
  <br><br>
  🌐 <b><a href="https://velocibot.netlify.app/">velocibot</a></b>
  <br><br>
  </div>
</p>

<br clear="right">

---

## ✨ Funcionalidades

| Recurso | Descrição |
|---|---|
| 💬 **Chat com IA** | Conversa fluida sobre qualquer tema com memória de contexto |
| 🧠 **Memória de usuário** | O bot aprende suas preferências e linguagens favoritas ao longo das conversas |
| 🧑‍💻 **Análise de Código** | Cola seu código, recebe feedback real — melhorias, bugs, otimizações |
| 🖼️ **Análise de Imagens** | Envie imagens para o bot interpretar e comentar |
| 📄 **Leitura de PDFs** | Upload de PDFs para análise contextual (em desenvolvimento)|
| 💾 **Histórico persistente** | Conversas salvas no banco, acessíveis em qualquer dispositivo |
| 🌗 **Tema Claro / Escuro / Sistema** | Alterne o tema conforme sua preferência |
| 🔐 **Autenticação completa** | Login com e-mail e senha ou pelo Google via Supabase Auth |
| 📧 **E-mails automáticos** | Confirmação de conta e redefinição de senha |
| 👤 **Perfil personalizável** | Edite seu nome de exibição diretamente no app |

---

## 🛠️ Stack

```
Frontend  →  Next.js 14 (App Router) + TypeScript + Tailwind CSS
Animações →  Framer Motion
Banco     →  Supabase (PostgreSQL + RLS)
Auth      →  Supabase Auth
IA        →  API própria via /api/chat
Deploy    →  Vercel
```

---

## 🔐 Segurança

- ✅ **Row Level Security (RLS)** ativo em todas as tabelas
- ✅ Autenticação via **JWT** (Supabase Auth)
- ✅ Rate limit configurado no Supabase Authentication
- ✅ Requests autenticados com **Bearer token**
- ✅ Trigger automático para criação de perfil no cadastro

---

## 🚀 Acesso

O VelociBot é um projeto fechado e não está disponível para execução local ou self-hosting.

Todo o código-fonte, infraestrutura e configurações são proprietários e não serão disponibilizados publicamente.

Para usar o VelociBot, acesse diretamente:

🌐 **[velocibot.vercel.app](https://velocibot.vercel.app)**

---

## 📁 Estrutura do projeto

```
velocibot/
├── app/
│   ├── api/chat/        # Rota da IA
│   ├── reset-password/  # Página de reset de senha
│   └── page.tsx         # Página principal
├── components/          # Componentes React
│   ├── AuthModal.tsx
│   ├── ChatInput.tsx
│   ├── MessageList.tsx
│   ├── ProfileModal.tsx
│   └── Sidebar.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useChat.ts
├── lib/
│   └── supabase.ts
├── public/              # Assets estáticos
└── types/               # Tipos TypeScript
```

---

## 🗺️ Roadmap

- [x] Chat com IA com memória de contexto
- [x] Autenticação com Supabase
- [x] Histórico de conversas persistente
- [x] Múltiplas sessões de chat
- [x] Tema claro / escuro / sistema
- [x] Análise de imagens
- [ ] Leitura de PDFs
- [x] Perfil personalizável
- [x] Reset de senha por e-mail
- [ ] PWA — instalar como app
- [x] Login com Google (OAuth)
- [ ] Exportar conversa como PDF

---

## ⚖️ Licença

```
Copyright (c) 2026 VelociBot. Todos os direitos reservados.

Este software e todo o seu código-fonte, design, estrutura, lógica e
documentação são propriedade exclusiva do autor.

É estritamente PROIBIDO, sem autorização prévia e expressa por escrito
do titular dos direitos:

  - Copiar, reproduzir ou duplicar qualquer parte deste projeto
  - Modificar, adaptar ou criar obras derivadas
  - Distribuir, publicar, sublicenciar ou vender cópias
  - Usar o código, no todo ou em parte, em projetos próprios ou de terceiros
  - Fazer engenharia reversa ou descompilar o software

O acesso a este repositório é fornecido exclusivamente para fins de
visualização. Qualquer outro uso é expressamente vedado e sujeito às
penalidades previstas na Lei nº 9.610/98 (Lei de Direitos Autorais)
e demais legislações aplicáveis.
```

---

<div align="center">

Feito com ☕ e muito TypeScript — rawwr! 🦖

**[⬆ Voltar ao topo](#)**

</div>
