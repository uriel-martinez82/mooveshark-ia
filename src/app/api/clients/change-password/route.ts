import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { clients } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })

    const user     = session.user as Record<string, unknown>
    const clientId = user?.id as string

    const { password } = await req.json()
    if (!password || password.length < 8) {
      return NextResponse.json({ success: false, error: 'Contraseña muy corta' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await db.update(clients)
      .set({ passwordHash, mustChangePassword: false, updatedAt: new Date() })
      .where(eq(clients.id, clientId))

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[POST /api/clients/change-password]', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}