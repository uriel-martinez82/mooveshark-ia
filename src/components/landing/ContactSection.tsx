'use client'

import { useState } from 'react'

const AGENTS = [
  { value: 'customer-support',   label: 'Atención al cliente',     avatar: '🎧', desc: 'Soporte 24/7, reclamos y consultas' },
  { value: 'lead-qualification', label: 'Calificación de leads',   avatar: '🎯', desc: 'Filtrá y puntuá prospectos' },
  { value: 'sales-sdr',          label: 'Ventas / SDR',            avatar: '💼', desc: 'Prospección y cierre de ventas' },
  { value: 'data-analysis',      label: 'Análisis de datos',       avatar: '📊', desc: 'Insights y reportes automáticos' },
  { value: 'onboarding',         label: 'Onboarding',              avatar: '🧭', desc: 'Incorporación de clientes o empleados' },
  { value: 'hr-recruitment',     label: 'RRHH / Reclutamiento',    avatar: '🔍', desc: 'Filtro inteligente de candidatos' },
  { value: 'collections',        label: 'Cobranzas',               avatar: '💰', desc: 'Recupero de deuda con empatía' },
  { value: 'gastronomy-pastry',  label: 'Gastronomía & Repostería',avatar: '🧁', desc: 'Recetas, presupuestos y pedidos' },
  { value: 'education',          label: 'Educación',               avatar: '📚', desc: 'Clases, planificación y contenido educativo' },
  { value: 'legal',              label: 'Legal / Compliance',      avatar: '⚖️', desc: 'Consultas legales y cumplimiento normativo' },
  { value: 'health',             label: 'Salud & Bienestar',       avatar: '🏥', desc: 'Orientación médica y gestión de pacientes' },
  { value: 'other',              label: 'Otro / Personalizado',    avatar: '✨', desc: 'Describí tu caso y lo creamos a medida' },
]

const USES: Record<string, string[]> = {
  'customer-support':   ['Resolver consultas frecuentes', 'Gestionar reclamos y devoluciones', 'Derivar a agentes humanos', 'Seguimiento post-venta'],
  'lead-qualification': ['Calificar leads entrantes', 'Puntuar prospectos automáticamente', 'Agendar reuniones de ventas', 'Nutrir leads fríos'],
  'sales-sdr':          ['Primer contacto con prospectos', 'Follow-up automatizado', 'Agendar demos', 'Manejar objeciones iniciales'],
  'data-analysis':      ['Responder preguntas sobre métricas', 'Generar reportes automáticos', 'Detectar anomalías', 'Comparar KPIs'],
  'onboarding':         ['Guiar nuevos clientes', 'Incorporar empleados nuevos', 'Certificaciones y capacitación', 'Checklists de ingreso'],
  'hr-recruitment':     ['Entrevistas iniciales', 'Filtro de CVs', 'Evaluación de soft skills', 'Coordinación de entrevistas'],
  'collections':        ['Recordatorios de pago', 'Negociación de planes de pago', 'Gestión de deuda vencida', 'Retención de clientes'],
  'gastronomy-pastry':  ['Tomar pedidos personalizados', 'Consultar recetas y técnicas', 'Calcular presupuestos', 'Gestionar restricciones dietarias'],
  'education':          ['Planificar actividades y clases', 'Responder dudas de alumnos', 'Generar material didáctico', 'Gestionar consultas de inscripción'],
  'legal':              ['Consultas legales básicas', 'Revisión de contratos', 'Compliance y normativas', 'Orientación sobre procesos legales'],
  'health':             ['Orientación sobre síntomas', 'Gestión de turnos', 'Seguimiento de pacientes', 'Información sobre tratamientos'],
  'other':              ['Describilo en el campo de tareas específicas'],
}

export function ContactSection() {
  const [step, setStep]     = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)
  const [score, setScore]   = useState<number | null>(null)
  const [form, setForm]     = useState({
    fullName: '', email: '', company: '', industry: '', country: '',
    agentType: '', primaryUse: '', dailyVolume: '', hasTool: '', toolName: '',
    agentDescription: '',
    urgency: '', budget: '', howDidYouFindUs: '',
  })

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const selectedAgent = AGENTS.find(a => a.value === form.agentType)
      const payload = {
        fullName:         form.fullName,
        email:            form.email,
        company:          form.company,
        role:             'No especificado',
        country:          form.country,
        industry:         form.industry,
        companySize:      form.dailyVolume,
        monthlyVolume:    form.dailyVolume,
        hasCRM:           form.hasTool === 'si',
        crmName:          form.toolName,
        problem:          form.agentDescription || form.primaryUse || 'No especificado',
        agentsInterested: [form.agentType].filter(Boolean),
        urgency:          form.urgency || 'exploring',
        budget:           form.budget || 'undefined',
      }
      const res  = await fetch('/api/leads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setScore(data.data.score)
        setDone(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const inputClass  = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-shark-cyan/50 transition-colors"
  const selectClass = inputClass + " appearance-none"
  const labelClass  = "block text-xs font-medium text-white/50 mb-1.5 tracking-wide"

  const canNext1 = form.fullName && form.email && form.company && form.industry && form.country
  const canNext2 = form.agentType && (form.agentType === 'other' || form.primaryUse) && form.dailyVolume

  return (
    <section id="contacto" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="section-label">Empezar</p>
          <h2 className="section-title mb-4">Activá tu agente hoy</h2>
          <p className="section-subtitle mx-auto text-center">
            3 pasos y en menos de 24 horas tenés tu agente configurado y listo.
          </p>
        </div>

        {done ? (
          <div className="text-center py-16 card-dark rounded-2xl px-8">
            <div className="w-20 h-20 rounded-2xl bg-shark-cyan/10 border border-shark-cyan/20 flex items-center justify-center text-4xl mx-auto mb-6">🦈</div>
            <h3 className="font-display font-bold text-2xl text-white mb-3">¡Consulta recibida!</h3>
            <p className="text-white/60 mb-6 leading-relaxed">
              Recibimos tu solicitud correctamente.<br/>
              Un especialista de Mooveshark IA te va a contactar en menos de <strong className="text-white">24 horas</strong> para configurar tu agente.
            </p>
            {score !== null && (
              <div className="inline-flex items-center gap-2 bg-shark-cyan/10 border border-shark-cyan/20 rounded-xl px-5 py-3 mb-6">
                <span className="text-2xl">{score >= 70 ? '🔥' : score >= 40 ? '⚡' : '⭐'}</span>
                <div className="text-left">
                  <p className="text-xs text-white/40">Prioridad de tu solicitud</p>
                  <p className="text-shark-cyan font-semibold">
                    {score >= 70 ? 'Alta — te contactamos hoy' : score >= 40 ? 'Media — te contactamos mañana' : 'Normal — en 24hs'}
                  </p>
                </div>
              </div>
            )}
            <p className="text-white/30 text-xs">
              Revisá tu bandeja de entrada — te enviaremos una confirmación a <strong className="text-white/50">{form.email}</strong>
            </p>
          </div>
        ) : (
          <div className="card-dark rounded-2xl p-8">

            {/* Steps indicator */}
            <div className="flex items-center gap-2 mb-8">
              {['Tu empresa', 'Tu agente', 'Detalles'].map((label, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex items-center gap-2 ${step > i + 1 ? 'cursor-pointer' : ''}`}
                    onClick={() => step > i + 1 && setStep(i + 1)}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === i + 1 ? 'bg-shark-cyan text-shark-dark' :
                      step > i + 1  ? 'bg-emerald-400 text-shark-dark' : 'bg-white/10 text-white/40'
                    }`}>
                      {step > i + 1 ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs hidden sm:block ${step === i + 1 ? 'text-white' : 'text-white/30'}`}>{label}</span>
                  </div>
                  {i < 2 && <div className={`flex-1 h-px transition-all ${step > i + 1 ? 'bg-emerald-400/40' : 'bg-white/10'}`} />}
                </div>
              ))}
            </div>

            {/* ── PASO 1 ── */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-display font-semibold text-white text-base mb-1">Contanos sobre tu empresa</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Nombre completo</label>
                    <input className={inputClass} placeholder="Juan García" value={form.fullName} onChange={e => update('fullName', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Email corporativo</label>
                    <input className={inputClass} type="email" placeholder="juan@empresa.com" value={form.email} onChange={e => update('email', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Empresa</label>
                    <input className={inputClass} placeholder="Nombre de tu empresa" value={form.company} onChange={e => update('company', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Rubro / Industria</label>
                    <select className={selectClass} value={form.industry} onChange={e => update('industry', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      {['Retail / E-commerce','Gastronomía / Food','Salud','Finanzas','Logística','Tecnología','Educación','Inmobiliaria','Manufactura','Servicios profesionales','Otro'].map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>País</label>
                    <input className={inputClass} placeholder="Argentina" value={form.country} onChange={e => update('country', e.target.value)} />
                  </div>
                </div>
                <button className="btn-primary w-full justify-center mt-2" onClick={() => setStep(2)} disabled={!canNext1}>
                  Siguiente →
                </button>
              </div>
            )}

            {/* ── PASO 2 ── */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                <h3 className="font-display font-semibold text-white text-base mb-1">¿Qué agente necesitás?</h3>

                <div>
                  <label className={labelClass}>Elegí el tipo de agente principal</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {AGENTS.map(a => (
                      <button
                        key={a.value}
                        onClick={() => { update('agentType', a.value); update('primaryUse', '') }}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          form.agentType === a.value
                            ? 'bg-shark-cyan/10 border-shark-cyan/50'
                            : 'bg-white/3 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{a.avatar}</span>
                          <span className={`text-xs font-semibold leading-tight ${form.agentType === a.value ? 'text-shark-cyan' : 'text-white/80'}`}>
                            {a.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/40 leading-snug">{a.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {form.agentType && form.agentType !== 'other' && (
                  <div>
                    <label className={labelClass}>¿Para qué lo usarías principalmente?</label>
                    <select className={selectClass} value={form.primaryUse} onChange={e => update('primaryUse', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      {(USES[form.agentType] ?? []).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Interacciones diarias estimadas</label>
                    <select className={selectClass} value={form.dailyVolume} onChange={e => update('dailyVolume', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      <option value="1-10">Menos de 10</option>
                      <option value="10-50">10 a 50</option>
                      <option value="50-200">50 a 200</option>
                      <option value="200+">Más de 200</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>¿Ya usás alguna herramienta para esto?</label>
                    <select className={selectClass} value={form.hasTool} onChange={e => update('hasTool', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      <option value="no">No, lo hacemos manual</option>
                      <option value="si">Sí, tengo una herramienta</option>
                    </select>
                  </div>
                </div>

                {form.hasTool === 'si' && (
                  <div>
                    <label className={labelClass}>¿Cuál herramienta usás?</label>
                    <input className={inputClass} placeholder="Ej: HubSpot, Zendesk, WhatsApp Business..." value={form.toolName} onChange={e => update('toolName', e.target.value)} />
                  </div>
                )}

                <div>
                  <label className={labelClass}>
                    {form.agentType === 'other'
                      ? 'Describí qué necesitás que haga tu agente'
                      : 'Tareas específicas que debería realizar'
                    }
                    {form.agentType !== 'other' && <span className="ml-1 text-white/25 font-normal">(opcional)</span>}
                  </label>
                  <textarea
                    className={inputClass + " resize-none h-24"}
                    placeholder={
                      form.agentType === 'other'
                        ? 'Ej: Quiero un agente para mis clases de matemáticas que me ayude a planificar actividades, generar ejercicios y responder dudas de mis alumnos...'
                        : 'Ej: Que pueda consultar el estado de pedidos, responder preguntas sobre mi menú y tomar reservas...'
                    }
                    value={form.agentDescription}
                    onChange={e => update('agentDescription', e.target.value)}
                    required={form.agentType === 'other'}
                  />
                </div>

                <div className="flex gap-3">
                  <button className="btn-ghost flex-1 justify-center" onClick={() => setStep(1)}>← Atrás</button>
                  <button className="btn-primary flex-1 justify-center" onClick={() => setStep(3)} disabled={!canNext2}>Siguiente →</button>
                </div>
              </div>
            )}

            {/* ── PASO 3 ── */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-display font-semibold text-white text-base mb-1">Últimos detalles</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>¿Cuándo lo necesitás?</label>
                    <select className={selectClass} value={form.urgency} onChange={e => update('urgency', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      <option value="immediate">Lo antes posible</option>
                      <option value="1-3months">En 1 a 3 meses</option>
                      <option value="exploring">Solo explorando</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Presupuesto mensual (USD)</label>
                    <select className={selectClass} value={form.budget} onChange={e => update('budget', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      <option value="under500">Menos de $500</option>
                      <option value="500-1500">$500 – $1.500</option>
                      <option value="1500plus">Más de $1.500</option>
                      <option value="undefined">No definido aún</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>¿Cómo nos encontraste?</label>
                    <select className={selectClass} value={form.howDidYouFindUs} onChange={e => update('howDidYouFindUs', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      <option value="google">Google</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="referido">Me lo recomendaron</option>
                      <option value="redes">Redes sociales</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>

                {/* Resumen */}
                <div className="bg-white/3 border border-white/8 rounded-xl p-4 mt-1">
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Resumen de tu solicitud</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-white/40">Empresa:</span> <span className="text-white/80">{form.company}</span></div>
                    <div><span className="text-white/40">Rubro:</span> <span className="text-white/80">{form.industry}</span></div>
                    <div><span className="text-white/40">Agente:</span> <span className="text-white/80">{AGENTS.find(a => a.value === form.agentType)?.label}</span></div>
                    {form.primaryUse && <div><span className="text-white/40">Uso:</span> <span className="text-white/80">{form.primaryUse}</span></div>}
                    {form.agentDescription && (
                      <div className="col-span-2">
                        <span className="text-white/40">Descripción: </span>
                        <span className="text-white/80">{form.agentDescription.slice(0, 100)}{form.agentDescription.length > 100 ? '...' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="btn-ghost flex-1 justify-center" onClick={() => setStep(2)}>← Atrás</button>
                  <button
                    className="btn-primary flex-1 justify-center"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Activar mi agente →'}
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
