import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { agents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ChatInterface } from '@/components/dashboard/ChatInterface'
import { getAgentDefinition } from '@/lib/agents/definitions'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const session  = await auth()
  const user     = session?.user as Record<string, unknown>
  const clientId = user?.id as string

  const clientAgents = await db.select().from(agents).where(eq(agents.clientId, clientId))
  const activeAgent  = clientAgents.find(a => a.isActive) ?? clientAgents[0]

  if (!activeAgent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center card-dark rounded-2xl p-10">
          <p className="text-2xl mb-3">🦈</p>
          <p className="text-white font-medium mb-1">No tenés agentes activos</p>
          <p className="text-white/40 text-sm">Contactá a soporte para activar tu agente.</p>
        </div>
      </div>
    )
  }

  const definition = getAgentDefinition(activeAgent.type)

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="font-display font-bold text-xl text-white">
          Chat con {definition?.agentName ?? activeAgent.name}
        </h1>
        <p className="text-white/40 text-sm mt-0.5">{definition?.label} · {definition?.specialty?.slice(0, 60)}...</p>
      </div>
      <ChatInterface
        agentId={activeAgent.id}
        agentName={activeAgent.name}
        agentType={activeAgent.type}
      />
    </div>
  )
}
