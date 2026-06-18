import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clients } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `Moov-${code}-2026`
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [client] = await db.select().from(clients).where(eq(clients.id, params.id))
    if (!client) {
      return NextResponse.json({ success: false, error: 'Cliente no encontrado' }, { status: 404 })
    }

    const tempPassword = generateTempPassword()
    const passwordHash = await bcrypt.hash(tempPassword, 12)

    await db.update(clients)
      .set({ passwordHash, mustChangePassword: true, updatedAt: new Date() })
      .where(eq(clients.id, params.id))

    // Enviar email con credenciales temporales
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const nodemailer = await import('nodemailer')
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })

      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`

      await transporter.sendMail({
        from: `"Mooveshark IA 🦈" <${process.env.GMAIL_USER}>`,
        to: client.email,
        subject: `🦈 Tus credenciales de acceso — Mooveshark IA`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a1428; color: #fff; padding: 32px; border-radius: 12px;">
            <h1 style="color: #00d4ff; margin-bottom: 4px;">🦈 Mooveshark IA</h1>
            <p style="color: #666; margin-top: 0;">Acceso a tu panel</p>

            <div style="background: #ffffff10; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h2 style="margin: 0 0 8px; color: #fff;">¡Hola, ${client.company}!</h2>
              <p style="color: #ccc; margin: 0; line-height: 1.6;">
                Te enviamos una contraseña temporal para acceder a tu panel de Mooveshark IA.
              </p>
            </div>

            <div style="background: #ffffff08; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 3px solid #00d4ff;">
              <p style="margin: 0 0 12px; color: #fff; font-weight: bold;">Tus credenciales:</p>
              <p style="margin: 4px 0; color: #aaa;"><b style="color:#fff">Email:</b> ${client.email}</p>
              <p style="margin: 4px 0; color: #aaa;"><b style="color:#fff">Contraseña temporal:</b> <span style="color:#00d4ff; font-size: 18px; font-weight: bold;">${tempPassword}</span></p>
            </div>

            <div style="background: #f59e0b15; border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 3px solid #f59e0b;">
              <p style="margin: 0; color: #f59e0b; font-size: 13px;">
                ⚠️ Al ingresar por primera vez deberás cambiar tu contraseña.
              </p>
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
    }

    return NextResponse.json({ success: true, message: 'Credenciales enviadas' })

  } catch (error) {
    console.error('[POST /api/clients/[id]/reset-password]', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}