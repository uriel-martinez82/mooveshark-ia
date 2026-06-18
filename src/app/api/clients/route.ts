import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clients, agents, leads } from '@/lib/db/schema'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { getAgentDefinition, buildSystemPrompt } from '@/lib/agents/definitions'

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
  'other':              'Otro / Personalizado',
}

const createClientSchema = z.object({
  company:   z.string().min(2),
  email:     z.string().email(),
  password:  z.string().min(8),
  plan:      z.enum(['starter', 'business', 'enterprise']).default('starter'),
  agentType: z.string(),
  agentName: z.string().min(2),
  tone:      z.enum(['formal', 'friendly', 'neutral']).default('friendly'),
  language:  z.string().default('es'),
  leadId:    z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = createClientSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 })
    }

    const { company, email, password, plan, agentType, agentName, tone, language, leadId } = parsed.data

    const passwordHash = await bcrypt.hash(password, 12)

    const [client] = await db.insert(clients).values({
      company,
      email,
      passwordHash,
      plan,
      status: 'trial',
    }).returning()

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

    // 1. Actualizar estado del lead a 'converted'
    if (leadId) {
      await db.update(leads)
        .set({ status: 'converted', updatedAt: new Date() })
        .where(eq(leads.id, leadId))
    }

    // 2. Email con credenciales al cliente
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        const nodemailer = await import('nodemailer')
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        })

        const agentLabel = AGENT_LABELS[agentType] ?? agentType
        const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`

        await transporter.sendMail({
          from: `"Mooveshark IA 🦈" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: `🦈 Tu agente está listo — Mooveshark IA`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a1428; color: #fff; padding: 32px; border-radius: 12px;">
              <h1 style="color: #00d4ff; margin-bottom: 4px;">🦈 Mooveshark IA</h1>
              <p style="color: #666; margin-top: 0;">Tu agente está listo para usar</p>

              <div style="background: #ffffff10; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h2 style="margin: 0 0 8px; color: #fff;">¡Hola, ${company}!</h2>
                <p style="color: #ccc; margin: 0; line-height: 1.6;">
                  Tu agente de <strong style="color:#00d4ff">${agentLabel}</strong> ya está configurado y listo para usar.
                </p>
              </div>

              <div style="background: #ffffff08; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 3px solid #00d4ff;">
                <p style="margin: 0 0 12px; color: #fff; font-weight: bold;">Tus credenciales de acceso:</p>
                <p style="margin: 4px 0; color: #aaa;"><b style="color:#fff">Email:</b> ${email}</p>
                <p style="margin: 4px 0; color: #aaa;"><b style="color:#fff">Contraseña:</b> ${password}</p>
                <p style="margin: 4px 0; color: #aaa;"><b style="color:#fff">Plan:</b> ${plan}</p>
              </div>

              <a href="${loginUrl}"
                style="display:block; background:#00d4ff; color:#0a1428; text-align:center; padding:14px; border-radius:8px; text-decoration:none; font-weight:bold; margin: 24px 0;">
                Acceder a mi panel →
              </a>

              <p style="color: #444; font-size: 12px; text-align: center; margin-top: 24px;">
                Mooveshark IA · Buenos Aires, Argentina
              </p>
            </div>
          `,
        })
      } catch (e) {
        console.warn('[nodemailer] Email credenciales no enviado:', e)
      }
    }

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