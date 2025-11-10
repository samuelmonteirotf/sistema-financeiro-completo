import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'

export async function GET(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const expenses = await prisma.expense.findMany({
      where: {
        userId
      },
      include: {
        category: true,
        creditCard: true,
        installmentDetails: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 10 // Últimas 10 despesas
    })

    const formatted = expenses.map(exp => {
      let status: 'paid' | 'pending' | 'partial' = 'paid'

      if (exp.installmentDetails.length > 0) {
        // Despesa parcelada - verificar status das parcelas
        const totalInstallments = exp.installmentDetails.length
        const paidInstallments = exp.installmentDetails.filter(i => i.isPaid).length

        if (paidInstallments === 0) {
          status = 'pending'
        } else if (paidInstallments < totalInstallments) {
          status = 'partial'
        } else {
          status = 'paid'
        }
      } else {
        // Despesa à vista - verificar se já venceu
        const today = new Date()
        if (exp.creditCard) {
          // Se tem cartão, considera pago após o vencimento da fatura
          const dueDate = new Date(exp.date)
          dueDate.setDate(exp.creditCard.dueDay)
          if (dueDate.getMonth() < exp.date.getMonth()) {
            dueDate.setMonth(dueDate.getMonth() + 1)
          }
          status = today > dueDate ? 'paid' : 'pending'
        } else {
          // Sem cartão, considera pago se já passou a data da despesa
          status = today > exp.date ? 'paid' : 'pending'
        }
      }

      return {
        id: exp.id,
        description: exp.description,
        amount: Number.parseFloat(exp.amount.toString()),
        category: exp.category.name,
        date: exp.date,
        status,
        cardName: exp.creditCard?.name
      }
    })

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching recent expenses:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar despesas recentes' },
      { status: 500 }
    )
  }
}
