'use client'

import { signOut } from 'next-auth/react'

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/auth/login' })}
      className="text-sm text-white/40 hover:text-white transition-colors px-3 py-2"
    >
      Salir
    </button>
  )
}