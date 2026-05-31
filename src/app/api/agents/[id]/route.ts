import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { agents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { auth } from '@/lib/auth/config'

const updateSchema = z.object({
  name:         z.string().min(2).max(100).optional(),
  tone:         z.enum(['formal', 'friendly', 'neutral']).optional(),
  language:     z.string().optional(),
  systemPrompt: z.string().min(10).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const user     = session.user as Record<string, unknown>
    const clientId = user.id as string

    const body   = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 })
    }

    // Verificar que el agente pertenece al cliente
    const [agent] = await db.select().from(agents)
      .where(and(eq(agents.id, params.id), eq(agents.clientId, clientId)))

    if (!agent) {
      return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 })
    }

    const [updated] = await db.update(agents)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(agents.id, params.id))
      .returning()

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[PATCH /api/agents/[id]]', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
