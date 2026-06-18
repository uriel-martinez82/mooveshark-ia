'use client'

import { useState } from 'react'

export function ResetPasswordButton({ clientId, email }: { clientId: string; email: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')

  const handleReset = async () => {
    if (!confirm(`¿Enviar credenciales temporales a ${email}?`)) return
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`/api/clients/${clientId}/reset-password`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setDone(true)
        setTimeout(() => setDone(false), 3000)
      } else {
        setError(data.error ?? 'Error')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <span className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
      ✓ Enviado
    </span>
  )

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleReset}
        disabled={loading}
        className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-shark-cyan/10 text-shark-cyan border border-shark-cyan/20 hover:bg-shark-cyan/20 transition-all whitespace-nowrap disabled:opacity-50"
      >
        {loading ? 'Enviando...' : '→ Enviar acceso'}
      </button>
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
  )
}