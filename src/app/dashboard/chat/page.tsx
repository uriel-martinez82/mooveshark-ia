import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { agents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ChatInterface } from '@/components/dashboard/ChatInterface'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const session  = await auth()
  const user     = session?.user as Record<string, unknown>
  const clientId = user?.id as string

  const clientAgents = await db.select().from(agents)
    .where(eq(agents.clientId, clientId))

  const activeAgent = clientAgents.find(a => a.isActive) ?? clientAgents[0]

  if (!activeAgent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-white/40">No tenés agentes activos todavía.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-white">Chat con {activeAgent.name}</h1>
        <p className="text-white/40 text-sm mt-1">Tu agente está listo para responder</p>
      </div>
      <ChatInterface agentId={activeAgent.id} agentName={activeAgent.name} />
    </div>
  )
}
