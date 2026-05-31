import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { agents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateSchema = z.object({
  name:     z.string().min(2).optional(),
  tone:     z.enum(['formal', 'friendly', 'neutral']).optional(),
  language: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body   = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 })

    const [agent] = await db.update(agents)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(agents.id, params.id))
      .returning()

    return NextResponse.json({ success: true, data: agent })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
