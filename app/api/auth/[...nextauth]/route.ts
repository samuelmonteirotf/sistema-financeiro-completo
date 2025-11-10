import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * Rota dinâmica do NextAuth
 *
 * Captura todas as rotas de autenticação:
 * - POST /api/auth/signin - Login
 * - POST /api/auth/signout - Logout
 * - GET  /api/auth/session - Obter sessão atual
 * - GET  /api/auth/csrf - Token CSRF
 */
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
