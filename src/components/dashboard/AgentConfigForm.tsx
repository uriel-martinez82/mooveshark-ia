'use client'

import { useState } from 'react'

interface Agent {
  id: string
  name: string
  tone: string | null
  language: string | null
  systemPrompt: string
}

export function AgentConfigForm({ agent }: { agent: Agent }) {
  const [name, setName]             = useState(agent.name)
  const [tone, setTone]             = useState(agent.tone ?? 'friendly')
  const [language, setLanguage]     = useState(agent.language ?? 'es')
  const [loading, setLoading]       = useState(false)
  const [saved, setSaved]           = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await fetch(`/api/agents/${agent.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, tone, language }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  const inputClass  = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-shark-cyan/50 transition-colors"
  const selectClass = inputClass + " appearance-none"
  const labelClass  = "block text-xs font-medium text-white/50 mb-1.5 tracking-wide"

  return (
    <div className="max-w-lg">
      <div className="card-dark rounded-2xl p-6 flex flex-col gap-5">

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

        <button
          onClick={handleSave}
          disabled={loading}
          className={`btn-primary justify-center disabled:opacity-50 ${saved ? 'bg-emerald-400' : ''}`}
        >
          {saved ? '✓ Guardado' : loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
