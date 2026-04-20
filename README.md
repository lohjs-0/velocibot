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

![Banner](./screenshots/banner.png)

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Licença](https://img.shields.io/badge/Licença-Todos%20os%20direitos%20reservados-red?style=for-the-badge)](#%EF%B8%8F-licença)

</div>

---

## 🦖 O que é o VelociBot?

VelociBot é uma plataforma web de chat com IA pensada para devs. Ele conversa sobre qualquer assunto, mas brilha quando o papo é técnico — analisa código, aponta melhorias, explica erros e vai direto ao que importa.

Sem complicação. Abre o navegador, loga com e-mail, e já era.

🌐 **[velocibot](https://lohane-portfolio.netlify.app/)**

---

## ✨ Funcionalidades

| Recurso | Descrição |
|---|---|
| 💬 **Chat com IA** | Conversa fluida sobre qualquer tema com memória de contexto |
| 🧠 **Memória de usuário** | O bot aprende suas preferências e linguagens favoritas ao longo das conversas |
| 🧑‍💻 **Análise de Código** | Cola seu código, recebe feedback real — melhorias, bugs, otimizações |
| 🖼️ **Análise de Imagens** | Envie imagens para o bot interpretar e comentar |
| 📄 **Leitura de PDFs** | Upload de PDFs para análise contextual |
| 💾 **Histórico persistente** | Conversas salvas no banco, acessíveis em qualquer dispositivo |
| 🌗 **Tema Claro / Escuro / Sistema** | Alterne o tema conforme sua preferência |
| 🔐 **Autenticação completa** | Login com e-mail e senha via Supabase Auth |
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

## 🚀 Rodando localmente

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### Instalação

```bash
git clone https://github.com/seu-usuario/velocibot.git
cd velocibot
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### Banco de dados

Rode esse SQL no **Supabase SQL Editor**:

```sql
create table public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  preferences jsonb default '{}',
  memory text default ''
);

create table public.chats (
  id uuid primary key,
  user_id uuid references auth.users on delete cascade,
  title text,
  created_at timestamptz default now()
);

create table public.messages (
  id uuid primary key,
  chat_id uuid references public.chats on delete cascade,
  role text,
  content text,
  created_at timestamptz default now()
);

-- RLS
alter table user_profiles enable row level security;
alter table chats enable row level security;
alter table messages enable row level security;

create policy "user_profiles_policy" on public.user_profiles
  for all to public using (auth.uid() = id) with check (auth.uid() = id);

create policy "chats_policy" on public.chats
  for all using (auth.uid() = user_id);

create policy "messages_policy" on public.messages
  for all using (
    auth.uid() = (select user_id from chats where id = chat_id)
  );

-- Trigger: cria perfil automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, name, preferences, memory)
  values (new.id, split_part(new.email, '@', 1), '{}'::jsonb, '');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Rodando

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

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
- [x] Leitura de PDFs
- [x] Perfil personalizável
- [x] Reset de senha por e-mail
- [ ] PWA — instalar como app
- [ ] Login com Google (OAuth)
- [ ] Exportar conversa como PDF

---

## ⚖️ Licença

```
Copyright (c) 2025 VelociBot. Todos os direitos reservados.

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

