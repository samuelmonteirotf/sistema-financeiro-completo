import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import * as bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

/**
 * Configuração do NextAuth.js
 *
 * Usa JWT (stateless) para máxima performance:
 * - Não precisa consultar banco para cada requisição
 * - Sem necessidade de Redis ou cache
 * - Token JWT carrega o userId
 */
export const authOptions: NextAuthOptions = {
  // Usar JWT (stateless) em vez de database sessions
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  // Secret para assinar JWTs (do .env)
  secret: process.env.NEXTAUTH_SECRET,

  // Provider de autenticação
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios")
        }

        // Buscar usuário no banco
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error("Credenciais inválidas")
        }

        // Verificar senha
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!passwordMatch) {
          throw new Error("Credenciais inválidas")
        }

        // Retornar dados do usuário (serão colocados no JWT)
        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email, // Fallback se name for null
        }
      }
    })
  ],

  // Callbacks para adicionar dados ao JWT e à sessão
  callbacks: {
    async jwt({ token, user }) {
      // Quando o usuário faz login, adicionar o id ao token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        console.log('✅ JWT criado para:', user.email)
      }
      return token
    },
    async session({ session, token }) {
      // Adicionar dados do token à sessão
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Garante que após login vai para o dashboard
      console.log('🔀 Redirect:', { url, baseUrl })

      // Se está tentando ir para login mas já está autenticado, vai para dashboard
      if (url.includes('/login') || url === baseUrl) {
        return `${baseUrl}/dashboard`
      }

      // Se a URL começa com baseUrl, usa ela
      if (url.startsWith(baseUrl)) {
        return url
      }

      // Caso contrário, retorna baseUrl/dashboard
      return `${baseUrl}/dashboard`
    }
  },

  // Páginas customizadas
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Debug apenas em desenvolvimento
  debug: process.env.NODE_ENV === "development",
}
