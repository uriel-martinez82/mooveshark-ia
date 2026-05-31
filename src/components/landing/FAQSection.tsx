'use client'

import { useState } from 'react'

const faqs = [
  {
    q: '¿Cuánto tiempo lleva activar un agente?',
    a: 'Los agentes pre-armados se configuran y despliegan en menos de 48 horas. Para agentes a medida, el tiempo varía entre 1 y 2 semanas dependiendo de la complejidad e integraciones requeridas.',
  },
  {
    q: '¿Necesito conocimientos técnicos para usar la plataforma?',
    a: 'No. El proceso está diseñado para que cualquier persona del equipo pueda gestionar y monitorear los agentes desde el panel. La parte técnica la manejamos nosotros.',
  },
  {
    q: '¿Los agentes pueden integrarse con mis sistemas actuales?',
    a: 'Sí. Los planes Business y Enterprise incluyen integraciones con CRMs (HubSpot, Salesforce, Zoho), WhatsApp Business, email y sistemas propios vía API. En el plan Starter las integraciones son más básicas.',
  },
  {
    q: '¿En qué idiomas funcionan los agentes?',
    a: 'Principalmente en español e inglés, pero pueden configurarse para operar en cualquier idioma. El tono y vocabulario también se adapta a cada empresa.',
  },
  {
    q: '¿Qué pasa si el agente no sabe responder algo?',
    a: 'Los agentes están programados para escalar al equipo humano cuando no tienen respuesta o cuando la situación lo requiere. Nunca inventan información — si no saben algo, lo dicen claramente.',
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí, sin cargos por cancelación. La facturación es mensual y podés dar de baja tu suscripción cuando quieras desde el panel.',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Sí. Toda la información se procesa con encriptación en tránsito y en reposo. No compartimos ni vendemos datos de clientes. Cumplimos con las regulaciones de privacidad vigentes.',
  },
]

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-14">
          <p className="section-label">Preguntas frecuentes</p>
          <h2 className="section-title">
            Todo lo que necesitás saber
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                open === i ? 'border-white/15 bg-white/[0.04]' : 'border-white/8 bg-white/[0.02]'
              }`}
            >
              <button
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-medium text-white/90 text-sm leading-snug">{faq.q}</span>
                <svg
                  className={`w-4 h-4 text-white/40 shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-white/55 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-white/40 mt-10">
          ¿Tenés otra pregunta?{' '}
          <a href="#contacto" className="text-shark-cyan hover:underline">
            Escribinos →
          </a>
        </p>
      </div>
    </section>
  )
}
