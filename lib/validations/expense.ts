import { z } from 'zod'
import Decimal from 'decimal.js'

export const expenseSchema = z.object({
  description: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(200, 'Descrição muito longa'),

  amount: z.union([z.string(), z.number()])
    .refine(val => {
      if (typeof val === 'number') {
        return val > 0
      }

      return val.trim().length > 0
    }, 'Valor é obrigatório')
    .transform(val => {
      if (typeof val === 'number') {
        return new Decimal(val)
      }

      // Remove caracteres não numéricos exceto ponto e vírgula
      const cleaned = val.replace(/[^\d.,]/g, '').replace(',', '.')
      return new Decimal(cleaned || 0)
    })
    .refine(
      val => val.gt(0),
      'Valor deve ser maior que zero'
    ),

  date: z.coerce.date({
    required_error: 'Data é obrigatória',
    invalid_type_error: 'Data inválida'
  }),

  creditCardId: z.string()
    .cuid('ID do cartão inválido')
    .optional(),

  categoryId: z.string()
    .cuid('ID da categoria inválida'),

  installments: z.coerce.number()
    .int('Número de parcelas deve ser inteiro')
    .min(1, 'Mínimo 1 parcela')
    .max(72, 'Máximo 72 parcelas')
    .default(1),

  observations: z.string()
    .max(500, 'Observação muito longa')
    .optional()
})

export type ExpensePayload = z.infer<typeof expenseSchema>
export type ExpenseFormData = z.input<typeof expenseSchema>
