'use client'

import { useState } from 'react'

type Lead = {
  id: string
  fullName: string
  email: string
  company: string
  role: string
  country: string
  industry: string
  companySize: string
  problem: string
  agentsInterested: unknown
  urgency: string
  budget: string
  score: number | null
  status: string | null
  createdAt: Date | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:        { label: 'Nuevo',      color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  contacted:  { label: 'Contactado', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  qualified:  { label: 'Calificado', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  converted:  { label: 'Convertido', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  lost:       { label: 'Perdido',    color: 'bg-red-500/15 text-red-400 border-red-500/20' },
}

const URGENCY_LABELS: Record<string, string> = {
  immediate:  'Inmediata',
  '1-3months': '1-3 meses',
  exploring:  'Explorando',
}

const BUDGET_LABELS: Record<string, string> = {
  under500:   '< $500',
  '500-1500': '$500–1.5k',
  '1500plus': '> $1.5k',
  undefined:  'No definido',
}

function ScoreBadge({ score }: { score: number | null }) {
  const s = score ?? 0
  if (s >= 70) return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">🔥 {s}</span>
  if (s >= 40) return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">⚡ {s}</span>
  return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">❄️ {s}</span>
}

function LeadModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const agents = Array.isArray(lead.agentsInterested) ? lead.agentsInterested as string[] : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#0a1428] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-white text-lg">{lead.fullName}</h2>
            <p className="text-white/50 text-sm">{lead.role} — {lead.company}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <ScoreBadge score={lead.score} />
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_LABELS[lead.status ?? 'new']?.color}`}>
            {STATUS_LABELS[lead.status ?? 'new']?.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Email',     value: lead.email },
            { label: 'País',      value: lead.country },
            { label: 'Industria', value: lead.industry },
            { label: 'Tamaño',    value: lead.companySize + ' emp.' },
            { label: 'Urgencia',  value: URGENCY_LABELS[lead.urgency] ?? lead.urgency },
            { label: 'Presupuesto', value: BUDGET_LABELS[lead.budget] ?? lead.budget },
          ].map(f => (
            <div key={f.label} className="bg-white/3 rounded-lg p-3">
              <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1">{f.label}</p>
              <p className="text-sm text-white/80">{f.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/3 rounded-lg p-3 mb-4">
          <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider mb-2">Problema a resolver</p>
          <p className="text-sm text-white/80 leading-relaxed">{lead.problem}</p>
        </div>

        {agents.length > 0 && (
          <div className="bg-white/3 rounded-lg p-3 mb-4">
            <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider mb-2">Agentes de interés</p>
            <div className="flex flex-wrap gap-1.5">
              {agents.map((a: string) => (
                <span key={a} className="text-xs px-2 py-1 rounded-md bg-shark-cyan/10 text-shark-cyan border border-shark-cyan/20">{a}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <a
            href={`mailto:${lead.email}`}
            className="btn-primary flex-1 justify-center text-sm py-2.5"
          >
            Contactar →
          </a>
        </div>
      </div>
    </div>
  )
}

export function AdminLeadsTable({ leads }: { leads: Lead[] }) {
  const [selected, setSelected] = useState<Lead | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? leads : leads.filter(l => {
    if (filter === 'hot')  return (l.score ?? 0) >= 70
    if (filter === 'warm') return (l.score ?? 0) >= 40 && (l.score ?? 0) < 70
    if (filter === 'cold') return (l.score ?? 0) < 40
    return l.status === filter
  })

  return (
    <>
      {selected && <LeadModal lead={selected} onClose={() => setSelected(null)} />}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {[
          { value: 'all',  label: 'Todos' },
          { value: 'hot',  label: '🔥 Calientes' },
          { value: 'warm', label: '⚡ Tibios' },
          { value: 'new',  label: 'Nuevos' },
          { value: 'contacted', label: 'Contactados' },
          { value: 'converted', label: 'Convertidos' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${
              filter === f.value
                ? 'bg-shark-cyan/10 border-shark-cyan/40 text-shark-cyan'
                : 'bg-white/3 border-white/10 text-white/50 hover:border-white/20'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-white/30">{filtered.length} leads</span>
      </div>

      {/* Table */}
      <div className="border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8 bg-white/[0.02]">
              {['Contacto', 'Empresa', 'Score', 'Agentes', 'Urgencia', 'Estado', 'Fecha'].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-white/30 text-sm py-12">No hay leads con este filtro</td></tr>
            ) : filtered.map((lead, i) => (
              <tr
                key={lead.id}
                onClick={() => setSelected(lead)}
                className={`border-b border-white/5 cursor-pointer hover:bg-white/[0.03] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
              >
                <td className="px-4 py-3.5">
                  <p className="text-sm font-medium text-white">{lead.fullName}</p>
                  <p className="text-xs text-white/40">{lead.email}</p>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-sm text-white/80">{lead.company}</p>
                  <p className="text-xs text-white/40">{lead.industry}</p>
                </td>
                <td className="px-4 py-3.5"><ScoreBadge score={lead.score} /></td>
                <td className="px-4 py-3.5">
                  <span className="text-xs text-white/50">
                    {Array.isArray(lead.agentsInterested) ? (lead.agentsInterested as string[]).length : 0} agentes
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs text-white/60">{URGENCY_LABELS[lead.urgency] ?? lead.urgency}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_LABELS[lead.status ?? 'new']?.color}`}>
                    {STATUS_LABELS[lead.status ?? 'new']?.label}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs text-white/40">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
