import { prisma } from "@/lib/prisma"

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Alimentação", color: "#F97316", icon: "utensils" },
  { name: "Transporte", color: "#06B6D4", icon: "car" },
  { name: "Moradia", color: "#8B5CF6", icon: "home" },
  { name: "Saúde", color: "#10B981", icon: "heart-pulse" },
  { name: "Lazer", color: "#EC4899", icon: "party-popper" },
  { name: "Educação", color: "#3B82F6", icon: "book-open" },
  { name: "Compras", color: "#FACC15", icon: "shopping-bag" },
  { name: "Outros", color: "#9CA3AF", icon: "circle" },
]

export async function ensureDefaultCategories(userId: string) {
  const existing = await prisma.category.count({
    where: { ownerId: userId },
  })

  if (existing > 0) {
    return
  }

  try {
    await prisma.category.createMany({
      data: DEFAULT_EXPENSE_CATEGORIES.map((category) => ({
        ...category,
        type: "expense",
        ownerId: userId,
      })),
      skipDuplicates: true,
    })
  } catch (error) {
    console.error("Erro ao criar categorias padrão", error)
  }
}
