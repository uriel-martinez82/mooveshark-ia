import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const ADMIN_EMAIL    = process.env.ADMIN_LOGIN_EMAIL    ?? 'admin@mooveshark.ia'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'changeme123'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
        role:     { label: 'Role',     type: 'text' },
      },
      async authorize(credentials) {
        console.log('[auth] ADMIN_EMAIL:', process.env.ADMIN_EMAIL)
        console.log('[auth] ADMIN_PASSWORD length:', process.env.ADMIN_PASSWORD?.length)
        console.log('[auth] credentials role:', credentials?.role)
        console.log('[auth] credentials email:', credentials?.email)

        const parsed = z.object({
          email:    z.string().email(),
          password: z.string().min(6),
          role:     z.enum(['admin', 'client']).optional().default('client'),
        }).safeParse(credentials)

        if (!parsed.success) return null

        const { email, password, role } = parsed.data

        // Admin login — no DB needed
        if (email === ADMIN_EMAIL) {
          if (password === ADMIN_PASSWORD) {
            return { id: 'admin', email, name: 'Admin', role: 'admin' }
          }
          return null
        }

        // Client login — dynamic import to avoid Edge Runtime issues
        const { db }      = await import('@/lib/db')
        const { clients } = await import('@/lib/db/schema')
        const { eq }      = await import('drizzle-orm')
        const bcrypt      = await import('bcryptjs')

        const [client] = await db.select().from(clients).where(eq(clients.email, email))
        if (!client || !client.passwordHash) return null

        const valid = await bcrypt.compare(password, client.passwordHash)
        if (!valid) return null
        if (client.status === 'cancelled') return null

        return {
          id:      client.id,
          email:   client.email,
          name:    client.company,
          role:    'client',
          company: client.company,
          plan:    client.plan ?? 'starter',
        }
      },
    }),
  ],
  pages: { signIn: '/auth/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as Record<string, unknown>
        token.role    = u.role
        token.company = u.company
        token.plan    = u.plan
        token.userId  = u.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as unknown as Record<string, unknown>
        u.role    = token.role
        u.company = token.company
        u.plan    = token.plan
        u.id      = token.userId
      }
      return session
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
})