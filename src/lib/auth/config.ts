import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? 'admin@mooveshark.ia'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'changeme123'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z.object({
          email:    z.string().email(),
          password: z.string().min(6),
        }).safeParse(credentials)

        if (!parsed.success) return null

        const { email, password } = parsed.data

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          return { id: '1', email, name: 'Admin', role: 'admin' }
        }

        return null
      },
    }),
  ],
  pages: { signIn: '/auth/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
})