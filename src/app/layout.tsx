import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title:       'Mooveshark IA — Agentes de IA para empresas',
  description: 'Soluciones de inteligencia artificial listas para activar. Agentes especializados para atención al cliente, ventas, RRHH y más.',
  keywords:    ['agentes IA', 'inteligencia artificial', 'B2B', 'automatización', 'chatbot empresarial'],
  openGraph: {
    title:       'Mooveshark IA',
    description: 'Agentes de IA que trabajan por tu empresa',
    type:        'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${plusJakarta.variable} ${inter.variable}`}>
      <body className="font-body bg-shark-dark text-white antialiased">
        {children}
      </body>
    </html>
  )
}
