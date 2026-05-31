import { NextRequest, NextResponse } from 'next/server'
import { streamAgent } from '@/lib/agents/orchestrator'
import { chatMessageSchema } from '@/lib/validations/schemas'
import { db } from '@/lib/db'
import { agents, conversations, messages, usageLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { AgentConfig, ChatMessage } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = chatMessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { message, agentId, conversationId } = parsed.data

    // Load agent config
    const [agent] = await db.select().from(agents).where(eq(agents.id, agentId))
    if (!agent) {
      return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 })
    }

    // Load or create conversation
    let convId = conversationId
    let history: ChatMessage[] = []

    if (convId) {
      const msgs = await db.select().from(messages).where(eq(messages.conversationId, convId))
      history = msgs.map(m => ({
        id:        m.id,
        role:      m.role as 'user' | 'assistant',
        content:   m.content,
        timestamp: m.createdAt!,
      }))
    } else {
      const [conv] = await db.insert(conversations).values({
        clientId: agent.clientId,
        agentId,
      }).returning()
      convId = conv.id
    }

    // Save user message
    await db.insert(messages).values({
      conversationId: convId!,
      role:    'user',
      content: message,
    })

    const agentConfig: AgentConfig = {
      id:           agent.id,
      clientId:     agent.clientId,
      type:         agent.type as AgentConfig['type'],
      name:         agent.name,
      systemPrompt: agent.systemPrompt,
      tone:         agent.tone as AgentConfig['tone'],
      language:     agent.language ?? 'es',
      contextData:  agent.contextData as Record<string, unknown>,
      isActive:     agent.isActive ?? true,
      createdAt:    agent.createdAt!,
    }

    // Stream using Vercel AI SDK
    const result = streamAgent({ config: agentConfig, history, userMessage: message })

    let fullResponse = ''

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            fullResponse += chunk
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`))
          }

          // Persist assistant message
          await db.insert(messages).values({
            conversationId: convId!,
            role:    'assistant',
            content: fullResponse,
          })

          await db.insert(usageLogs).values({
            clientId: agent.clientId,
            agentId,
          })

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, conversationId: convId })}\n\n`))
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
      },
    })

  } catch (error) {
    console.error('[POST /api/chat]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
