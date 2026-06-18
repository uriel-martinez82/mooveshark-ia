'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ChangePasswordForm() {
  const router = useRouter()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [showPass, setShowPass]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 8)  { setError('Mínimo 8 caracteres'); return }

    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/clients/change-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(data.error ?? 'Error al cambiar contraseña')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-shark-cyan/50 transition-colors"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5 tracking-wide">Nueva contraseña</label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            className={inputClass}
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5 tracking-wide">Confirmá la contraseña</label>
        <input
          type="password"
          className={inputClass}
          placeholder="Repetí la contraseña"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || !password || !confirm}
        className="btn-primary w-full justify-center mt-2 disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar contraseña →'}
      </button>
    </form>
  )
}