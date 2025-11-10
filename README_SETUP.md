# Sistema de Controle Financeiro - Setup Completo

## 🎯 Melhorias Implementadas

Este sistema foi completamente refatorado para garantir precisão financeira e funcionalidade completa. Todas as issues críticas foram resolvidas.

### ✅ Correções Críticas Implementadas

#### 1. **Precisão Financeira (CRÍTICO)**
- ✅ **Migrado de Float para Decimal**: Todos os campos monetários agora usam `Decimal` com precisão de 19 dígitos e 2 casas decimais
- ✅ **PostgreSQL obrigatório**: Schema atualizado para PostgreSQL (precisão decimal não disponível em SQLite)
- ✅ **Cálculos com Decimal.js**: Todos os cálculos financeiros usam a biblioteca Decimal.js

#### 2. **Segurança**
- ✅ **Credenciais removidas**: Dados sensíveis movidos para variáveis de ambiente
- ✅ **Secret forte**: NextAuth configurado com instruções para gerar secret seguro
- ✅ **Build errors habilitados**: next.config.mjs configurado para não ignorar erros TypeScript

#### 3. **Dados Mock Removidos**
- ✅ **Budget real**: Sistema de orçamento implementado com API própria
- ✅ **Status real**: Pagamentos calculados com base em datas e parcelas reais

#### 4. **Bugs Corrigidos**
- ✅ **Cálculo de parcelamentos**: Corrigido para somar valores reais ao invés de multiplicar
- ✅ **Pagamentos automáticos**: Corrigido para marcar como pago apenas se a data já passou

#### 5. **CRUD Completo**
- ✅ **Expenses**: GET, POST, PUT, DELETE implementados
- ✅ **Cards**: GET, POST, PUT, DELETE implementados
- ✅ **Fixed Expenses**: GET, POST, PUT, DELETE implementados

#### 6. **Novos Recursos**
- ✅ **Sistema de Orçamento**: Modelo Budget com API completa
- ✅ **Rastreamento de Empréstimos**: Modelo LoanPayment para rastreamento de pagamentos

---

## 🚀 Setup do Projeto

### 1. Pré-requisitos

```bash
# Node.js 18+ e npm
node --version  # Deve ser v18 ou superior

# PostgreSQL 14+ instalado e rodando
psql --version
```

### 2. Instalação

```bash
# Clone o repositório (se ainda não fez)
git clone <seu-repo>
cd controle-financeiro

# Instale as dependências
npm install
```

### 3. Configuração do Banco de Dados PostgreSQL

```bash
# Crie o banco de dados
createdb controle_financeiro

# Ou via psql:
psql -U postgres
CREATE DATABASE controle_financeiro;
\q
```

### 4. Configuração de Variáveis de Ambiente

```bash
# Copie o arquivo .env.example para .env
cp .env.example .env

# Edite o .env e configure:
nano .env
```

**Configurações obrigatórias no `.env`:**

```env
# Database (SUBSTITUA com suas credenciais)
DATABASE_URL="postgresql://usuario:senha@localhost:5432/controle_financeiro?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"

# Gere um secret seguro com:
# openssl rand -base64 32
NEXTAUTH_SECRET="SEU_SECRET_GERADO_AQUI"

# Ambiente
NODE_ENV="development"
```

### 5. Executar Migrações do Prisma

```bash
# Gerar o Prisma Client
npx prisma generate

# Executar as migrações
npx prisma migrate dev --name init

# Verificar o banco de dados
npx prisma studio
```

### 6. (Opcional) Importar Dados Reais

Se você tem dados em CSV para importar:

```bash
# Configure as credenciais no .env
IMPORT_USER_EMAIL="seu-email@exemplo.com"
IMPORT_USER_PASSWORD="sua-senha-segura"
IMPORT_USER_NAME="Seu Nome"

# Execute o script de importação
npx tsx prisma/import-real-data.ts
```

### 7. Executar o Projeto

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

O sistema estará disponível em: **http://localhost:3000**

---

## 📊 Estrutura do Banco de Dados

### Modelos Principais

| Modelo | Descrição | Campos Decimal |
|--------|-----------|----------------|
| **User** | Usuários do sistema | - |
| **Category** | Categorias de despesas/receitas | - |
| **CreditCard** | Cartões de crédito | `limit` |
| **Expense** | Despesas | `amount` |
| **Installment** | Parcelas de despesas | `amount` |
| **FixedExpense** | Despesas fixas recorrentes | `amount` |
| **Loan** | Empréstimos | `originalAmount`, `currentBalance`, `interestRate`, `monthlyPayment` |
| **LoanPayment** | Pagamentos de empréstimos | `amount`, `principal`, `interest` |
| **Investment** | Investimentos | `amount`, `currentValue`, `purchasePrice` |
| **Income** | Receitas | `amount` |
| **Budget** | Orçamento por categoria | `amount` |

---

## 🔧 APIs Disponíveis

### Autenticação
- `POST /auth` - Login e registro

### Despesas
- `GET /api/expenses` - Listar despesas (com filtros)
- `POST /api/expenses` - Criar despesa
- `GET /api/expenses/[id]` - Buscar despesa específica
- `PUT /api/expenses/[id]` - Atualizar despesa
- `DELETE /api/expenses/[id]` - Deletar despesa

### Cartões de Crédito
- `GET /api/cards` - Listar cartões
- `POST /api/cards` - Criar cartão
- `PUT /api/cards/[id]` - Atualizar cartão
- `DELETE /api/cards/[id]` - Deletar cartão
- `GET /api/cards/[id]/invoice` - Fatura do cartão

### Despesas Fixas
- `GET /api/fixed-expenses` - Listar despesas fixas
- `POST /api/fixed-expenses` - Criar despesa fixa
- `GET /api/fixed-expenses/[id]` - Buscar despesa fixa
- `PUT /api/fixed-expenses/[id]` - Atualizar despesa fixa
- `DELETE /api/fixed-expenses/[id]` - Deletar despesa fixa

### Orçamento
- `GET /api/budgets?month=11&year=2025` - Buscar orçamentos do mês
- `POST /api/budgets` - Criar/atualizar orçamento

### Dashboard
- `GET /api/dashboard/summary` - Resumo financeiro
- `GET /api/dashboard/expenses-by-category` - Despesas por categoria
- `GET /api/dashboard/recent-expenses` - Despesas recentes

### Outras
- `GET /api/categories` - Listar categorias
- `GET /api/installments` - Listar parcelamentos
- `GET /api/invoices` - Listar faturas
- `GET /api/loans` - Listar empréstimos
- `GET /api/investments` - Listar investimentos
- `GET /api/alerts` - Alertas e notificações

---

## 🧪 Testes

**Status**: Testes unitários pendentes (ver seção "Próximos Passos")

Para criar testes, adicione ao `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0"
  }
}
```

---

## 📝 Próximos Passos (Recomendados para Produção)

### Alta Prioridade
- [ ] **Implementar middleware de autenticação NextAuth**
  - Sessões com JWT
  - Proteção de rotas com middleware
  - Refresh tokens

- [ ] **Criar testes automatizados**
  - Testes unitários para cálculos financeiros (crítico!)
  - Testes de integração para APIs
  - Testes E2E para fluxos principais

- [ ] **Adicionar paginação nas APIs**
  - Limite de 50 itens por página
  - Cursor-based pagination para performance

- [ ] **Validação de sessão em todas as APIs**
  - Substituir `findFirst()` por validação de sessão
  - Verificar ownership de recursos

### Média Prioridade
- [ ] **Tratamento de erros aprimorado**
  - Notificações toast para o usuário
  - Retry logic com exponential backoff
  - Logging estruturado (Winston/Pino)

- [ ] **Cálculo de ROI para investimentos**
  - API para calcular retorno
  - Gráficos de performance

- [ ] **Rastreamento completo de empréstimos**
  - API para registrar pagamentos
  - Cálculo de juros e amortização
  - Projeção de quitação

### Baixa Prioridade
- [ ] **Exportação de relatórios**
  - PDF com resumo mensal
  - CSV para análise em Excel

- [ ] **Notificações por email**
  - Alertas de vencimento
  - Resumo mensal automático

- [ ] **Integração com APIs de cotação**
  - Preços de criptomoedas em tempo real
  - Conversão de moedas

---

## 🐛 Issues Conhecidas

### Resolvidas ✅
- ~~Float causando erros de arredondamento~~ → **RESOLVIDO** (migrado para Decimal)
- ~~Budget com dados mock~~ → **RESOLVIDO** (API real implementada)
- ~~Credenciais hardcoded~~ → **RESOLVIDO** (movidas para .env)
- ~~Bugs no cálculo de parcelamentos~~ → **RESOLVIDO**
- ~~Status de pagamento sempre "paid"~~ → **RESOLVIDO** (cálculo real)
- ~~CRUD incompleto~~ → **RESOLVIDO** (PUT/DELETE implementados)

### Pendentes ⚠️
- **Autenticação com sessão**: Sistema atual usa apenas findFirst() sem verificar sessão
- **Sem testes**: Zero cobertura de testes automatizados
- **Performance**: Sem cache ou paginação em listagens grandes

---

## 📚 Documentação Adicional

### Precisão Decimal
O sistema usa `Decimal.js` para garantir precisão:

```typescript
import Decimal from 'decimal.js'

// Correto ✅
const total = new Decimal('10.50').plus(new Decimal('5.25'))
// total = 15.75 (exato)

// Errado ❌ (Float tem imprecisão)
const total = 10.50 + 5.25
// total = 15.750000000000002 (erro de arredondamento)
```

### Cálculo de Parcelas
Distribuição de diferenças de arredondamento para última parcela:

```typescript
// Exemplo: R$ 100,00 em 3x
// Parcela base: 100 / 3 = 33.333333...
// Resultado:
// Parcela 1: R$ 33.33
// Parcela 2: R$ 33.33
// Parcela 3: R$ 33.34  ← Absorve a diferença de R$ 0.01
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob licença MIT.

---

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verifique se o PostgreSQL está rodando
2. Confirme que as variáveis de ambiente estão corretas
3. Execute `npx prisma studio` para verificar o banco
4. Verifique os logs no console durante desenvolvimento

**Erros comuns:**
- `P2002: Unique constraint failed` → Registro duplicado, verifique dados
- `connect ECONNREFUSED` → PostgreSQL não está rodando
- `Invalid prisma.X.create()` → Execute `npx prisma generate`
