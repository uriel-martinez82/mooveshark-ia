'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const AGENT_TYPES = [
  { value: 'customer-support',   label: 'Atención al cliente' },
  { value: 'lead-qualification', label: 'Calificación de leads' },
  { value: 'sales-sdr',          label: 'Ventas / SDR' },
  { value: 'data-analysis',      label: 'Análisis de datos' },
  { value: 'onboarding',         label: 'Onboarding' },
  { value: 'hr-recruitment',     label: 'RRHH / Reclutamiento' },
  { value: 'collections',        label: 'Cobranzas' },
]

export function CreateClientModal() {
  const router = useRouter()
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    company:   '',
    email:     '',
    password:  '',
    plan:      'starter',
    agentType: 'customer-support',
    agentName: '',
    tone:      'friendly',
    language:  'es',
  })

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/clients', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          setOpen(false)
          setSuccess(false)
          setForm({ company: '', email: '', password: '', plan: 'starter', agentType: 'customer-support', agentName: '', tone: 'friendly', language: 'es' })
          router.refresh()
        }, 1500)
      } else {
        setError(data.error ?? 'Error al crear el cliente')
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
    <>
      <button onClick={() => setOpen(true)} className="btn-primary text-sm py-2.5 px-5">
        + Nuevo cliente
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-[#0a1428] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-bold text-white text-lg">Nuevo cliente</h2>
                <p className="text-white/40 text-sm mt-0.5">Crear cliente y activar su agente</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white text-xl">×</button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">✅</div>
                <p className="text-white font-medium">Cliente creado correctamente</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Datos del cliente</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Empresa</label>
                    <input className={inputClass} placeholder="Nombre de empresa" value={form.company} onChange={e => update('company', e.target.value)} required />
                  </div>
                  <div>
                    <label className={labelClass}>Plan</label>
                    <select className={selectClass} value={form.plan} onChange={e => update('plan', e.target.value)}>
                      <option value="starter">Starter</option>
                      <option value="business">Business</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input className={inputClass} type="email" placeholder="cliente@empresa.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                  </div>
                  <div>
                    <label className={labelClass}>Password inicial</label>
                    <input className={inputClass} type="text" placeholder="Mínimo 8 caracteres" value={form.password} onChange={e => update('password', e.target.value)} required minLength={8} />
                  </div>
                </div>

                <div className="border-t border-white/8 pt-4">
                  <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Configuración del agente</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Tipo de agente</label>
                      <select className={selectClass} value={form.agentType} onChange={e => update('agentType', e.target.value)}>
                        {AGENT_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Nombre del agente</label>
                      <input className={inputClass} placeholder="Ej: Asistente de soporte" value={form.agentName} onChange={e => update('agentName', e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelClass}>Tono</label>
                      <select className={selectClass} value={form.tone} onChange={e => update('tone', e.target.value)}>
                        <option value="friendly">Amigable</option>
                        <option value="formal">Formal</option>
                        <option value="neutral">Neutral</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Idioma</label>
                      <select className={selectClass} value={form.language} onChange={e => update('language', e.target.value)}>
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="pt">Português</option>
                      </select>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                )}

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1 justify-center text-sm py-2.5">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center text-sm py-2.5 disabled:opacity-50">
                    {loading ? 'Creando...' : 'Crear cliente →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
