import { ChangePasswordForm } from '@/components/dashboard/ChangePasswordForm'

export default function ChangePasswordPage() {
  return (
    <div className="min-h-screen bg-shark-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-shark-cyan to-blue-500 flex items-center justify-center text-sm">🦈</div>
          <span className="font-display font-bold text-white text-lg">
            Mooveshark <span className="text-shark-cyan">IA</span>
          </span>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <span>⚠️</span>
            <p className="text-amber-400 text-sm">Debés cambiar tu contraseña antes de continuar.</p>
          </div>
          <h1 className="font-display font-bold text-white text-xl mb-1">Cambiá tu contraseña</h1>
          <p className="text-white/40 text-sm mb-6">Elegí una contraseña segura para tu cuenta.</p>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}