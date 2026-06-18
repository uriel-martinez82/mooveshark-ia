import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { agents, conversations, usageLogs } from '@/lib/db/schema'
import { eq, count, gte } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  const user    = session?.user as Record<string, unknown>
  const clientId = user?.id as string

  const clientAgents = await db.select().from(agents).where(eq(agents.clientId, clientId))

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [convCount] = await db
    .select({ count: count() })
    .from(conversations)
    .where(eq(conversations.clientId, clientId))

  const activeAgent = clientAgents.find(a => a.isActive) ?? clientAgents[0]

  const AGENT_LABELS: Record<string, string> = {
    'customer-support':   'Atención al cliente',
    'lead-qualification': 'Calificación de leads',
    'sales-sdr':          'Ventas / SDR',
    'data-analysis':      'Análisis de datos',
    'onboarding':         'Onboarding',
    'hr-recruitment':     'RRHH / Reclutamiento',
    'collections':        'Cobranzas',
    'gastronomy-pastry':  'Gastronomía & Repostería',
    'education':          'Educación',
    'legal':              'Legal / Compliance',
    'health':             'Salud & Bienestar',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white mb-1">
          Bienvenido, {user?.name as string} 👋
        </h1>
        <p className="text-white/40 text-sm">Así va tu agente hoy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card-dark p-5 rounded-xl">
          <p className="text-xs text-white/40 mb-1 font-medium tracking-wide">Agentes activos</p>
          <p className="font-display font-bold text-3xl text-shark-cyan">{clientAgents.filter(a => a.isActive).length}</p>
        </div>
        <div className="card-dark p-5 rounded-xl">
          <p className="text-xs text-white/40 mb-1 font-medium tracking-wide">Conversaciones totales</p>
          <p className="font-display font-bold text-3xl text-white">{convCount.count}</p>
        </div>
        <div className="card-dark p-5 rounded-xl">
          <p className="text-xs text-white/40 mb-1 font-medium tracking-wide">Estado</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="font-medium text-emerald-400 text-sm">Operativo</p>
          </div>
        </div>
      </div>

      {/* Active agent card */}
      {activeAgent ? (
        <div className="card-glow p-6 rounded-2xl mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-white/40 font-medium tracking-wide uppercase mb-1">Agente activo</p>
              <h2 className="font-display font-bold text-xl text-white">{activeAgent.name}</h2>
              <p className="text-white/50 text-sm mt-1">{AGENT_LABELS[activeAgent.type] ?? activeAgent.type}</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Activo
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/8">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Tono</p>
              <p className="text-sm text-white/70 capitalize">{activeAgent.tone}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Idioma</p>
              <p className="text-sm text-white/70 uppercase">{activeAgent.language}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Tipo</p>
              <p className="text-sm text-white/70">{AGENT_LABELS[activeAgent.type] ?? activeAgent.type}</p>
            </div>
          </div>
          <div className="mt-4">
            <a href="/dashboard/chat" className="btn-primary text-sm py-2.5">
              Ir al chat →
            </a>
          </div>
        </div>
      ) : (
        <div className="card-dark p-8 rounded-2xl text-center">
          <p className="text-white/40 text-sm">No tenés agentes activos todavía.</p>
          <p className="text-white/25 text-xs mt-1">Contactá a soporte para activar tu agente.</p>
        </div>
      )}
    </div>
  )
}
