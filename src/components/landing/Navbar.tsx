'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-shark-dark/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
    }`}>
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-shark-cyan to-blue-500 flex items-center justify-center text-sm font-bold text-shark-dark">
            🦈
          </div>
          <span className="font-display font-bold text-white">
            Mooveshark <span className="text-shark-cyan">IA</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Agentes',    href: '#agentes' },
            { label: 'Cómo funciona', href: '#como-funciona' },
            { label: 'Precios',    href: '#precios' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-white/60 hover:text-white transition-colors">
            Ingresar
          </Link>
          <a href="#contacto" className="btn-primary text-sm py-2 px-5">
            Activar agente
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white/60 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            }
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-shark-dark/95 backdrop-blur-md border-t border-white/5 px-6 py-4 flex flex-col gap-4">
          {[
            { label: 'Agentes',       href: '#agentes' },
            { label: 'Cómo funciona', href: '#como-funciona' },
            { label: 'Precios',       href: '#precios' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/70 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a href="#contacto" className="btn-primary text-sm text-center" onClick={() => setMenuOpen(false)}>
            Activar agente
          </a>
        </div>
      )}
    </header>
  )
}
