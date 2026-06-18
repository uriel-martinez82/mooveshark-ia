import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { db } from '@/lib/db'
import { clients } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const user     = session.user as Record<string, unknown>
  const clientId = user?.id as string

  // Chequear si debe cambiar contraseña
  const [client] = await db.select().from(clients).where(eq(clients.id, clientId))
  if (client?.mustChangePassword) {
    redirect('/dashboard/change-password')
  }

  return (
    <div className="min-h-screen bg-shark-dark flex">
      <DashboardSidebar
        company={user.company as string}
        email={user.email as string}
        plan={user.plan as string}
      />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}