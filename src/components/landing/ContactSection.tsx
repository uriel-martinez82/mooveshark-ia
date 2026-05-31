'use client'

import { useState } from 'react'

export function ContactSection() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    fullName: '', email: '', company: '', role: '', country: '',
    industry: '', companySize: '', monthlyVolume: '', hasCRM: false, crmName: '',
    problem: '', agentsInterested: [] as string[], urgency: '', budget: '',
  })

  const agents = [
    { value: 'customer-support',    label: 'Atención al cliente' },
    { value: 'lead-qualification',  label: 'Calificación de leads' },
    { value: 'sales-sdr',           label: 'Ventas / SDR' },
    { value: 'data-analysis',       label: 'Análisis de datos' },
    { value: 'onboarding',          label: 'Onboarding' },
    { value: 'hr-recruitment',      label: 'RRHH / Reclutamiento' },
    { value: 'collections',         label: 'Cobranzas' },
  ]

  const update = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }))

  const toggleAgent = (val: string) => {
    setForm(f => ({
      ...f,
      agentsInterested: f.agentsInterested.includes(val)
        ? f.agentsInterested.filter(a => a !== val)
        : [...f.agentsInterested, val],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setDone(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-shark-cyan/50 transition-colors"
  const selectClass = inputClass + " appearance-none"
  const labelClass = "block text-xs font-medium text-white/50 mb-1.5 tracking-wide"

  return (
    <section id="contacto" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-12">
          <p className="section-label">Contacto</p>
          <h2 className="section-title mb-4">
            Activá tu agente hoy
          </h2>
          <p className="section-subtitle mx-auto text-center">
            Completá el formulario y nos ponemos en contacto en menos de 24 horas.
          </p>
        </div>

        {done ? (
          <div className="text-center py-16 card-dark rounded-2xl">
            <div className="text-4xl mb-4">🦈</div>
            <h3 className="font-display font-bold text-xl text-white mb-2">¡Listo! Recibimos tu consulta</h3>
            <p className="text-white/50 text-sm">Te contactamos en menos de 24 horas.</p>
          </div>
        ) : (
          <div className="card-dark rounded-2xl p-8">

            {/* Steps indicator */}
            <div className="flex items-center gap-2 mb-8">
              {[1,2,3].map(s => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s ? 'bg-shark-cyan text-shark-dark' : 'bg-white/10 text-white/40'
                  }`}>{s}</div>
                  <div className={`flex-1 h-px transition-all ${step > s ? 'bg-shark-cyan/40' : 'bg-white/10'}`} />
                </div>
              ))}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= 3 ? 'bg-shark-cyan text-shark-dark' : 'bg-white/10 text-white/40'
              }`}>✓</div>
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-display font-semibold text-white text-base mb-2">Tu información</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Nombre completo</label>
                    <input className={inputClass} placeholder="Juan García" value={form.fullName} onChange={e => update('fullName', e.target.value)}/>
                  </div>
                  <div>
                    <label className={labelClass}>Email corporativo</label>
                    <input className={inputClass} type="email" placeholder="juan@empresa.com" value={form.email} onChange={e => update('email', e.target.value)}/>
                  </div>
                  <div>
                    <label className={labelClass}>Empresa</label>
                    <input className={inputClass} placeholder="Nombre de tu empresa" value={form.company} onChange={e => update('company', e.target.value)}/>
                  </div>
                  <div>
                    <label className={labelClass}>Cargo</label>
                    <input className={inputClass} placeholder="CEO, Gerente, etc." value={form.role} onChange={e => update('role', e.target.value)}/>
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>País</label>
                    <input className={inputClass} placeholder="Argentina" value={form.country} onChange={e => update('country', e.target.value)}/>
                  </div>
                </div>
                <button
                  className="btn-primary w-full justify-center mt-2"
                  onClick={() => setStep(2)}
                  disabled={!form.fullName || !form.email || !form.company}
                >
                  Continuar →
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-display font-semibold text-white text-base mb-2">Tu empresa</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Industria</label>
                    <select className={selectClass} value={form.industry} onChange={e => update('industry', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      {['Retail / E-commerce','Salud','Finanzas','Logística','Tecnología','Educación','Inmobiliaria','Manufactura','Otro'].map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Tamaño de empresa</label>
                    <select className={selectClass} value={form.companySize} onChange={e => update('companySize', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      {['1-10','11-50','51-200','200+'].map(o => <option key={o} value={o}>{o} empleados</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Interacciones/mes con clientes</label>
                    <select className={selectClass} value={form.monthlyVolume} onChange={e => update('monthlyVolume', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      {[['less-10','Menos de 10'],['10-100','10 a 100'],['100-1000','100 a 1.000'],['1000+','Más de 1.000']].map(([v,l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>¿Usás algún CRM?</label>
                    <select className={selectClass} value={form.hasCRM ? 'si' : 'no'} onChange={e => update('hasCRM', e.target.value === 'si')}>
                      <option value="no">No</option>
                      <option value="si">Sí</option>
                    </select>
                  </div>
                  {form.hasCRM && (
                    <div className="col-span-2">
                      <label className={labelClass}>¿Cuál CRM?</label>
                      <input className={inputClass} placeholder="HubSpot, Salesforce, Zoho..." value={form.crmName} onChange={e => update('crmName', e.target.value)}/>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-2">
                  <button className="btn-ghost flex-1 justify-center" onClick={() => setStep(1)}>← Atrás</button>
                  <button className="btn-primary flex-1 justify-center" onClick={() => setStep(3)} disabled={!form.industry || !form.companySize}>Continuar →</button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-display font-semibold text-white text-base mb-2">Tu necesidad</h3>

                <div>
                  <label className={labelClass}>¿Qué problema querés resolver con IA?</label>
                  <textarea
                    className={inputClass + " resize-none h-24"}
                    placeholder="Ej: Nuestro equipo de soporte no da abasto con las consultas..."
                    value={form.problem}
                    onChange={e => update('problem', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>¿Qué agentes te interesan? (podés elegir varios)</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {agents.map(a => (
                      <button
                        key={a.value}
                        onClick={() => toggleAgent(a.value)}
                        className={`text-left px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                          form.agentsInterested.includes(a.value)
                            ? 'bg-shark-cyan/10 border-shark-cyan/50 text-shark-cyan'
                            : 'bg-white/3 border-white/10 text-white/50 hover:border-white/20'
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Urgencia</label>
                    <select className={selectClass} value={form.urgency} onChange={e => update('urgency', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      <option value="immediate">Inmediata</option>
                      <option value="1-3months">En 1-3 meses</option>
                      <option value="exploring">Solo explorando</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Presupuesto estimado (USD/mes)</label>
                    <select className={selectClass} value={form.budget} onChange={e => update('budget', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      <option value="under500">Menos de $500</option>
                      <option value="500-1500">$500 - $1.500</option>
                      <option value="1500plus">Más de $1.500</option>
                      <option value="undefined">No definido</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button className="btn-ghost flex-1 justify-center" onClick={() => setStep(2)}>← Atrás</button>
                  <button
                    className="btn-primary flex-1 justify-center"
                    onClick={handleSubmit}
                    disabled={loading || !form.problem || form.agentsInterested.length === 0}
                  >
                    {loading ? 'Enviando...' : 'Enviar consulta →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
