import { z } from 'zod'
import Decimal from 'decimal.js'

export const cardSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Nome muito longo'),

  lastFourDigits: z.string()
    .length(4, 'Deve ter 4 dígitos')
    .regex(/^\d{4}$/, 'Deve conter apenas números'),

  brand: z.enum(['Visa', 'Mastercard', 'Elo', 'Amex', 'Outros'], {
    errorMap: () => ({ message: 'Bandeira inválida' })
  }),

  closingDay: z.number()
    .int('Dia deve ser inteiro')
    .min(1, 'Dia mínimo: 1')
    .max(31, 'Dia máximo: 31'),

  dueDay: z.number()
    .int('Dia deve ser inteiro')
    .min(1, 'Dia mínimo: 1')
    .max(31, 'Dia máximo: 31'),

  limit: z.string()
    .transform(val => {
      const cleaned = val.replace(/[^\d.,]/g, '').replace(',', '.')
      return new Decimal(cleaned)
    })
    .refine(
      val => val.gt(0),
      'Limite deve ser maior que zero'
    )
})

export type CardFormData = z.infer<typeof cardSchema>
