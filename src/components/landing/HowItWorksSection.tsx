export function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Completás el formulario',
      description: 'Contanos sobre tu empresa, qué problema querés resolver y qué agente te interesa. Tarda menos de 3 minutos.',
      icon: '📋',
    },
    {
      num: '02',
      title: 'Diagnosticamos tu necesidad',
      description: 'Analizamos tu caso y seleccionamos el agente ideal — o diseñamos uno a medida si tu proceso lo requiere.',
      icon: '🔍',
    },
    {
      num: '03',
      title: 'Configuramos tu agente',
      description: 'Adaptamos el agente con el contexto de tu empresa: tono, datos, integraciones con tus sistemas actuales.',
      icon: '⚙️',
    },
    {
      num: '04',
      title: 'Deploy en 48 horas',
      description: 'Tu agente queda activo y operativo. Lo monitoreamos, medimos resultados y lo mejoramos de forma continua.',
      icon: '🚀',
    },
  ]

  return (
    <section id="como-funciona" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <p className="section-label">Cómo funciona</p>
          <h2 className="section-title mb-4">
            Del formulario al agente
            <br />
            <span className="gradient-text">en menos de 48 horas</span>
          </h2>
          <p className="section-subtitle mx-auto text-center">
            Un proceso simple y guiado. Sin reuniones eternas ni documentos de requerimientos de 40 páginas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%_-_12px)] w-6 h-px bg-gradient-to-r from-white/20 to-transparent z-10" />
              )}

              <div className="card-dark p-6 h-full">
                {/* Number */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-display font-bold text-xs text-shark-cyan/40 tracking-widest">{step.num}</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                {/* Icon */}
                <div className="text-2xl mb-4">{step.icon}</div>

                {/* Content */}
                <h3 className="font-display font-semibold text-white text-base mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a href="#contacto" className="btn-primary">
            Empezar ahora →
          </a>
        </div>
      </div>
    </section>
  )
}
