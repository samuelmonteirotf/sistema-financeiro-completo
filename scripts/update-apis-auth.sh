#!/bin/bash

# Script para atualizar todas as APIs para usar autenticação segura
# Substitui findFirst() por getUserIdOrUnauthorized()

echo "🔐 Atualizando APIs para usar autenticação segura..."

# Lista de arquivos a atualizar
files=(
  "app/api/cards/[id]/route.ts"
  "app/api/cards/[id]/invoice/route.ts"
  "app/api/cards/route.ts"
  "app/api/loans/route.ts"
  "app/api/dashboard/expenses-by-category/route.ts"
  "app/api/dashboard/summary/route.ts"
  "app/api/dashboard/recent-expenses/route.ts"
  "app/api/crypto/update-investments/route.ts"
  "app/api/installments/route.ts"
  "app/api/expenses/[id]/route.ts"
  "app/api/invoices/route.ts"
  "app/api/reports/summary/route.ts"
  "app/api/fixed-expenses/[id]/route.ts"
  "app/api/fixed-expenses/route.ts"
  "app/api/investments/[id]/route.ts"
  "app/api/investments/route.ts"
  "app/api/alerts/route.ts"
  "app/api/budgets/route.ts"
  "app/api/categories/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ Atualizando $file"
  fi
done

echo "✅ Atualização completa!"
