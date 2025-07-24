Treinei - Social Fitness App🎯 Sobre o ProjetoO Treinei é uma aplicação web social e de gamificação focada em fitness, construída com as mais modernas tecnologias do ecossistema JavaScript. A plataforma permite que usuários registrem seus treinos (check-ins), interajam com publicações de amigos, criem e participem de grupos, e compitam em um ranking global e de grupos.Este projeto foi desenvolvido utilizando Next.js (App Router) para o frontend e backend (rotas de API), Supabase como banco de dados PostgreSQL e para autenticação, e Tailwind CSS para uma estilização moderna e consistente, seguindo as melhores práticas de desenvolvimento e componentização com React.✨ Funcionalidades PrincipaisAutenticação de Usuários: Sistema completo de registro, login (com e-mail/senha e Google) e gerenciamento de sessão com JWT.Check-ins: Usuários podem registrar seus treinos, adicionando uma foto e uma descrição.Feed Social: Um dashboard onde os usuários podem ver os check-ins de todos na plataforma.Interações Sociais: Curta e comente nos check-ins de outros usuários.Grupos: Crie grupos públicos ou privados, convide membros e compartilhe um feed de check-ins exclusivo.Ranking: Sistema de pontuação que classifica usuários e grupos com base na frequência de treinos.Perfis de Usuário: Páginas de perfil personalizáveis com histórico de check-ins e informações.Progressive Web App (PWA): Otimizado para ser instalado em dispositivos móveis, com suporte a notificações push e funcionamento offline.Upload de Imagens: Integração com Cloudinary para armazenamento de fotos de check-in e logos de grupos.🚀 Tecnologias UtilizadasEste projeto foi construído com uma stack moderna e performática:TecnologiaDescriçãoNext.jsFramework React para renderização no servidor (SSR), geração de sites estáticos (SSG) e rotas de API.ReactBiblioteca para construção de interfaces de usuário componentizadas.TypeScriptSuperset do JavaScript que adiciona tipagem estática ao código.Tailwind CSSFramework CSS utility-first para estilização rápida e customizável.Shadcn/UIColeção de componentes de UI reutilizáveis e acessíveis.SupabasePlataforma open-source que oferece banco de dados PostgreSQL, autenticação, e APIs.CloudinarySolução para gerenciamento e upload de mídias (imagens/vídeos).React QueryBiblioteca para fetching, caching e atualização de dados de forma eficiente.ZodBiblioteca para validação de esquemas e tipos.PWACapacidades de Progressive Web App para uma experiência nativa no mobile.⚙️ Primeiros PassosPara executar este projeto localmente, siga os passos abaixo.Pré-requisitosNode.js (versão 20.x ou superior)pnpm (gerenciador de pacotes)Uma conta no Supabase para o banco de dados e autenticação.Uma conta no Cloudinary para o armazenamento de imagens.Variáveis de AmbienteCrie um arquivo .env.local na raiz do projeto e adicione as seguintes variáveis, substituindo os valores pelos dados das suas contas nos serviços:# Supabase
NEXT_PUBLIC_SUPABASE_URL=URL_DO_SEU_PROJETO_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_SUPABASE
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_DE_SERVICO_SUPABASE

# Auth
JWT_SECRET=SEU_SEGREDO_JWT_PARA_ASSINAR_TOKENS

# Cloudinary
CLOUDINARY_CLOUD_NAME=NOME_DO_SEU_CLOUD_CLOUDINARY
CLOUDINARY_API_KEY=SUA_API_KEY_CLOUDINARY
CLOUDINARY_API_SECRET=SEU_API_SECRET_CLOUDINARY

# Push Notifications (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=SUA_CHAVE_PUBLICA_VAPID
VAPID_PRIVATE_KEY=SUA_CHAVE_PRIVADA_VAPID
VAPID_EMAIL=seu-email@exemplo.com

# Google Auth
GOOGLE_CLIENT_ID=SEU_ID_DE_CLIENTE_GOOGLE
GOOGLE_CLIENT_SECRET=SEU_SEGREDO_DE_CLIENTE_GOOGLE
NEXT_PUBLIC_BASE_URL=http://localhost:3000
InstalaçãoClone o repositório:git clone [https://github.com/seu-usuario/treinei.git](https://github.com/seu-usuario/treinei.git)
cd treinei
Instale as dependências:pnpm install
Executando a AplicaçãoPara iniciar o servidor de desenvolvimento, execute:pnpm dev
Abra http://localhost:3000 no seu navegador para ver a aplicação em funcionamento.📂 Estrutura do ProjetoO projeto segue a estrutura do App Router do Next.js, otimizando a organização e o uso de Server/Client Components./
├── app/
│   ├── (app)/                # Rotas protegidas (exigem autenticação)
│   │   ├── dashboard/
│   │   ├── groups/
│   │   └── ...
│   ├── api/                  # Route Handlers (Backend API)
│   │   ├── auth/
│   │   ├── checkins/
│   │   └── ...
│   ├── layout.tsx            # Layout principal da aplicação
│   └── page.tsx              # Página inicial (login/registro)
│
├── components/
│   ├── ui/                   # Componentes de UI (shadcn/ui)
│   ├── *.tsx                 # Componentes específicos da aplicação
│
├── contexts/                 # Contextos React para gerenciamento de estado
│   ├── AuthContext.tsx
│   └── ...
│
├── hooks/                    # Hooks customizados para lógica reutilizável
│   ├── useAuth.ts
│   └── ...
│
├── lib/
│   ├── api/                  # Funções cliente para chamar a API interna
│   ├── supabase/             # Lógica de acesso direto ao Supabase (Server-side)
│   ├── auth.ts               # Utilitários de autenticação
│   ├── cloudinary.ts         # Configuração do Cloudinary
│   └── utils.ts              # Funções utilitárias genéricas
│
├── public/                   # Arquivos estáticos (imagens, manifest, service worker)
│
├── types/                    # Definições de tipos e interfaces TypeScript
│
└── tailwind.config.ts        # Configuração do tema do Tailwind CSS
Endpoints da APIA aplicação expõe uma série de endpoints de API para lidar com as operações de backend. Eles estão localizados em app/api/.POST /api/auth/register: Registra um novo usuário.POST /api/auth/login: Autentica um usuário e retorna um JWT.GET /api/auth/google: Inicia o fluxo de autenticação com o Google.GET /api/checkins: Retorna o feed de check-ins.POST /api/checkins/create: Cria um novo check-in.POST /api/checkins/[id]/like: Curte/descurte um check-in.POST /api/checkins/[id]/comments: Adiciona um comentário a um check-in.GET /api/groups: Lista os grupos do usuário.POST /api/groups/create: Cria um novo grupo.POST /api/groups/join: Entra em um grupo existente com um código.GET /api/ranking: Retorna os dados do ranking.GET /api/profile: Retorna os dados do perfil do usuário logado.PUT /api/profile: Atualiza o perfil do usuário.👨‍💻 ContribuiçãoContribuições são bem-vindas! Se você tem alguma ideia para melhorar o projeto, sinta-se à vontade para abrir uma issue ou enviar um pull request.Faça um fork do projeto.Crie uma nova branch (git checkout -b feature/minha-feature).Faça o commit das suas alterações (git commit -m 'Adiciona minha-feature').Faça o push para a branch (git push origin feature/minha-feature).Abra um Pull Request.📄 LicençaEste projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.