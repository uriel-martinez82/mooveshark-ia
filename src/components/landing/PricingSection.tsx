export function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '299',
      period: 'mes / agente',
      description: 'Para empresas que quieren empezar con IA sin riesgos.',
      features: [
        '1 agente pre-armado',
        'Hasta 1.000 interacciones/mes',
        'Dashboard básico',
        'Soporte por email',
        'Onboarding guiado',
      ],
      cta: 'Empezar con Starter',
      featured: false,
    },
    {
      name: 'Business',
      price: '799',
      period: 'mes / hasta 3 agentes',
      description: 'Para equipos que quieren escalar con múltiples agentes.',
      features: [
        'Hasta 3 agentes activos',
        'Interacciones ilimitadas',
        'Integraciones CRM y WhatsApp',
        'Dashboard con métricas avanzadas',
        'Soporte prioritario',
        'Reunión mensual de revisión',
      ],
      cta: 'Empezar con Business',
      featured: true,
    },
    {
      name: 'Enterprise',
      price: null,
      period: 'fee de setup + mensual',
      description: 'Para organizaciones con necesidades específicas y complejas.',
      features: [
        'Agentes custom desde cero',
        'Integraciones enterprise a medida',
        'SLA garantizado 99.9%',
        'Account manager dedicado',
        'Capacitación del equipo',
        'Contrato personalizado',
      ],
      cta: 'Hablar con ventas',
      featured: false,
    },
  ]

  return (
    <section id="precios" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <p className="section-label">Precios</p>
          <h2 className="section-title mb-4">
            Transparente y sin sorpresas
          </h2>
          <p className="section-subtitle mx-auto text-center">
            Elegí el plan que se adapta a tu empresa. Todos incluyen onboarding guiado y soporte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col gap-6 relative ${
                plan.featured
                  ? 'bg-shark-cyan/5 border-2 border-shark-cyan/40'
                  : 'bg-white/[0.03] border border-white/10'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-shark-cyan text-shark-dark text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                    Más popular
                  </span>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-2">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  {plan.price
                    ? <>
                        <span className="text-white/40 text-lg font-medium">$</span>
                        <span className="font-display font-bold text-4xl text-white tracking-tight">{plan.price}</span>
                      </>
                    : <span className="font-display font-bold text-3xl text-white tracking-tight">A medida</span>
                  }
                </div>
                <p className="text-xs text-white/40">{plan.period}</p>
              </div>

              <p className="text-sm text-white/50 leading-relaxed">{plan.description}</p>

              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                    <svg className="w-4 h-4 text-shark-cyan mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#contacto"
                className={`text-center py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  plan.featured
                    ? 'bg-shark-cyan text-shark-dark hover:bg-opacity-90'
                    : 'border border-white/20 text-white/70 hover:border-white/40 hover:text-white'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-white/30 mt-8">
          Todos los precios en USD. Facturación mensual. Cancelación en cualquier momento.
        </p>
      </div>
    </section>
  )
}
