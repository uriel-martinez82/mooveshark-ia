import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { leadFullSchema } from '@/lib/validations/schemas'
import { scoreLead } from '@/lib/agents/scoring'
import type { AgentType } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = leadFullSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const score = scoreLead(data)

    const [lead] = await db.insert(leads).values({
      fullName:         data.fullName,
      email:            data.email,
      company:          data.company,
      role:             data.role,
      country:          data.country,
      industry:         data.industry,
      companySize:      data.companySize,
      monthlyVolume:    data.monthlyVolume,
      hasCRM:           data.hasCRM,
      crmName:          data.crmName,
      problem:          data.problem,
      agentsInterested: data.agentsInterested as AgentType[],
      urgency:          data.urgency,
      budget:           data.budget,
      score,
      status: 'new',
    }).returning()

    if (process.env.INNGEST_EVENT_KEY && process.env.INNGEST_EVENT_KEY !== '...') {
      try {
        const { inngest } = await import('@/lib/inngest/client')
        await inngest.send({
          name: 'lead/created',
          data: { leadId: lead.id, email: lead.email, fullName: lead.fullName, company: lead.company, score, urgency: lead.urgency },
        })
      } catch (e) {
        console.warn('[inngest] Skipped:', e)
      }
    }

    return NextResponse.json({
      success: true,
      data: { leadId: lead.id, score },
      message: '¡Gracias! Te contactamos en menos de 24 horas.',
    })

  } catch (error) {
    console.error('[POST /api/leads]', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const allLeads = await db.select().from(leads)
    return NextResponse.json({ success: true, data: allLeads })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}