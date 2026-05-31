'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-shark-cyan/50 transition-colors"

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8">
      <h1 className="font-display font-bold text-white text-xl mb-1">Ingresar</h1>
      <p className="text-white/40 text-sm mb-6">Panel de administración</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 tracking-wide">Email</label>
          <input
            type="email"
            className={inputClass}
            placeholder="admin@mooveshark.ia"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 tracking-wide">Contraseña</label>
          <input
            type="password"
            className={inputClass}
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
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