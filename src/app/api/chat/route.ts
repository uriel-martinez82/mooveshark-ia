import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { chatMessageSchema } from '@/lib/validations/schemas'
import { db } from '@/lib/db'
import { agents, conversations, messages, usageLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { buildSystemPrompt, getAgentDefinition } from '@/lib/agents/definitions'
import type { ChatMessage } from '@/types'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = chatMessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { message, agentId, conversationId } = parsed.data

    const [agent] = await db.select().from(agents).where(eq(agents.id, agentId))
    if (!agent) {
      return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 })
    }

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

    await db.insert(messages).values({
      conversationId: convId!,
      role:    'user',
      content: message,
    })

    const definition = getAgentDefinition(agent.type)
    const systemPrompt = buildSystemPrompt(
      agent.systemPrompt || definition?.systemPromptTemplate || '',
      { tone: agent.tone ?? 'friendly', language: agent.language ?? 'es' }
    )

    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const { text } = await generateText({
      model:    anthropic('claude-sonnet-4-20250514'),
      system:   systemPrompt,
      messages: [
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: message },
      ],
      maxTokens: 1024,
    })

    await db.insert(messages).values({
      conversationId: convId!,
      role:    'assistant',
      content: text,
    })

    await db.insert(usageLogs).values({
      clientId: agent.clientId,
      agentId,
    })

    return NextResponse.json({
      success: true,
      data: { response: text, conversationId: convId },
    })

  } catch (error) {
    console.error('[POST /api/chat]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}