# Treinei - Social Fitness App

## 🎯 Sobre o Projeto

O **Treinei** é uma aplicação web social com foco em fitness e gamificação, desenvolvida com as tecnologias mais modernas do ecossistema JavaScript. A plataforma permite que usuários:

* Registrem seus treinos (check-ins);
* Interajam com publicações de amigos;
* Criem e participem de grupos;
* Compitam em rankings globais e por grupo.

O projeto foi desenvolvido com **Next.js (App Router)** para frontend e backend, **Supabase** como banco de dados (PostgreSQL) e autenticação, e **Tailwind CSS** para uma estilização moderna, eficiente e consistente, seguindo as melhores práticas com **React** e componentização reutilizável.

## ✨ Funcionalidades Principais

* **Autenticação de Usuários**: Registro, login com e-mail/senha ou Google, gerenciamento de sessão via JWT.
* **Check-ins**: Registro de treinos com imagem e descrição.
* **Feed Social**: Acompanhe os check-ins públicos de outros usuários.
* **Interações Sociais**: Curta e comente check-ins de outros usuários.
* **Grupos**: Crie grupos públicos/privados com feed exclusivo.
* **Ranking**: Classificação por frequência de treinos (global e por grupo).
* **Perfil de Usuário**: Página com histórico de treinos e dados personalizados.
* **Progressive Web App (PWA)**: Instalação no dispositivo móvel, suporte a notificações push e uso offline.
* **Upload de Imagens**: Integração com **Cloudinary** para armazenamento eficiente de fotos e logos.

## 🚀 Tecnologias Utilizadas

| Tecnologia   | Descrição                                                            |
| ------------ | -------------------------------------------------------------------- |
| Next.js      | Framework React com suporte SSR, SSG e rotas de API                  |
| React        | Biblioteca para construção de interfaces reativas                    |
| TypeScript   | Superset de JavaScript com tipagem estática                          |
| Tailwind CSS | Framework CSS utility-first para estilização rápida                  |
| Shadcn/UI    | Componentes de interface acessíveis e reutilizáveis                  |
| Supabase     | Plataforma open-source com banco PostgreSQL, autenticação e API REST |
| Cloudinary   | Armazenamento e gerenciamento de mídias (imagens e vídeos)           |
| React Query  | Fetching, caching e sincronização de dados eficiente                 |
| Zod          | Validação de esquemas com tipagem                                    |
| PWA          | Recursos de Progressive Web App (notificações, offline, instalação)  |

## ⚙️ Primeiros Passos

### Pré-requisitos

* Node.js (versão 20.x ou superior)
* pnpm (gerenciador de pacotes)
* Conta no [Supabase](https://supabase.com)
* Conta no [Cloudinary](https://cloudinary.com)

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto e adicione:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=URL_DO_SEU_PROJETO_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_SUPABASE
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_DE_SERVICO_SUPABASE

# JWT
JWT_SECRET=SEU_SEGREDO_JWT_PARA_ASSINAR_TOKENS

# Cloudinary
CLOUDINARY_CLOUD_NAME=NOME_DO_SEU_CLOUD_CLOUDINARY
CLOUDINARY_API_KEY=SUA_API_KEY_CLOUDINARY
CLOUDINARY_API_SECRET=SEU_API_SECRET_CLOUDINARY

# Notificações Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=SUA_CHAVE_PUBLICA_VAPID
VAPID_PRIVATE_KEY=SUA_CHAVE_PRIVADA_VAPID
VAPID_EMAIL=seu-email@exemplo.com

# Google Auth
GOOGLE_CLIENT_ID=SEU_ID_DE_CLIENTE_GOOGLE
GOOGLE_CLIENT_SECRET=SEU_SEGREDO_DE_CLIENTE_GOOGLE
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Instalação

```bash
git clone https://github.com/seu-usuario/treinei.git
cd treinei
pnpm install
```

### Executando a Aplicação

```bash
pnpm dev
```

Acesse `http://localhost:3000` no navegador.

## 📂 Estrutura do Projeto

```
/
├── app/
│   ├── (app)/               # Rotas protegidas (dashboard, grupos, etc)
│   ├── api/                 # Rotas de API (auth, check-ins, etc)
│   ├── layout.tsx          # Layout principal da aplicação
│   └── page.tsx            # Página inicial (login e registro)
│
├── components/
│   ├── ui/                 # Componentes da UI (Shadcn)
│   └── *.tsx               # Componentes personalizados
│
├── contexts/              # Contextos React para estado global
│   └── AuthContext.tsx
│
├── hooks/                 # Hooks customizados
│   └── useAuth.ts
│
├── lib/
│   ├── api/               # Funções cliente para comunicação com API
│   ├── supabase/          # Configurações do Supabase
│   ├── auth.ts            # Utilitários de autenticação
│   ├── cloudinary.ts      # Configuração do Cloudinary
│   └── utils.ts           # Funções auxiliares
│
├── public/                # Arquivos estáticos (imagens, manifest)
├── types/                 # Tipagens e interfaces TS
└── tailwind.config.ts     # Configuração do Tailwind
```

## 📡 Endpoints da API

Localizados em `app/api/`:

### Autenticação

* `POST /api/auth/register`: Registra um novo usuário.
* `POST /api/auth/login`: Autentica e retorna um token JWT.
* `GET /api/auth/google`: Login com Google.

### Check-ins

* `GET /api/checkins`: Lista check-ins recentes.
* `POST /api/checkins/create`: Cria um novo check-in.
* `POST /api/checkins/[id]/like`: Curte ou descurte um check-in.
* `POST /api/checkins/[id]/comments`: Adiciona comentário em um check-in.

### Grupos

* `GET /api/groups`: Lista grupos do usuário.
* `POST /api/groups/create`: Cria um novo grupo.
* `POST /api/groups/join`: Entra em um grupo por código.

### Ranking

* `GET /api/ranking`: Recupera dados do ranking.

### Perfil

* `GET /api/profile`: Recupera informações do perfil do usuário.
* `PUT /api/profile`: Atualiza os dados do perfil.

## 👨‍💻 Contribuição

Contribuições são muito bem-vindas!

1. Faça um fork do projeto.
2. Crie uma branch com sua feature:

```bash
git checkout -b feature/nome-da-feature
```

3. Commit suas mudanças:

```bash
git commit -m "feat: adiciona nome-da-feature"
```

4. Faça push da sua branch:

```bash
git push origin feature/nome-da-feature
```

5. Abra um Pull Request.

## 📄 Licença

Este projeto está licenciado sob a **MIT License**. Consulte o arquivo `LICENSE` para mais informações.
