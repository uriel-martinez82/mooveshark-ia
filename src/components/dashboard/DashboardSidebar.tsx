'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const PLAN_LABELS: Record<string, string> = {
  starter:    'Starter',
  business:   'Business',
  enterprise: 'Enterprise',
}

const PLAN_COLORS: Record<string, string> = {
  starter:    'bg-white/10 text-white/50',
  business:   'bg-shark-cyan/15 text-shark-cyan',
  enterprise: 'bg-purple-500/15 text-purple-400',
}

const NAV = [
  { href: '/dashboard',        label: 'Overview',      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/dashboard/chat',   label: 'Chat con agente', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { href: '/dashboard/config', label: 'Configuración', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

export function DashboardSidebar({ company, email, plan }: { company: string; email: string; plan: string }) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white/[0.02] border-r border-white/8 flex flex-col">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-shark-cyan to-blue-500 flex items-center justify-center text-sm">🦈</div>
          <span className="font-display font-bold text-white text-sm">
            Mooveshark <span className="text-shark-cyan">IA</span>
          </span>
        </div>
      </div>

      {/* Company info */}
      <div className="px-6 py-4 border-b border-white/8">
        <p className="text-white font-medium text-sm truncate">{company}</p>
        <p className="text-white/40 text-xs truncate mt-0.5">{email}</p>
        <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide ${PLAN_COLORS[plan] ?? PLAN_COLORS.starter}`}>
          {PLAN_LABELS[plan] ?? plan}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-all ${
                active
                  ? 'bg-shark-cyan/10 text-shark-cyan border border-shark-cyan/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
              </svg>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/8">
        <button
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-2"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
