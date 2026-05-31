import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-shark-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-shark-cyan to-blue-500 flex items-center justify-center text-sm">🦈</div>
          <span className="font-display font-bold text-white text-lg">
            Mooveshark <span className="text-shark-cyan">IA</span>
          </span>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}