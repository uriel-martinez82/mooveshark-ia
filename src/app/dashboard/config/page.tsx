import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { agents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AgentConfigForm } from '@/components/dashboard/AgentConfigForm'

export const dynamic = 'force-dynamic'

export default async function ConfigPage() {
  const session  = await auth()
  const user     = session?.user as Record<string, unknown>
  const clientId = user?.id as string

  const clientAgents = await db.select().from(agents).where(eq(agents.clientId, clientId))
  const activeAgent  = clientAgents.find(a => a.isActive) ?? clientAgents[0]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white mb-1">Configuración</h1>
        <p className="text-white/40 text-sm">Personalizá tu agente de IA</p>
      </div>
      {activeAgent
        ? <AgentConfigForm agent={activeAgent} />
        : <p className="text-white/40 text-sm">No tenés agentes configurados.</p>
      }
    </div>
  )
}
