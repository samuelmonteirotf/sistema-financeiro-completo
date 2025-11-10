import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

/**
 * Middleware de Autenticação
 *
 * Protege todas as rotas que requerem autenticação
 * Performance: Valida JWT localmente, sem consultar banco
 *
 * Rotas protegidas:
 * - /dashboard/*
 * - /api/* (exceto /api/auth/*)
 *
 * Se o usuário não estiver autenticado:
 * - Páginas: Redireciona para /login
 * - APIs: Retorna 401 Unauthorized
 */
export default withAuth(
  function middleware(req) {
    // Você pode adicionar lógica extra aqui se necessário
    return NextResponse.next()
  },
  {
    callbacks: {
      // Autorizado se tiver token JWT válido
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
)

/**
 * Configurar quais rotas o middleware protege
 */
export const config = {
  matcher: [
    // Proteger todas as rotas do dashboard
    "/dashboard/:path*",
    "/despesas/:path*",
    "/despesas-fixas/:path*",
    "/cartoes/:path*",
    "/faturas/:path*",
    "/emprestimos/:path*",
    "/investimentos/:path*",
    "/relatorios/:path*",
    "/notificacoes/:path*",

    // Proteger todas as APIs (exceto auth)
    "/api/expenses/:path*",
    "/api/fixed-expenses/:path*",
    "/api/cards/:path*",
    "/api/invoices/:path*",
    "/api/loans/:path*",
    "/api/categories/:path*",
    "/api/budgets/:path*",
    "/api/installments/:path*",
    "/api/alerts/:path*",
    "/api/reports/:path*",
    "/api/dashboard/:path*",
    "/api/investments/:path*",
    "/api/crypto/:path*",
  ],
}
