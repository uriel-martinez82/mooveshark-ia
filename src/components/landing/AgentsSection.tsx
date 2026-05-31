import { AGENT_DEFINITIONS } from '@/lib/agents/definitions'

const ICONS: Record<string, string> = {
  headset:     '🎧',
  target:      '🎯',
  speakerphone:'📣',
  'chart-bar': '📊',
  users:       '👥',
  'user-search':'🔍',
  'receipt-2': '💰',
}

export function AgentsSection() {
  return (
    <section id="agentes" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-label">Agentes disponibles</p>
          <h2 className="section-title mb-4">
            Listos para activar.
            <br />
            <span className="gradient-text">O a medida de tu negocio.</span>
          </h2>
          <p className="section-subtitle mx-auto text-center">
            Elegí el agente que necesitás, configuralo con los datos de tu empresa
            y estará operativo en menos de 48 horas.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {AGENT_DEFINITIONS.map(agent => (
            <div
              key={agent.type}
              className="card-dark p-6 group cursor-pointer"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-shark-cyan/10 border border-shark-cyan/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {ICONS[agent.icon] || '🤖'}
              </div>

              {/* Badge */}
              <div className="mb-3">
                {agent.badge === 'ready'
                  ? <span className="badge-ready">Listo</span>
                  : <span className="badge-hot">Alta demanda</span>
                }
              </div>

              {/* Content */}
              <h3 className="font-display font-semibold text-white text-base mb-2">
                {agent.label}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {agent.description}
              </p>
            </div>
          ))}

          {/* Custom agent card */}
          <div className="card-glow p-6 border-dashed group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-shark-cyan/10 border border-dashed border-shark-cyan/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
              ✨
            </div>
            <div className="mb-3">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
                A medida
              </span>
            </div>
            <h3 className="font-display font-semibold text-white text-base mb-2">
              Agente personalizado
            </h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Diseñamos y construimos el agente exacto que tu negocio necesita.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a href="#contacto" className="btn-outline">
            Consultar por mi agente →
          </a>
        </div>
      </div>
    </section>
  )
}
