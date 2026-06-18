import { db } from '@/lib/db'
import { clients, agents } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { CreateClientModal } from '@/components/admin/CreateClientModal'
import { auth } from '@/lib/auth/config'
import { LogoutButton } from '@/components/auth/LogoutButton'

export const dynamic = 'force-dynamic'

export default async function AdminClientsPage() {
  const session    = await auth()
  const user       = session?.user as Record<string, unknown>
  const allClients = await db.select().from(clients).orderBy(desc(clients.createdAt))

  const clientsWithAgents = await Promise.all(
    allClients.map(async (client) => {
      const clientAgents = await db.select().from(agents).where(eq(agents.clientId, client.id))
      return { ...client, agents: clientAgents }
    })
  )

  const PLAN_COLORS: Record<string, string> = {
    starter:    'bg-white/10 text-white/50',
    business:   'bg-shark-cyan/15 text-shark-cyan',
    enterprise: 'bg-purple-500/15 text-purple-400',
  }

  const STATUS_COLORS: Record<string, string> = {
    active:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    trial:     'bg-amber-500/15 text-amber-400 border-amber-500/20',
    paused:    'bg-white/10 text-white/40 border-white/10',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
  }

  const STATUS_LABELS: Record<string, string> = {
    active:    'Activo',
    trial:     'En trial',
    paused:    'Pausado',
    cancelled: 'Cancelado',
  }

  const AGENT_TYPE_LABELS: Record<string, string> = {
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
    'other':              'Personalizado',
  }

  return (
    <div className="min-h-screen bg-shark-dark">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-shark-cyan to-blue-500 flex items-center justify-center text-sm">🦈</div>
              <span className="font-display font-bold text-white">Mooveshark <span className="text-shark-cyan">IA</span></span>
            </div>
            <h1 className="font-display font-bold text-2xl text-white mt-3">Clientes & Agentes</h1>
            <p className="text-white/40 text-sm mt-1">Gestión de clientes y sus agentes activos</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30">{user?.email as string}</span>
            <a href="/admin" className="btn-ghost text-sm py-2 px-4">← Leads</a>
            <LogoutButton />
          </div>
        </div>

        {/* Stats + Create button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            {[
              { label: 'Total clientes', value: allClients.length },
              { label: 'Activos',        value: allClients.filter(c => c.status === 'active').length },
              { label: 'En trial',       value: allClients.filter(c => c.status === 'trial').length },
              { label: 'Agentes activos', value: clientsWithAgents.reduce((acc, c) => acc + c.agents.filter(a => a.isActive).length, 0) },
            ].map(s => (
              <div key={s.label} className="card-dark px-5 py-3 rounded-xl flex items-center gap-3">
                <span className="font-display font-bold text-2xl text-white">{s.value}</span>
                <span className="text-xs text-white/40">{s.label}</span>
              </div>
            ))}
          </div>
          <CreateClientModal />
        </div>

        {/* Clients table */}
        <div className="border border-white/8 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.02]">
                {['Empresa', 'Email', 'Plan', 'Estado', 'Agente asignado', 'Creado', 'Acciones'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientsWithAgents.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-white/30 text-sm py-12">No hay clientes todavía</td></tr>
              ) : clientsWithAgents.map((client, i) => (
                <tr key={client.id} className={`border-b border-white/5 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>

                  {/* Empresa */}
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-white">{client.company}</p>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-white/60">{client.email}</p>
                  </td>

                  {/* Plan */}
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${PLAN_COLORS[client.plan ?? 'starter']}`}>
                      {client.plan}
                    </span>
                  </td>

                  {/* Estado cliente */}
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[client.status ?? 'trial']}`}>
                      {STATUS_LABELS[client.status ?? 'trial']}
                    </span>
                  </td>

                  {/* Agente asignado */}
                  <td className="px-4 py-3.5">
                    {client.agents.length === 0 ? (
                      <span className="text-xs text-white/30">Sin agente</span>
                    ) : client.agents.map(agent => (
                      <div key={agent.id} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${agent.isActive ? 'bg-emerald-400' : 'bg-white/20'}`} />
                        <div>
                          <p className="text-xs text-white/80 font-medium">{agent.name}</p>
                          <p className="text-[10px] text-white/30">{AGENT_TYPE_LABELS[agent.type] ?? agent.type}</p>
                        </div>
                      </div>
                    ))}
                  </td>

                  {/* Creado */}
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-white/40">
                      {client.createdAt ? new Date(client.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : '—'}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {client.status === 'trial' && (
                        <span className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20 transition-all whitespace-nowrap">
                          → Activar
                        </span>
                      )}
                      {client.status === 'active' && (
                        <span className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                          ✓ Activo
                        </span>
                      )}
                      {(client.status === 'paused' || client.status === 'cancelled') && (
                        <span className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white/5 text-white/30 border border-white/10 whitespace-nowrap">
                          {STATUS_LABELS[client.status]}
                        </span>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}