import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-shark-cyan/5 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-600/5 blur-[100px]" />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,212,255,0.8) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,212,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-shark-cyan/20 bg-shark-cyan/5 text-shark-cyan text-xs font-medium mb-10 animate-fade-in tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-shark-cyan animate-pulse" />
          Plataforma de agentes IA para empresas B2B
        </div>

        {/* Headline — más contenido, menos desborde */}
        <h1 className="font-display font-bold text-[clamp(2.4rem,5vw,3.75rem)] leading-[1.1] tracking-tight mb-6 animate-fade-up">
          Agentes de IA que
          <br />
          <span className="gradient-text">trabajan por tu empresa</span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/55 text-lg leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          Activá agentes especializados en minutos — atención al cliente,
          ventas, RRHH y más. Sin código, sin meses de implementación.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <a href="#contacto" className="btn-primary text-sm px-7 py-3.5">
            Activar mi agente →
          </a>
          <a href="#agentes" className="btn-ghost text-sm px-7 py-3.5">
            Ver agentes disponibles
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-10 justify-center items-center text-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
          {[
            { value: '48h',  label: 'Tiempo de activación' },
            { value: '7+',   label: 'Agentes disponibles' },
            { value: '24/7', label: 'Disponibilidad' },
            { value: '3.4x', label: 'ROI promedio' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="font-display font-bold text-2xl text-shark-cyan tracking-tight">{stat.value}</span>
              <span className="text-xs text-white/40 font-medium tracking-wide">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
