# 🦈 Mooveshark IA

Plataforma de agentes de inteligencia artificial para empresas B2B.

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Estilos**: Tailwind CSS
- **Agentes IA**: LangGraph TypeScript + Anthropic API (claude-sonnet-4)
- **Workflows**: Inngest (serverless)
- **Base de datos**: Neon PostgreSQL + Drizzle ORM
- **Auth**: NextAuth.js v5
- **Email**: Resend
- **Billing**: Stripe
- **Deploy**: Vercel

## Setup

### 1. Clonar y instalar

```bash
git clone <repo>
cd mooveshark-ia
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Completar cada variable en `.env.local`:

| Variable | Dónde obtenerla |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `DATABASE_URL` | console.neon.tech |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `INNGEST_EVENT_KEY` | app.inngest.com |
| `RESEND_API_KEY` | resend.com |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com |

### 3. Base de datos

```bash
npm run db:push
```

### 4. Desarrollo

```bash
# Terminal 1: Next.js
npm run dev

# Terminal 2: Inngest dev server (para workflows locales)
npx inngest-cli@latest dev
```

### 5. Deploy en Vercel

```bash
vercel deploy
```

Agregar todas las variables de entorno en el panel de Vercel.

## Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── leads/          # POST leads, GET leads (admin)
│   │   ├── agents/         # CRUD agentes
│   │   ├── chat/           # Streaming chat con agentes
│   │   └── webhooks/
│   │       └── inngest/    # Handler de workflows Inngest
│   ├── dashboard/          # Panel del cliente
│   ├── admin/              # Panel admin interno
│   └── auth/               # Login / signup
├── components/
│   ├── landing/            # Secciones de la landing page
│   ├── forms/              # Formularios multi-step
│   ├── agents/             # UI de chat con agentes
│   └── dashboard/          # Componentes del panel
├── lib/
│   ├── agents/
│   │   ├── definitions.ts  # Catálogo de agentes y prompts
│   │   ├── orchestrator.ts # LangGraph orchestrator
│   │   └── scoring.ts      # Lead scoring algorithm
│   ├── db/
│   │   ├── schema.ts       # Drizzle schema (Neon)
│   │   └── index.ts        # DB client
│   ├── inngest/
│   │   ├── client.ts       # Inngest client + event types
│   │   └── functions.ts    # Workflow functions
│   └── validations/
│       └── schemas.ts      # Zod schemas
└── types/
    └── index.ts            # TypeScript types globales
```

## Roadmap MVP

- [x] Scaffolding completo
- [x] Schema de base de datos
- [x] Orquestador de agentes (LangGraph)
- [x] Lead scoring
- [x] Workflows Inngest
- [x] API Routes (leads, chat)
- [x] Landing page (Hero + Agentes)
- [ ] Formulario multi-step de leads
- [ ] Secciones restantes de la landing
- [ ] Panel del cliente
- [ ] Panel admin
- [ ] Auth (login/signup)
- [ ] Billing con Stripe
