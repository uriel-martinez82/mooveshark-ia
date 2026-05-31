import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clients, agents } from '@/lib/db/schema'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getAgentDefinition, buildSystemPrompt } from '@/lib/agents/definitions'

const createClientSchema = z.object({
  company:   z.string().min(2),
  email:     z.string().email(),
  password:  z.string().min(8),
  plan:      z.enum(['starter', 'business', 'enterprise']).default('starter'),
  agentType: z.string(),
  agentName: z.string().min(2),
  tone:      z.enum(['formal', 'friendly', 'neutral']).default('friendly'),
  language:  z.string().default('es'),
})

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = createClientSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 })
    }

    const { company, email, password, plan, agentType, agentName, tone, language } = parsed.data

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create client
    const [client] = await db.insert(clients).values({
      company,
      email,
      passwordHash,
      plan,
      status: 'active',
    }).returning()

    // Create agent for client
    const definition = getAgentDefinition(agentType)
    if (!definition) {
      return NextResponse.json({ success: false, error: 'Tipo de agente inválido' }, { status: 400 })
    }

    const systemPrompt = buildSystemPrompt(definition.systemPromptTemplate, {
      company_name:     company,
      business_context: `Empresa: ${company}`,
      tone,
      language,
    })

    const [agent] = await db.insert(agents).values({
      clientId:     client.id,
      type:         agentType as 'customer-support',
      name:         agentName,
      systemPrompt,
      tone,
      language,
      isActive:     true,
    }).returning()

    return NextResponse.json({
      success: true,
      data: { clientId: client.id, agentId: agent.id },
      message: 'Cliente y agente creados correctamente',
    })

  } catch (error: unknown) {
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json({ success: false, error: 'Ya existe un cliente con ese email' }, { status: 409 })
    }
    console.error('[POST /api/clients]', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const allClients = await db.select().from(clients)
    return NextResponse.json({ success: true, data: allClients })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
