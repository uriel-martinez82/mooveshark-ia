import { inngest } from './client'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ─── 1. Nuevo lead ────────────────────────────────────────────────────────────
export const onLeadCreated = inngest.createFunction(
  { id: 'on-lead-created' },
  { event: 'lead/created' },
  async ({ event, step }) => {
    const { leadId, email, fullName, company, score, urgency } = event.data

    // Notificar al equipo interno vía Slack/email
    await step.run('notify-team', async () => {
      await resend.emails.send({
        from:    process.env.RESEND_FROM!,
        to:      'equipo@mooveshark.ia',
        subject: `🦈 Nuevo lead: ${company} (score: ${score})`,
        html: `
          <h2>Nuevo lead recibido</h2>
          <p><strong>Empresa:</strong> ${company}</p>
          <p><strong>Contacto:</strong> ${fullName} — ${email}</p>
          <p><strong>Score:</strong> ${score}/100</p>
          <p><strong>Urgencia:</strong> ${urgency}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/leads/${leadId}">Ver lead en el panel →</a></p>
        `,
      })
    })

    // Email de confirmación al prospecto
    await step.run('send-confirmation', async () => {
      await resend.emails.send({
        from:    process.env.RESEND_FROM!,
        to:      email,
        subject: `Recibimos tu consulta, ${fullName.split(' ')[0]} 👋`,
        html: `
          <h2>¡Gracias por contactarnos!</h2>
          <p>Hola ${fullName.split(' ')[0]},</p>
          <p>Recibimos tu consulta sobre Mooveshark IA para <strong>${company}</strong>.</p>
          <p>Un especialista se va a comunicar con vos en las próximas 24 horas.</p>
          <p>Mientras tanto, podés conocer más sobre nuestros agentes en <a href="${process.env.NEXT_PUBLIC_APP_URL}">mooveshark.ia</a></p>
          <br/>
          <p>Equipo Mooveshark IA 🦈</p>
        `,
      })
    })

    // Si es lead caliente, follow-up a las 2 horas si no fue contactado
    if (score >= 70) {
      await step.sleep('wait-for-contact', '2h')

      await step.run('hot-lead-followup', async () => {
        // En producción: verificar si ya fue contactado en la DB
        // Por ahora enviamos el reminder al equipo
        await resend.emails.send({
          from:    process.env.RESEND_FROM!,
          to:      'equipo@mooveshark.ia',
          subject: `🔥 RECORDATORIO: Lead caliente sin contactar — ${company}`,
          html: `<p>El lead de <strong>${company}</strong> (score ${score}) lleva 2 horas sin ser contactado.</p>
                 <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/leads/${leadId}">Ir al lead →</a></p>`,
        })
      })
    }
  }
)

// ─── 2. Agente activado ───────────────────────────────────────────────────────
export const onAgentActivated = inngest.createFunction(
  { id: 'on-agent-activated' },
  { event: 'agent/activated' },
  async ({ event, step }) => {
    const { email, company, agentType } = event.data

    await step.run('send-activation-email', async () => {
      await resend.emails.send({
        from:    process.env.RESEND_FROM!,
        to:      email,
        subject: `Tu agente de IA está listo 🚀`,
        html: `
          <h2>¡Tu agente está activo!</h2>
          <p>Hola,</p>
          <p>El agente <strong>${agentType}</strong> de <strong>${company}</strong> acaba de ser activado.</p>
          <p>Ya podés empezar a usarlo desde tu panel.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Ir al dashboard →</a></p>
        `,
      })
    })
  }
)

// ─── 3. Trial por vencer ──────────────────────────────────────────────────────
export const onTrialEnding = inngest.createFunction(
  { id: 'on-trial-ending' },
  { event: 'client/trial-ending' },
  async ({ event, step }) => {
    const { email, company, daysLeft } = event.data

    await step.run('send-trial-ending-email', async () => {
      await resend.emails.send({
        from:    process.env.RESEND_FROM!,
        to:      email,
        subject: `Tu período de prueba vence en ${daysLeft} días`,
        html: `
          <h2>Tu trial está por vencer</h2>
          <p>Hola,</p>
          <p>El período de prueba de <strong>${company}</strong> vence en <strong>${daysLeft} días</strong>.</p>
          <p>Para continuar sin interrupciones, elegí tu plan:</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing">Ver planes →</a></p>
        `,
      })
    })
  }
)

export const functions = [onLeadCreated, onAgentActivated, onTrialEnding]
