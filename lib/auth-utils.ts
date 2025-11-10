import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

/**
 * Obtém o userId da sessão atual de forma segura
 *
 * Performance: JWT é stateless, não consulta banco
 * Apenas valida a assinatura criptográfica do token
 *
 * @returns userId do usuário autenticado
 * @throws Error se não houver sessão válida
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Não autenticado")
  }

  return session.user.id
}

/**
 * Obtém o userId ou retorna resposta 401 Unauthorized
 *
 * Helper para usar em route handlers
 *
 * @example
 * ```typescript
 * const userId = await getUserIdOrUnauthorized()
 * if (userId instanceof NextResponse) return userId
 * // userId é string aqui
 * ```
 */
export async function getUserIdOrUnauthorized(): Promise<string | NextResponse> {
  try {
    const userId = await getCurrentUserId()
    return userId
  } catch (error) {
    return NextResponse.json(
      { error: "Não autenticado. Faça login." },
      { status: 401 }
    )
  }
}

/**
 * Obtém a sessão completa do usuário
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions)
}
