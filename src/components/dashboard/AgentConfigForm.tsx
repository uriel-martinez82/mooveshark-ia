'use client'

import { useState } from 'react'

interface Agent {
  id: string
  name: string
  tone: string | null
  language: string | null
  systemPrompt: string
  type: string
}

const AGENT_TYPE_LABELS: Record<string, string> = {
  'customer-support':   'Atención al cliente',
  'lead-qualification': 'Calificación de leads',
  'sales-sdr':          'Ventas / SDR',
  'data-analysis':      'Análisis de datos',
  'onboarding':         'Onboarding',
  'hr-recruitment':     'RRHH / Reclutamiento',
  'collections':        'Cobranzas',
}

export function AgentConfigForm({ agent }: { agent: Agent }) {
  const [name, setName]               = useState(agent.name)
  const [tone, setTone]               = useState(agent.tone ?? 'friendly')
  const [language, setLanguage]       = useState(agent.language ?? 'es')
  const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt)
  const [loading, setLoading]         = useState(false)
  const [saved, setSaved]             = useState(false)
  const [error, setError]             = useState('')

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, tone, language, systemPrompt }),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(data.error ?? 'Error al guardar')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const inputClass   = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-shark-cyan/50 transition-colors"
  const selectClass  = inputClass + " appearance-none"
  const labelClass   = "block text-xs font-medium text-white/50 mb-1.5 tracking-wide"

  return (
    <div className="max-w-2xl flex flex-col gap-6">

      {/* Agent type badge */}
      <div className="card-dark p-4 rounded-xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-shark-cyan/10 border border-shark-cyan/20 flex items-center justify-center text-lg">🦈</div>
        <div>
          <p className="text-white font-medium text-sm">{agent.name}</p>
          <p className="text-white/40 text-xs">{AGENT_TYPE_LABELS[agent.type] ?? agent.type}</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Activo
        </span>
      </div>

      {/* Config form */}
      <div className="card-dark rounded-2xl p-6 flex flex-col gap-5">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Configuración básica</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nombre del agente</label>
            <input
              type="text"
              className={inputClass}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Asistente de soporte"
            />
          </div>
          <div>
            <label className={labelClass}>Tono de comunicación</label>
            <select className={selectClass} value={tone} onChange={e => setTone(e.target.value)}>
              <option value="friendly">Amigable</option>
              <option value="formal">Formal</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Idioma principal</label>
            <select className={selectClass} value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
        </div>

        <div className="border-t border-white/8 pt-4">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Instrucciones del agente</p>
          <div>
            <label className={labelClass}>Prompt del sistema</label>
            <textarea
              className={inputClass + " resize-none h-40 leading-relaxed"}
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              placeholder="Describí cómo debe comportarse tu agente..."
            />
            <p className="text-[10px] text-white/25 mt-1.5">
              Personalizá las instrucciones del agente. Podés definir su personalidad, límites y contexto específico de tu negocio.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className={`btn-primary justify-center disabled:opacity-50 transition-all ${saved ? '!bg-emerald-400' : ''}`}
        >
          {saved ? '✓ Cambios guardados' : loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
