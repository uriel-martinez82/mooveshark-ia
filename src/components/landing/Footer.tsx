export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-shark-cyan to-blue-500 flex items-center justify-center text-sm">
                🦈
              </div>
              <span className="font-display font-bold text-white">
                Mooveshark <span className="text-shark-cyan">IA</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Agentes de inteligencia artificial para empresas B2B. Activación rápida, resultados reales.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-4">Producto</p>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'Agentes', href: '#agentes' },
                { label: 'Cómo funciona', href: '#como-funciona' },
                { label: 'Precios', href: '#precios' },
                { label: 'FAQ', href: '#faq' },
              ].map(l => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-4">Empresa</p>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'Contacto', href: '#contacto' },
                { label: 'Ingresar', href: '/auth/login' },
                { label: 'Privacidad', href: '/privacidad' },
                { label: 'Términos', href: '/terminos' },
              ].map(l => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/25">
            © 2026 Mooveshark IA. Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/25">
            Construido con IA para empresas que quieren crecer más rápido 🦈
          </p>
        </div>
      </div>
    </footer>
  )
}
