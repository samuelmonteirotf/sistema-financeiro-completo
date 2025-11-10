# 🧪 GUIA COMPLETO DE TESTES - Isolamento de Dados

**Objetivo:** Garantir que cada usuário vê **APENAS** seus próprios dados.

---

## 📋 TESTE COMPLETO PASSO A PASSO

### Passo 1: Preparar Ambiente

```bash
# 1. Limpar banco de dados (CUIDADO: apaga tudo!)
npx prisma migrate reset

# 2. Iniciar aplicação
npm run dev

# 3. Abrir 2 navegadores diferentes:
# - Chrome normal
# - Chrome anônimo (ou Firefox)
```

---

### Passo 2: Criar Usuário A

**No Chrome Normal:**

1. Acesse http://localhost:3000/register
2. Crie usuário A:
   - Nome: `Usuario A`
   - Email: `usuarioa@teste.com`
   - Senha: `senha123`

3. Após login, crie dados para Usuário A:

**Despesas do Usuário A:**
- Despesa 1: "Mercado do Usuário A" - R$ 100,00
- Despesa 2: "Gasolina do Usuário A" - R$ 200,00
- Despesa 3: "Farmácia do Usuário A" - R$ 50,00

**Cartões do Usuário A:**
- Cartão: "Nubank do A" - **** 1111

**Despesas Fixas do Usuário A:**
- "Aluguel do A" - R$ 1000,00

4. **ANOTE O QUE VOCÊ CRIOU** (vai precisar depois)

5. **NÃO SAIA DO NAVEGADOR AINDA**

---

### Passo 3: Criar Usuário B

**No Chrome Anônimo (ou Firefox):**

1. Acesse http://localhost:3000/register
2. Crie usuário B:
   - Nome: `Usuario B`
   - Email: `usuariob@teste.com`
   - Senha: `senha456`

3. Após login, crie dados DIFERENTES para Usuário B:

**Despesas do Usuário B:**
- Despesa 1: "Conta de Luz do B" - R$ 300,00
- Despesa 2: "Internet do B" - R$ 150,00
- Despesa 3: "Restaurante do B" - R$ 80,00

**Cartões do Usuário B:**
- Cartão: "Itaú do B" - **** 2222

**Despesas Fixas do Usuário B:**
- "Condomínio do B" - R$ 500,00

---

### Passo 4: VERIFICAR ISOLAMENTO (CRÍTICO!)

#### ✅ Teste 1: Usuário A vê apenas seus dados

**No Chrome Normal (Usuário A):**

1. Vá para `/despesas`
2. **VERIFICAR:**
   - ✅ Vê APENAS as 3 despesas dele (Mercado, Gasolina, Farmácia)
   - ❌ **NÃO VÊ** as despesas do Usuário B (Luz, Internet, Restaurante)

3. Vá para `/cartoes`
4. **VERIFICAR:**
   - ✅ Vê APENAS "Nubank do A"
   - ❌ **NÃO VÊ** "Itaú do B"

5. Vá para `/despesas-fixas`
6. **VERIFICAR:**
   - ✅ Vê APENAS "Aluguel do A"
   - ❌ **NÃO VÊ** "Condomínio do B"

#### ✅ Teste 2: Usuário B vê apenas seus dados

**No Chrome Anônimo (Usuário B):**

1. Vá para `/despesas`
2. **VERIFICAR:**
   - ✅ Vê APENAS as 3 despesas dele (Luz, Internet, Restaurante)
   - ❌ **NÃO VÊ** as despesas do Usuário A (Mercado, Gasolina, Farmácia)

3. Vá para `/cartoes`
4. **VERIFICAR:**
   - ✅ Vê APENAS "Itaú do B"
   - ❌ **NÃO VÊ** "Nubank do A"

5. Vá para `/despesas-fixas`
6. **VERIFICAR:**
   - ✅ Vê APENAS "Condomínio do B"
   - ❌ **NÃO VÊ** "Aluguel do A"

---

### Passo 5: VERIFICAR NO BANCO DE DADOS

```bash
# Abrir Prisma Studio
npx prisma studio
```

#### No Prisma Studio:

**1. Tabela `User`:**
- ✅ Deve ter 2 usuários (A e B)
- ✅ Cada um com ID único
- ✅ Emails diferentes

**2. Tabela `Expense`:**
- ✅ 6 despesas no total (3 de A + 3 de B)
- ✅ Cada despesa tem campo `userId`
- ✅ Despesas do A têm `userId` = ID do Usuário A
- ✅ Despesas do B têm `userId` = ID do Usuário B

**3. Tabela `CreditCard`:**
- ✅ 2 cartões no total
- ✅ "Nubank do A" tem `userId` do Usuário A
- ✅ "Itaú do B" tem `userId` do Usuário B

**4. Tabela `FixedExpense`:**
- ✅ 2 despesas fixas no total
- ✅ "Aluguel do A" tem `userId` do Usuário A
- ✅ "Condomínio do B" tem `userId` do Usuário B

---

### Passo 6: TESTE DE TENTATIVA DE ACESSO (Segurança)

#### Teste de Acesso Não Autorizado

**No Chrome Anônimo (Usuário B logado):**

1. Abra Prisma Studio
2. Copie o ID de uma despesa do Usuário A
3. No navegador do Usuário B, tente acessar:
   ```
   GET http://localhost:3000/api/expenses/[ID_DA_DESPESA_DO_A]
   ```
   (Use DevTools → Network ou Postman)

4. **RESULTADO ESPERADO:**
   - ❌ Não deve retornar a despesa
   - ✅ Deve retornar erro 404 ou vazio
   - **Por quê?** A API filtra por `userId`, então B não consegue acessar dados de A

#### Teste sem Login

1. Abra uma aba anônima SEM fazer login
2. Tente acessar:
   ```
   http://localhost:3000/api/expenses
   ```

3. **RESULTADO ESPERADO:**
   - ✅ Deve redirecionar para `/login` OU
   - ✅ Retornar erro 401 Unauthorized

---

## 🔍 QUERIES SQL PARA VERIFICAÇÃO

### Query 1: Ver todos os dados separados por usuário

```sql
-- Conectar ao banco
-- psql -d controle_financeiro

-- Ver usuários
SELECT id, email, name FROM "User";

-- Ver despesas por usuário
SELECT
  u.email as usuario,
  COUNT(e.id) as total_despesas,
  SUM(e.amount) as total_gasto
FROM "User" u
LEFT JOIN "Expense" e ON e."userId" = u.id
GROUP BY u.id, u.email
ORDER BY u.email;

-- Ver cartões por usuário
SELECT
  u.email as usuario,
  COUNT(c.id) as total_cartoes
FROM "User" u
LEFT JOIN "CreditCard" c ON c."userId" = u.id
GROUP BY u.id, u.email
ORDER BY u.email;

-- Ver despesas fixas por usuário
SELECT
  u.email as usuario,
  COUNT(f.id) as total_fixas
FROM "User" u
LEFT JOIN "FixedExpense" f ON f."userId" = u.id
GROUP BY u.id, u.email
ORDER BY u.email;
```

**RESULTADO ESPERADO:**
```
usuario              | total_despesas | total_gasto
---------------------|----------------|------------
usuarioa@teste.com   | 3              | 350.00
usuariob@teste.com   | 3              | 530.00
```

### Query 2: Verificar se há dados sem userId (BUG CRÍTICO!)

```sql
-- Verificar despesas sem userId (NÃO DEVE TER NENHUMA!)
SELECT COUNT(*) as despesas_sem_usuario
FROM "Expense"
WHERE "userId" IS NULL;

-- Verificar cartões sem userId (NÃO DEVE TER NENHUM!)
SELECT COUNT(*) as cartoes_sem_usuario
FROM "CreditCard"
WHERE "userId" IS NULL;

-- Verificar despesas fixas sem userId (NÃO DEVE TER NENHUMA!)
SELECT COUNT(*) as fixas_sem_usuario
FROM "FixedExpense"
WHERE "userId" IS NULL;
```

**RESULTADO ESPERADO:**
```
despesas_sem_usuario | cartoes_sem_usuario | fixas_sem_usuario
---------------------|---------------------|------------------
0                    | 0                   | 0
```

**⚠️ SE ALGUM NÚMERO FOR > 0, VOCÊ TEM UM BUG CRÍTICO!**

### Query 3: Listar todas as despesas com identificação do usuário

```sql
SELECT
  u.email as usuario,
  e.description as despesa,
  e.amount as valor,
  e.date as data,
  e."userId" as userId
FROM "Expense" e
JOIN "User" u ON u.id = e."userId"
ORDER BY u.email, e.date DESC;
```

**RESULTADO ESPERADO:**
```
usuario              | despesa                    | valor  | userId
---------------------|----------------------------|--------|--------
usuarioa@teste.com   | Mercado do Usuário A       | 100.00 | xxx
usuarioa@teste.com   | Gasolina do Usuário A      | 200.00 | xxx
usuarioa@teste.com   | Farmácia do Usuário A      | 50.00  | xxx
usuariob@teste.com   | Conta de Luz do B          | 300.00 | yyy
usuariob@teste.com   | Internet do B              | 150.00 | yyy
usuariob@teste.com   | Restaurante do B           | 80.00  | yyy
```

Cada usuário tem `userId` diferente!

---

## 🤖 SCRIPT DE TESTE AUTOMATIZADO

Criei um script que você pode executar para testar automaticamente:

```bash
# Executar script de teste
npx tsx scripts/test-isolation.ts
```

O script vai:
1. Criar 2 usuários
2. Criar dados para cada um
3. Verificar isolamento
4. Gerar relatório

---

## ✅ CHECKLIST DE VERIFICAÇÃO FINAL

### Antes de Vender/Entregar

- [ ] **Teste Manual Completo**
  - [ ] Criar Usuário A com dados
  - [ ] Criar Usuário B com dados
  - [ ] Verificar que A não vê dados de B
  - [ ] Verificar que B não vê dados de A

- [ ] **Verificação no Banco**
  - [ ] Executar Query 1 (dados separados)
  - [ ] Executar Query 2 (sem dados órfãos)
  - [ ] Executar Query 3 (listar com userId)
  - [ ] Todas as queries retornam resultado esperado

- [ ] **Teste de Segurança**
  - [ ] Tentar acessar API sem login → 401
  - [ ] Tentar acessar dados de outro usuário → 404/vazio
  - [ ] Verificar cookie HttpOnly no DevTools

- [ ] **Teste de Performance**
  - [ ] Criar 10+ despesas para cada usuário
  - [ ] Verificar que listagem é rápida (<500ms)
  - [ ] Verificar que não há consultas N+1

- [ ] **Teste de Precisão Decimal**
  - [ ] Criar despesa parcelada de R$ 100 em 3x
  - [ ] Verificar que soma das parcelas = 100.00 exato
  - [ ] Ver Query no Passo 6 abaixo

- [ ] **Documentação**
  - [ ] README com instruções de setup
  - [ ] .env.example configurado
  - [ ] Guia de deploy

---

## 📸 EVIDÊNCIAS VISUAIS (para apresentar ao cliente)

### Screenshot 1: Usuário A - Dashboard
![Dashboard mostrando apenas dados do Usuário A]

### Screenshot 2: Usuário B - Dashboard
![Dashboard mostrando apenas dados do Usuário B]

### Screenshot 3: Prisma Studio - Tabela Expense
![Tabela mostrando userId diferentes para cada despesa]

### Screenshot 4: DevTools - Cookies
![Cookie next-auth.session-token com flag HttpOnly]

---

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: Usuário A vê dados de B

**Diagnóstico:**
```sql
-- Ver qual API não está filtrando
SELECT * FROM "Expense" WHERE "userId" = '[ID_DO_A]';
SELECT * FROM "Expense" WHERE "userId" = '[ID_DO_B]';
```

**Solução:**
- Alguma API ainda está usando `findFirst()` sem filtro
- Execute: `grep -r "findFirst()" app/api/`
- Deve retornar 0 resultados

### Problema 2: Erro 401 mesmo logado

**Diagnóstico:**
```bash
# Ver cookies no DevTools
# Application → Cookies → localhost:3000
# Deve ter: next-auth.session-token
```

**Solução:**
- Limpar cookies e fazer login novamente
- Verificar NEXTAUTH_SECRET no .env
- Verificar NEXTAUTH_URL no .env

### Problema 3: Dados sem userId no banco

**Diagnóstico:**
```sql
SELECT * FROM "Expense" WHERE "userId" IS NULL;
```

**Solução:**
- Dados foram criados antes da atualização
- Execute: `npx prisma migrate reset`
- Recrie os dados

---

## 🎯 TESTE DE CARGA (Opcional)

### Cenário: 100 usuários simultâneos

```bash
# Instalar ferramenta
npm install -g artillery

# Criar arquivo de teste
# artillery-test.yml
```

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Login e buscar despesas"
    flow:
      - post:
          url: "/api/auth/signin"
          json:
            email: "usuario{{ $randomNumber(1, 100) }}@teste.com"
            password: "senha123"
      - get:
          url: "/api/expenses"
```

```bash
# Executar teste
artillery run artillery-test.yml
```

**Resultado esperado:**
- p95 < 500ms (95% das requisições em menos de 500ms)
- Sem erros 500
- Sem vazamento de memória

---

## 📊 RELATÓRIO DE VERIFICAÇÃO (Template)

```markdown
# Relatório de Testes - Sistema Financeiro

Data: [DATA]
Testado por: [SEU NOME]

## Resultados

### Isolamento de Dados: ✅ APROVADO
- [x] Usuário A vê apenas seus dados
- [x] Usuário B vê apenas seus dados
- [x] Sem dados órfãos no banco

### Segurança: ✅ APROVADO
- [x] Acesso sem login bloqueado (401)
- [x] Cookies HttpOnly configurados
- [x] JWT funcionando corretamente

### Performance: ✅ APROVADO
- [x] Listagem < 500ms
- [x] Validação JWT < 5ms
- [x] Sem consultas N+1

### Precisão Decimal: ✅ APROVADO
- [x] Parcelas somam valor exato
- [x] Sem erros de arredondamento

## Conclusão

✅ Sistema APROVADO para produção
```

---

## 🎓 EXPLICAÇÃO TÉCNICA (para cliente/investidor)

**Como funciona o isolamento?**

1. **Login do Usuário:**
   - Usuário faz login
   - Sistema cria JWT com `userId` dentro
   - JWT é salvo em cookie HttpOnly (JavaScript não acessa)

2. **Cada Requisição:**
   - Cookie é enviado automaticamente
   - Middleware valida JWT (~1ms)
   - Extrai `userId` do token
   - API usa `userId` para filtrar dados

3. **No Banco de Dados:**
   ```sql
   -- O que a API faz internamente:
   SELECT * FROM "Expense" WHERE "userId" = '[userId_da_sessao]'
   ```
   - Só retorna dados do usuário logado
   - Impossível acessar dados de outros

4. **Segurança:**
   - JWT é assinado criptograficamente
   - Só o servidor pode criar tokens válidos
   - Cookie HttpOnly impede roubo por XSS
   - Middleware bloqueia acesso não autorizado

**Em resumo:** Cada usuário está em um "universo paralelo" - só vê seus próprios dados.

---

## 📞 SUPORTE

Se algum teste falhar:
1. Executar queries SQL de diagnóstico
2. Verificar logs do servidor
3. Verificar variáveis de ambiente
4. Consultar `/GUIA_AUTENTICACAO_SEGURA.md`

---

**Data de criação:** 2025-11-04
**Versão:** 1.0.0
**Status:** ✅ Pronto para uso
