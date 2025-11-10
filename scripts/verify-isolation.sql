-- ================================================================
-- SCRIPT DE VERIFICAÇÃO DE ISOLAMENTO DE DADOS
-- Sistema: Controle Financeiro
-- Data: 2025-11-04
-- ================================================================
--
-- COMO USAR:
-- psql -d controle_financeiro -f scripts/verify-isolation.sql
--
-- ================================================================

\echo '========================================'
\echo 'VERIFICAÇÃO DE ISOLAMENTO DE DADOS'
\echo '========================================'
\echo ''

-- ================================================================
-- 1. USUÁRIOS CADASTRADOS
-- ================================================================
\echo '1. USUÁRIOS NO SISTEMA:'
\echo '----------------------------------------'

SELECT
  id,
  email,
  name,
  "createdAt"
FROM "User"
ORDER BY "createdAt";

\echo ''
\echo '----------------------------------------'
\echo ''

-- ================================================================
-- 2. DESPESAS POR USUÁRIO
-- ================================================================
\echo '2. DESPESAS POR USUÁRIO:'
\echo '----------------------------------------'

SELECT
  u.email as "Usuário",
  COUNT(e.id) as "Total Despesas",
  COALESCE(SUM(e.amount), 0) as "Total Gasto (R$)"
FROM "User" u
LEFT JOIN "Expense" e ON e."userId" = u.id
GROUP BY u.id, u.email
ORDER BY u.email;

\echo ''
\echo '----------------------------------------'
\echo ''

-- ================================================================
-- 3. CARTÕES POR USUÁRIO
-- ================================================================
\echo '3. CARTÕES POR USUÁRIO:'
\echo '----------------------------------------'

SELECT
  u.email as "Usuário",
  COUNT(c.id) as "Total Cartões",
  COALESCE(SUM(c.limit), 0) as "Limite Total (R$)"
FROM "User" u
LEFT JOIN "CreditCard" c ON c."userId" = u.id
GROUP BY u.id, u.email
ORDER BY u.email;

\echo ''
\echo '----------------------------------------'
\echo ''

-- ================================================================
-- 4. DESPESAS FIXAS POR USUÁRIO
-- ================================================================
\echo '4. DESPESAS FIXAS POR USUÁRIO:'
\echo '----------------------------------------'

SELECT
  u.email as "Usuário",
  COUNT(f.id) as "Total Fixas",
  COALESCE(SUM(f.amount), 0) as "Total Mensal (R$)"
FROM "User" u
LEFT JOIN "FixedExpense" f ON f."userId" = u.id
GROUP BY u.id, u.email
ORDER BY u.email;

\echo ''
\echo '----------------------------------------'
\echo ''

-- ================================================================
-- 5. VERIFICAR DADOS ÓRFÃOS (CRÍTICO!)
-- ================================================================
\echo '5. VERIFICAÇÃO DE DADOS ÓRFÃOS (DEVE SER 0!):'
\echo '----------------------------------------'

SELECT
  (SELECT COUNT(*) FROM "Expense" WHERE "userId" IS NULL) as "Despesas sem Usuário",
  (SELECT COUNT(*) FROM "CreditCard" WHERE "userId" IS NULL) as "Cartões sem Usuário",
  (SELECT COUNT(*) FROM "FixedExpense" WHERE "userId" IS NULL) as "Fixas sem Usuário",
  (SELECT COUNT(*) FROM "Budget" WHERE "userId" IS NULL) as "Orçamentos sem Usuário",
  (SELECT COUNT(*) FROM "Loan" WHERE "userId" IS NULL) as "Empréstimos sem Usuário",
  (SELECT COUNT(*) FROM "Investment" WHERE "userId" IS NULL) as "Investimentos sem Usuário";

\echo ''
\echo '⚠️  SE ALGUM NÚMERO ACIMA FOR > 0, VOCÊ TEM UM BUG CRÍTICO!'
\echo ''
\echo '----------------------------------------'
\echo ''

-- ================================================================
-- 6. DETALHES DAS DESPESAS COM USUÁRIO
-- ================================================================
\echo '6. DETALHAMENTO DE DESPESAS:'
\echo '----------------------------------------'

SELECT
  u.email as "Usuário",
  e.description as "Descrição",
  e.amount as "Valor (R$)",
  e.date as "Data",
  CASE
    WHEN e.installments > 1 THEN CONCAT(e.installments, 'x')
    ELSE 'À vista'
  END as "Parcelamento",
  c.name as "Cartão"
FROM "Expense" e
JOIN "User" u ON u.id = e."userId"
LEFT JOIN "CreditCard" c ON c.id = e."creditCardId"
ORDER BY u.email, e.date DESC
LIMIT 20;

\echo ''
\echo '----------------------------------------'
\echo ''

-- ================================================================
-- 7. VERIFICAR PRECISÃO DECIMAL (Parcelamentos)
-- ================================================================
\echo '7. VERIFICAÇÃO DE PRECISÃO DECIMAL:'
\echo '----------------------------------------'

WITH installment_totals AS (
  SELECT
    e."userId",
    e.id as expense_id,
    e.description,
    e.amount as valor_original,
    e.installments as parcelas,
    SUM(i.amount) as soma_parcelas
  FROM "Expense" e
  LEFT JOIN "Installment" i ON i."expenseId" = e.id
  WHERE e.installments > 1
  GROUP BY e.id, e."userId", e.description, e.amount, e.installments
)
SELECT
  u.email as "Usuário",
  t.description as "Despesa",
  t.parcelas as "Nº Parcelas",
  t.valor_original as "Valor Original (R$)",
  COALESCE(t.soma_parcelas, 0) as "Soma das Parcelas (R$)",
  CASE
    WHEN t.valor_original = COALESCE(t.soma_parcelas, 0) THEN '✅ CORRETO'
    ELSE '❌ ERRO DE PRECISÃO!'
  END as "Status"
FROM installment_totals t
JOIN "User" u ON u.id = t."userId"
ORDER BY u.email;

\echo ''
\echo '⚠️  Todos os status devem ser "✅ CORRETO"'
\echo ''
\echo '----------------------------------------'
\echo ''

-- ================================================================
-- 8. ESTATÍSTICAS GERAIS
-- ================================================================
\echo '8. ESTATÍSTICAS GERAIS DO SISTEMA:'
\echo '----------------------------------------'

SELECT
  (SELECT COUNT(*) FROM "User") as "Total de Usuários",
  (SELECT COUNT(*) FROM "Expense") as "Total de Despesas",
  (SELECT COUNT(*) FROM "CreditCard") as "Total de Cartões",
  (SELECT COUNT(*) FROM "FixedExpense") as "Total de Despesas Fixas",
  (SELECT COUNT(*) FROM "Budget") as "Total de Orçamentos",
  (SELECT COUNT(*) FROM "Loan") as "Total de Empréstimos",
  (SELECT COUNT(*) FROM "Investment") as "Total de Investimentos",
  (SELECT COALESCE(SUM(amount), 0) FROM "Expense") as "Soma Total Despesas (R$)";

\echo ''
\echo '----------------------------------------'
\echo ''

-- ================================================================
-- 9. VERIFICAR DUPLICATAS DE USUÁRIOS
-- ================================================================
\echo '9. VERIFICAR EMAILS DUPLICADOS:'
\echo '----------------------------------------'

SELECT
  email,
  COUNT(*) as "Quantidade"
FROM "User"
GROUP BY email
HAVING COUNT(*) > 1;

\echo ''
\echo '✅ Se vazio, não há emails duplicados (correto!)'
\echo ''
\echo '----------------------------------------'
\echo ''

-- ================================================================
-- 10. RESUMO FINAL
-- ================================================================
\echo '========================================'
\echo 'RESUMO DA VERIFICAÇÃO:'
\echo '========================================'
\echo ''

DO $$
DECLARE
  orphan_count INT;
  user_count INT;
BEGIN
  -- Contar dados órfãos
  SELECT
    (SELECT COUNT(*) FROM "Expense" WHERE "userId" IS NULL) +
    (SELECT COUNT(*) FROM "CreditCard" WHERE "userId" IS NULL) +
    (SELECT COUNT(*) FROM "FixedExpense" WHERE "userId" IS NULL) +
    (SELECT COUNT(*) FROM "Budget" WHERE "userId" IS NULL) +
    (SELECT COUNT(*) FROM "Loan" WHERE "userId" IS NULL) +
    (SELECT COUNT(*) FROM "Investment" WHERE "userId" IS NULL)
  INTO orphan_count;

  -- Contar usuários
  SELECT COUNT(*) FROM "User" INTO user_count;

  -- Mostrar resultado
  RAISE NOTICE '';
  RAISE NOTICE '📊 Total de usuários: %', user_count;
  RAISE NOTICE '🔍 Dados órfãos encontrados: %', orphan_count;
  RAISE NOTICE '';

  IF orphan_count = 0 AND user_count > 0 THEN
    RAISE NOTICE '✅ SISTEMA APROVADO!';
    RAISE NOTICE '';
    RAISE NOTICE '   - Todos os dados têm userId';
    RAISE NOTICE '   - Isolamento funcionando perfeitamente';
    RAISE NOTICE '   - Pronto para produção';
  ELSIF orphan_count > 0 THEN
    RAISE NOTICE '❌ ATENÇÃO: DADOS ÓRFÃOS ENCONTRADOS!';
    RAISE NOTICE '';
    RAISE NOTICE '   - % registros sem userId', orphan_count;
    RAISE NOTICE '   - CORRIJA antes de usar em produção';
    RAISE NOTICE '   - Execute: npx prisma migrate reset';
  ELSIF user_count = 0 THEN
    RAISE NOTICE '⚠️  AVISO: Nenhum usuário cadastrado';
    RAISE NOTICE '';
    RAISE NOTICE '   - Crie usuários de teste primeiro';
    RAISE NOTICE '   - Execute testes do GUIA_TESTES_ISOLAMENTO.md';
  END IF;

  RAISE NOTICE '';
END $$;

\echo ''
\echo '========================================'
\echo 'FIM DA VERIFICAÇÃO'
\echo '========================================'
\echo ''
\echo 'Para mais detalhes, consulte:'
\echo '  - GUIA_TESTES_ISOLAMENTO.md'
\echo '  - GUIA_AUTENTICACAO_SEGURA.md'
\echo ''
