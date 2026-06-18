'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const AGENTS = [
  { value: 'customer-support',   label: 'Atención al cliente',     avatar: '🎧' },
  { value: 'lead-qualification', label: 'Calificación de leads',    avatar: '🎯' },
  { value: 'sales-sdr',          label: 'Ventas / SDR',             avatar: '💼' },
  { value: 'data-analysis',      label: 'Análisis de datos',        avatar: '📊' },
  { value: 'onboarding',         label: 'Onboarding',               avatar: '🧭' },
  { value: 'hr-recruitment',     label: 'RRHH / Reclutamiento',     avatar: '🔍' },
  { value: 'collections',        label: 'Cobranzas',                avatar: '💰' },
  { value: 'gastronomy-pastry',  label: 'Gastronomía & Repostería', avatar: '🧁' },
]

interface Lead {
  id: string
  fullName: string
  email: string
  company: string
  agentsInterested: unknown
  score: number | null
}

export function ConvertLeadModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const router  = useRouter()
  const agentsFromLead = (Array.isArray(lead.agentsInterested) ? lead.agentsInterested : []) as string[]
  const suggestedAgent = agentsFromLead[0] ?? 'customer-support'

  const [agentType, setAgentType] = useState(suggestedAgent)
  const [agentName, setAgentName] = useState('')
  const [password, setPassword]   = useState('')
  const [plan, setPlan]           = useState('starter')
  const [tone, setTone]           = useState('friendly')
  const [language, setLanguage]   = useState('es')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company:   lead.company,
          email:     lead.email,
          password,
          plan,
          agentType,
          agentName: agentName || AGENTS.find(a => a.value === agentType)?.label,
          tone,
          language,
          leadId:    lead.id,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setDone(true)
        setTimeout(() => { onClose(); router.refresh() }, 1500)
      } else {
        setError(data.error ?? 'Error al convertir el lead')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const inputClass  = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-shark-cyan/50 transition-colors"
  const selectClass = inputClass + " appearance-none"
  const labelClass  = "block text-xs font-medium text-white/50 mb-1.5 tracking-wide"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#0a1428] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-white text-lg">Convertir en cliente</h2>
            <p className="text-white/40 text-sm mt-0.5">{lead.company} · {lead.email}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">×</button>
        </div>

        {done ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">✅</div>
            <p className="text-white font-medium">Cliente y agente creados</p>
            <p className="text-white/40 text-sm mt-1">Redirigiendo...</p>
          </div>
        ) : (
          <form onSubmit={handleConvert} className="flex flex-col gap-4">

            {/* Score badge */}
            <div className="flex items-center gap-2 bg-white/3 rounded-xl px-4 py-3">
              <span className="text-sm">{(lead.score ?? 0) >= 70 ? '🔥' : (lead.score ?? 0) >= 40 ? '⚡' : '❄️'}</span>
              <div>
                <p className="text-xs text-white/40">Score del lead</p>
                <p className="text-white font-semibold text-sm">{lead.score ?? 0}/100 — {(lead.score ?? 0) >= 70 ? 'Caliente' : (lead.score ?? 0) >= 40 ? 'Tibio' : 'Frío'}</p>
              </div>
              <div className="ml-auto">
                <p className="text-xs text-white/40">Agentes solicitados</p>
                <p className="text-white/70 text-xs">{agentsFromLead.length > 0 ? agentsFromLead.join(', ') : 'Ninguno'}</p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Tipo de agente a activar</label>
              <div className="grid grid-cols-2 gap-1.5">
                {AGENTS.map(a => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setAgentType(a.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                      agentType === a.value
                        ? 'bg-shark-cyan/10 border-shark-cyan/50 text-shark-cyan'
                        : 'bg-white/3 border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    <span>{a.avatar}</span>
                    <span className="leading-tight">{a.label}</span>
                    {agentsFromLead.includes(a.value) && (
                      <span className="ml-auto text-[9px] text-shark-cyan">★ Lead</span>
                    )}
                  </button>
                ))}
              </div>
              {agentsFromLead.length > 0 && (
                <p className="text-[10px] text-white/30 mt-1.5">★ = agentes que solicitó el lead</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Nombre del agente</label>
                <input
                  className={inputClass}
                  placeholder={AGENTS.find(a => a.value === agentType)?.label}
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Plan</label>
                <select className={selectClass} value={plan} onChange={e => setPlan(e.target.value)}>
                  <option value="starter">Starter</option>
                  <option value="business">Business</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Tono</label>
                <select className={selectClass} value={tone} onChange={e => setTone(e.target.value)}>
                  <option value="friendly">Amigable</option>
                  <option value="formal">Formal</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Idioma</label>
                <select className={selectClass} value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Password inicial para el cliente</label>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center text-sm py-2.5">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !password || password.length < 8}
                className="btn-primary flex-1 justify-center text-sm py-2.5 disabled:opacity-50"
              >
                {loading ? 'Convirtiendo...' : '✓ Convertir en cliente'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
