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

/**
 * Obtém o usuário atual com sua subscription
 *
 * Útil para verificar limites e permissões baseadas no plano
 *
 * @returns User com subscription ou null se não autenticado
 *
 * @example
 * ```typescript
 * const user = await getCurrentUserWithSubscription()
 * if (!user) {
 *   return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
 * }
 *
 * const canExport = hasFeatureAccess(user.subscription, 'canExportReports')
 * if (!canExport) {
 *   return NextResponse.json({ error: 'Upgrade para PRO necessário' }, { status: 403 })
 * }
 * ```
 */
export async function getCurrentUserWithSubscription() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const { prisma } = await import('@/lib/prisma')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
    },
  })

  return user
}

/**
 * Obtém o usuário atual com subscription ou retorna 401
 *
 * Helper para usar em route handlers
 *
 * @returns User com subscription ou NextResponse 401
 *
 * @example
 * ```typescript
 * const user = await getCurrentUserWithSubscriptionOrUnauthorized()
 * if (user instanceof NextResponse) return user
 * // user é User & { subscription: Subscription | null } aqui
 * ```
 */
export async function getCurrentUserWithSubscriptionOrUnauthorized() {
  try {
    const user = await getCurrentUserWithSubscription()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado. Faça login." },
        { status: 401 }
      )
    }

    return user
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar usuário" },
      { status: 500 }
    )
  }
}
