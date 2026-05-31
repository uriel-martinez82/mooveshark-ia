import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { AdminLeadsTable } from '@/components/admin/AdminLeadsTable'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { auth } from '@/lib/auth/config'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session  = await auth()
  const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt))

  return (
    <div className="min-h-screen bg-shark-dark">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <AdminHeader email={session?.user?.email ?? ''} />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total leads',     value: allLeads.length },
            { label: 'Leads calientes', value: allLeads.filter(l => (l.score ?? 0) >= 70).length, hot: true },
            { label: 'Leads tibios',    value: allLeads.filter(l => (l.score ?? 0) >= 40 && (l.score ?? 0) < 70).length },
            { label: 'Convertidos',     value: allLeads.filter(l => l.status === 'converted').length },
          ].map(stat => (
            <div key={stat.label} className="card-dark p-5 rounded-xl">
              <p className="text-xs text-white/40 mb-1 font-medium tracking-wide">{stat.label}</p>
              <p className={`font-display font-bold text-3xl ${stat.hot ? 'text-shark-cyan' : 'text-white'}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <AdminLeadsTable leads={allLeads} />
      </div>
    </div>
  )
}
