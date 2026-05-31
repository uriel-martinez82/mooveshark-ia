import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { AdminLeadsTable } from '@/components/admin/AdminLeadsTable'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt))

  return (
    <div className="min-h-screen bg-shark-dark">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-shark-cyan to-blue-500 flex items-center justify-center text-sm">🦈</div>
              <span className="font-display font-bold text-white">Mooveshark <span className="text-shark-cyan">IA</span></span>
            </div>
            <h1 className="font-display font-bold text-2xl text-white mt-3">Panel admin</h1>
            <p className="text-white/40 text-sm mt-1">Gestión de leads y clientes</p>
          </div>
          <a href="/" className="btn-ghost text-sm py-2 px-4">← Ver landing</a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total leads', value: allLeads.length },
            { label: 'Leads calientes', value: allLeads.filter(l => (l.score ?? 0) >= 70).length, hot: true },
            { label: 'Leads tibios', value: allLeads.filter(l => (l.score ?? 0) >= 40 && (l.score ?? 0) < 70).length },
            { label: 'Convertidos', value: allLeads.filter(l => l.status === 'converted').length },
          ].map(stat => (
            <div key={stat.label} className="card-dark p-5 rounded-xl">
              <p className="text-xs text-white/40 mb-1 font-medium tracking-wide">{stat.label}</p>
              <p className={`font-display font-bold text-3xl ${stat.hot ? 'text-shark-cyan' : 'text-white'}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Leads table */}
        <AdminLeadsTable leads={allLeads} />
      </div>
    </div>
  )
}
