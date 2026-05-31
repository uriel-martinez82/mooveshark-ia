import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { db } from '@/lib/db'
import { clients } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? 'admin@mooveshark.ia'
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
        const parsed = z.object({
          email:    z.string().email(),
          password: z.string().min(6),
          role:     z.enum(['admin', 'client']).optional().default('client'),
        }).safeParse(credentials)

        if (!parsed.success) return null

        const { email, password, role } = parsed.data

        // Admin login
        if (role === 'admin') {
          if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            return { id: 'admin', email, name: 'Admin', role: 'admin' }
          }
          return null
        }

        // Client login
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
          plan:    client.plan,
        }
      },
    }),
  ],
  pages: { signIn: '/auth/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role    = (user as Record<string, unknown>).role
        token.company = (user as Record<string, unknown>).company
        token.plan    = (user as Record<string, unknown>).plan
        token.userId  = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as Record<string, unknown>
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
