'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function LoginForm({ isAdmin = false }: { isAdmin?: boolean }) {
  const router = useRouter()
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      role:     isAdmin ? 'admin' : 'client',
      redirect: false,
    })

    if (res?.error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push(isAdmin ? '/admin' : '/dashboard')
      router.refresh()
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-shark-cyan/50 transition-colors"

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8">
      <h1 className="font-display font-bold text-white text-xl mb-1">
        {isAdmin ? 'Panel admin' : 'Mi panel'}
      </h1>
      <p className="text-white/40 text-sm mb-6">
        {isAdmin ? 'Acceso de administración' : 'Accedé a tu agente de IA'}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 tracking-wide">Email</label>
          <input
            type="email"
            className={inputClass}
            placeholder={isAdmin ? 'admin@mooveshark.ia' : 'tu@empresa.com'}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 tracking-wide">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={inputClass}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPassword ? (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/>
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Ingresando...' : 'Ingresar →'}
        </button>
      </form>

      <p className="text-center text-xs text-white/25 mt-6">
        <a href="/" className="hover:text-white/50 transition-colors">← Volver al sitio</a>
      </p>
    </div>
  )
}
