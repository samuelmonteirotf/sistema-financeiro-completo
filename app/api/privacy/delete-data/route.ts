import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdOrUnauthorized } from "@/lib/auth-utils"

export async function DELETE() {
  const maybeUserId = await getUserIdOrUnauthorized()
  if (maybeUserId instanceof NextResponse) {
    return maybeUserId
  }

  const userId = maybeUserId

  try {
    await prisma.$transaction(async (tx) => {
      await tx.usageSnapshot.deleteMany({
        where: { userId },
      })

      await tx.limitHistory.deleteMany({
        where: {
          subscription: {
            userId,
          },
        },
      })

      await tx.subscriptionHistory.deleteMany({
        where: { userId },
      })

      await tx.subscription.deleteMany({
        where: { userId },
      })

      await tx.budget.deleteMany({
        where: { userId },
      })

      await tx.installment.deleteMany({
        where: {
          expense: {
            userId,
          },
        },
      })

      await tx.expense.deleteMany({
        where: { userId },
      })

      await tx.fixedExpense.deleteMany({
        where: { userId },
      })

      await tx.loanPayment.deleteMany({
        where: {
          loan: {
            userId,
          },
        },
      })

      await tx.loan.deleteMany({
        where: { userId },
      })

      await tx.investment.deleteMany({
        where: { userId },
      })

      await tx.income.deleteMany({
        where: { userId },
      })

      await tx.creditCard.deleteMany({
        where: { userId },
      })

      await tx.category.deleteMany({
        where: { ownerId: userId },
      })

      await tx.user.delete({
        where: { id: userId },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir dados do usuário:", error)
    return NextResponse.json(
      { error: "Erro ao remover dados. Tente novamente mais tarde." },
      { status: 500 }
    )
  }
}
