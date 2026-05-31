import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const user = session.user as Record<string, unknown>

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
