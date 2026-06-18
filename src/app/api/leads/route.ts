import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { leadFullSchema } from '@/lib/validations/schemas'
import { scoreLead } from '@/lib/agents/scoring'

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
      ...data,
      agentsInterested: data.agentsInterested as string[],
      score,
      status: 'new',
    }).returning()

  // Labels legibles para los agentes
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

  const agentLabel = Array.isArray(data.agentsInterested)
    ? data.agentsInterested.map((a: string) => AGENT_LABELS[a] ?? a).join(', ')
    : 'No especificado'

  const scoreBadge = score >= 70 ? '🔥 Caliente' : score >= 40 ? '⚡ Tibio' : '❄️ Frío'

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

      // Email al admin
      if (process.env.ADMIN_EMAIL) {
        await transporter.sendMail({
          from: `"Mooveshark IA 🦈" <${process.env.GMAIL_USER}>`,
          to: process.env.ADMIN_EMAIL,
          subject: `🦈 Nuevo lead: ${data.company} — Score ${score}/100 ${scoreBadge}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a1428; color: #fff; padding: 32px; border-radius: 12px;">
              <h1 style="color: #00d4ff; margin-bottom: 4px;">🦈 Mooveshark IA</h1>
              <p style="color: #666; margin-top: 0;">Nuevo lead recibido</p>
              <div style="background: #ffffff10; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h2 style="margin: 0 0 16px; color: #fff;">${data.fullName}</h2>
                <p style="margin: 4px 0; color: #aaa;"><b style="color:#fff">Empresa:</b> ${data.company}</p>
                <p style="margin: 4px 0; color: #aaa;"><b style="color:#fff">Email:</b> ${data.email}</p>
                <p style="margin: 4px 0; color: #aaa;"><b style="color:#fff">Industria:</b> ${data.industry}</p>
                <p style="margin: 4px 0; color: #aaa;"><b style="color:#fff">País:</b> ${data.country}</p>
              </div>
              <div style="background: #ffffff10; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 4px 0; color: #aaa;"><b style="color:#fff">Agente solicitado:</b> ${agentLabel}</p>
                <p style="margin: 4px 0; color: #aaa;"><b style="color:#fff">Urgencia:</b> ${data.urgency}</p>
                <p style="margin: 4px 0; color: #aaa;"><b style="color:#fff">Presupuesto:</b> ${data.budget}</p>
                <p style="margin: 8px 0 4px; color: #aaa;"><b style="color:#fff">Descripción:</b></p>
                <p style="margin: 0; color: #ccc; font-style: italic;">${data.problem || 'No especificado'}</p>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; color: ${score >= 70 ? '#00d4ff' : score >= 40 ? '#f0a500' : '#666'};">
                  ${scoreBadge} — ${score}/100
                </span>
              </div>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin"
                style="display:block; background:#00d4ff; color:#0a1428; text-align:center; padding:14px; border-radius:8px; text-decoration:none; font-weight:bold;">
                Ver en el panel admin →
              </a>
            </div>
          `,
        })
      }

      // Email de confirmación al usuario
      await transporter.sendMail({
        from: `"Mooveshark IA 🦈" <${process.env.GMAIL_USER}>`,
        to: data.email,
        subject: `🦈 Recibimos tu solicitud — Mooveshark IA`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a1428; color: #fff; padding: 32px; border-radius: 12px;">
            <h1 style="color: #00d4ff; margin-bottom: 4px;">🦈 Mooveshark IA</h1>
            <p style="color: #666; margin-top: 0;">Confirmación de solicitud</p>
            <div style="background: #ffffff10; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h2 style="margin: 0 0 8px; color: #fff;">¡Hola, ${data.fullName}!</h2>
              <p style="color: #ccc; margin: 0; line-height: 1.6;">
                Recibimos tu solicitud para <strong style="color:#00d4ff">${agentLabel}</strong> en <strong style="color:#fff">${data.company}</strong>.
                Un especialista de Mooveshark IA te va a contactar en menos de <strong style="color:#fff">24 horas</strong> para configurar tu agente.
              </p>
            </div>
            <div style="background: #ffffff08; border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 3px solid #00d4ff;">
              <p style="margin: 0; color: #aaa; font-size: 13px;">
                <strong style="color:#fff">¿Preguntas?</strong> Respondé este email y te atendemos de inmediato.
              </p>
            </div>
            <p style="color: #444; font-size: 12px; text-align: center; margin-top: 24px;">
              Mooveshark IA · Buenos Aires, Argentina
            </p>
          </div>
        `,
      })

    } catch (e) {
      console.warn('[nodemailer] Email no enviado:', e)
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