# 🎯 GUIA PRÁTICO DE IMPLEMENTAÇÃO
## Prompts Prontos + Checklists + Scripts

---

## 📋 CHECKLIST GERAL DO PROJETO

### ☐ Fase 1: Setup Inicial (2 dias)
- [ ] Criar projeto Next.js
- [ ] Instalar todas as dependências
- [ ] Configurar Prisma
- [ ] Criar arquivo .env.local
- [ ] Configurar shadcn/ui
- [ ] Criar estrutura de pastas
- [ ] Inicializar Git
- [ ] Fazer primeiro commit

### ☐ Fase 2: Banco de Dados (3 dias)
- [ ] Configurar PostgreSQL
- [ ] Copiar schema Prisma
- [ ] Executar primeira migration
- [ ] Testar conexão com banco
- [ ] Criar seed com dados iniciais
- [ ] Validar estrutura no Prisma Studio

### ☐ Fase 3: Autenticação (2 dias)
- [ ] Configurar NextAuth
- [ ] Criar tela de login
- [ ] Criar tela de registro
- [ ] Implementar middleware de autenticação
- [ ] Testar fluxo completo

### ☐ Fase 4: Cartões (5 dias)
- [ ] API: GET /api/cards
- [ ] API: POST /api/cards
- [ ] API: PUT /api/cards/[id]
- [ ] API: DELETE /api/cards/[id]
- [ ] Tela: Lista de cartões
- [ ] Tela: Formulário de cartão
- [ ] Validações Zod
- [ ] Testes de API

### ☐ Fase 5: Despesas (7 dias)
- [ ] API: GET /api/expenses
- [ ] API: POST /api/expenses
- [ ] API: PUT /api/expenses/[id]
- [ ] API: DELETE /api/expenses/[id]
- [ ] Tela: Lista de despesas
- [ ] Tela: Formulário de despesa
- [ ] Implementar cálculo de parcelas
- [ ] Autocomplete de estabelecimentos
- [ ] Categorização automática
- [ ] Upload de anexos
- [ ] Filtros avançados
- [ ] Testes completos

### ☐ Fase 6: Faturas (4 dias)
- [ ] API: GET /api/cards/[id]/invoice
- [ ] Implementar lógica de fechamento
- [ ] Tela: Visualização de fatura
- [ ] Gerar PDF da fatura
- [ ] Marcar como paga
- [ ] Histórico de faturas

### ☐ Fase 7: Dashboard (5 dias)
- [ ] API: GET /api/reports/dashboard
- [ ] Cards de resumo
- [ ] Gráfico: Despesas por categoria
- [ ] Gráfico: Evolução mensal
- [ ] Gráfico: Despesas por cartão
- [ ] Painel de alertas
- [ ] Lista de próximas faturas
- [ ] Animações e transições

### ☐ Fase 8: Despesas Fixas (3 dias)
- [ ] API: CRUD de despesas fixas
- [ ] Tela: Lista de despesas fixas
- [ ] Tela: Formulário
- [ ] Cálculo automático para 24 meses
- [ ] Alertas de vencimento

### ☐ Fase 9: Empréstimos (5 dias)
- [ ] API: CRUD de empréstimos
- [ ] Implementar cálculo Price
- [ ] Implementar cálculo SAC
- [ ] Tela: Lista de empréstimos
- [ ] Tela: Detalhes com tabela de amortização
- [ ] Simulador de amortização antecipada
- [ ] Gráficos de evolução da dívida

### ☐ Fase 10: Empréstimos a Terceiros (4 dias)
- [ ] API: CRUD de empréstimos dados
- [ ] Controle de pagamentos recebidos
- [ ] Impacto em múltiplos cartões
- [ ] Tela: Lista e detalhes
- [ ] Histórico de pagamentos
- [ ] Cálculo de saldo devedor

### ☐ Fase 11: Investimentos (4 dias)
- [ ] API: CRUD de investimentos
- [ ] Integração com CoinGecko
- [ ] Atualização automática de preços
- [ ] Tela: Portfolio
- [ ] Gráficos de rentabilidade
- [ ] Alertas de preço

### ☐ Fase 12: Relatórios (5 dias)
- [ ] Relatório por categoria
- [ ] Relatório por cartão
- [ ] Fluxo de caixa projetado
- [ ] Comparativo mensal
- [ ] Exportação para Excel
- [ ] Exportação para PDF

### ☐ Fase 13: Testes e Deploy (7 dias)
- [ ] Testes unitários (utils)
- [ ] Testes de integração (APIs)
- [ ] Testes E2E (principais fluxos)
- [ ] Otimizações de performance
- [ ] Configurar CI/CD
- [ ] Deploy em produção
- [ ] Monitoramento de erros
- [ ] Backup automático

---

## 🤖 PROMPTS PRONTOS PARA CLAUDE CODE

### 1. Setup Inicial do Projeto

\`\`\`
Você é um especialista em Next.js 14+ e TypeScript. Preciso que você:

1. Crie um novo projeto Next.js com App Router usando os seguintes parâmetros:
   - TypeScript
   - Tailwind CSS
   - App Router
   - ESLint
   - Gerenciador: npm

2. Instale as seguintes dependências:
   - Prisma e @prisma/client
   - decimal.js (para precisão financeira)
   - date-fns (manipulação de datas)
   - zod (validação)
   - @tanstack/react-table (tabelas)
   - recharts (gráficos)
   - next-auth (autenticação)
   - react-hook-form e @hookform/resolvers (formulários)
   - lucide-react (ícones)

3. Configure o shadcn/ui e instale os seguintes componentes:
   - button, card, input, label, select, dialog, table, tabs, form, calendar, popover

4. Crie a estrutura de pastas seguindo as boas práticas do Next.js 14:
   - app/(auth)/
   - app/(dashboard)/
   - app/api/
   - components/{ui,dashboard,expenses,cards,forms,charts,layout}
   - lib/{validations,utils,api,hooks}
   - types/
   - prisma/

5. Configure o arquivo .env.example com as variáveis necessárias:
   - DATABASE_URL
   - NEXTAUTH_URL
   - NEXTAUTH_SECRET

6. Configure o Prisma com PostgreSQL

7. Crie um arquivo .gitignore completo

Após criar tudo, me mostre:
- Estrutura de pastas criada
- Conteúdo do package.json
- Comandos para iniciar o projeto
\`\`\`

---

### 2. Schema Prisma Completo

\`\`\`
Você é um especialista em modelagem de banco de dados com Prisma.

Preciso que você crie um schema Prisma COMPLETO para um sistema de controle financeiro pessoal com as seguintes entidades e regras:

ENTIDADES PRINCIPAIS:
1. User (usuários do sistema)
2. Household (casa/família, pode ter múltiplos usuários)
3. Card (cartões de crédito/débito)
4. Category (categorias de despesas/receitas, com hierarquia)
5. Expense (despesas, com suporte a parcelamento)
6. Installment (parcelas individuais de despesas)
7. FixedExpense (despesas fixas mensais)
8. Loan (empréstimos e financiamentos próprios)
9. LoanPayment (parcelas de empréstimos)
10. LentMoney (dinheiro emprestado a terceiros)
11. LentMoneyPayment (pagamentos recebidos de empréstimos)
12. LentMoneyCardImpact (impacto de empréstimos em cartões)
13. Income (receitas/proventos)
14. Investment (investimentos: crypto, ações, etc.)
15. InvestmentTransaction (transações de investimentos)
16. Budget (orçamento por categoria)
17. CategorizationRule (regras para categorização automática)

REGRAS IMPORTANTES:
- Usar CUID para IDs (não sequenciais)
- Valores monetários: Decimal(12,2) 
- Timestamps automáticos (createdAt, updatedAt)
- Soft delete onde necessário
- Relacionamentos bem definidos com onDelete
- Índices para queries frequentes
- Campos obrigatórios e opcionais bem definidos
- Suporte a múltiplos cartões por despesa (parcelamentos)
- Hierarquia de categorias (pai/filho)

Me forneça o schema.prisma completo e pronto para uso, com comentários explicando cada modelo.
\`\`\`

---

### 3. Componente de Formulário de Despesa

\`\`\`
Você é um especialista em React, Next.js 14 e formulários complexos.

Preciso que você crie um componente COMPLETO de formulário para lançamento de despesas com as seguintes características:

CAMPOS:
1. Descrição (text input com autocomplete de histórico)
2. Valor (money input com formatação BRL)
3. Data da compra (date picker)
4. Cartão (select com lista de cartões ativos)
5. Categoria (select com categorias, sugestão automática baseada em histórico)
6. Parcelamento (opções: à vista, 3x, 6x, 12x, personalizado)
7. Observações (textarea opcional)
8. Anexos (upload de imagens/PDFs)

FUNCIONALIDADES:
- Usar react-hook-form + zod para validação
- Mostrar limite disponível do cartão selecionado
- Mostrar fechamento e vencimento do cartão
- Calcular e exibir preview das parcelas
- Sugerir categoria baseado no estabelecimento
- Autocomplete de estabelecimentos do histórico
- Upload de múltiplos arquivos
- Estados de loading
- Mensagens de erro claras
- Validação em tempo real
- Botões de ação: Cancelar e Salvar

TECNOLOGIAS:
- React Hook Form
- Zod para schema de validação
- shadcn/ui para componentes base
- lucide-react para ícones
- date-fns para datas
- Decimal.js para valores

Me forneça o código completo do componente, incluindo:
1. Interface TypeScript
2. Schema Zod
3. Componente React
4. Estilização com Tailwind
5. Lógica de validação
6. Tratamento de erros
\`\`\`

---

### 4. API Route para Cálculo de Fatura

\`\`\`
Você é um especialista em desenvolvimento de APIs com Next.js 14 e cálculos financeiros.

Preciso que você crie uma API Route COMPLETA para calcular a fatura de um cartão de crédito com as seguintes especificações:

ENDPOINT: GET /api/cards/[id]/invoice?month=YYYY-MM

LÓGICA DE CÁLCULO:
1. Receber ID do cartão e mês de referência
2. Buscar configurações do cartão (dia de fechamento e vencimento)
3. Calcular período da fatura:
   - Início: Dia após fechamento do mês anterior
   - Fim: Dia do fechamento do mês atual
4. Buscar todas as despesas à vista do período
5. Buscar todas as parcelas com vencimento no período
6. Somar valores usando Decimal.js (precisão financeira)
7. Ordenar items por data
8. Calcular saldo anterior (se houver)
9. Calcular pagamentos recebidos
10. Calcular saldo final

RESPOSTA JSON:
{
  "cardId": "string",
  "month": "string",
  "closingDate": "string",
  "dueDate": "string",
  "items": [
    {
      "id": "string",
      "description": "string",
      "date": "string",
      "amount": "number",
      "category": "string",
      "installment": "3/12" | null
    }
  ],
  "subtotal": "number",
  "previousBalance": "number",
  "payments": "number",
  "total": "number"
}

REGRAS:
- Usar Prisma para queries
- Usar Decimal.js para TODOS os cálculos
- Validar parâmetros com Zod
- Tratar erros adequadamente
- Retornar 404 se cartão não existir
- Retornar 401 se usuário não tiver permissão
- Adicionar comentários explicando a lógica
- Performance: usar includes para evitar N+1 queries

Me forneça o código completo da API Route com TypeScript.
\`\`\`

---

### 5. Dashboard com Gráficos

\`\`\`
Você é um especialista em data visualization com React e Recharts.

Preciso que você crie um componente de Dashboard COMPLETO com os seguintes elementos:

CARDS DE RESUMO (4 cards no topo):
1. Total de Receitas do mês
2. Total de Despesas do mês
3. Saldo do mês (receitas - despesas)
4. Número de cartões ativos

GRÁFICOS:
1. Gráfico de Pizza: Despesas por Categoria
   - Mostrar top 5 categorias
   - Resto em "Outros"
   - Cores distintas
   - Percentuais e valores

2. Gráfico de Barras: Despesas por Cartão
   - Um bar para cada cartão
   - Cores dos cartões
   - Valor e percentual

3. Gráfico de Linhas: Evolução das Despesas
   - Últimos 6 meses
   - Linha suave
   - Área preenchida
   - Tooltips informativos

4. Gráfico de Área: Projeção de Fluxo de Caixa
   - Próximos 12 meses
   - Linha de receitas
   - Linha de despesas
   - Área de saldo
   - Destacar saldo negativo em vermelho

PAINEL DE ALERTAS:
- Faturas próximas do vencimento
- Cartões próximos do limite
- Parcelas terminando
- Empréstimos com atraso

LISTA: PRÓXIMAS FATURAS
- Card de cada cartão
- Data de vencimento
- Valor
- Status (pago/pendente)
- Ação: Ver detalhes

TECNOLOGIAS:
- Next.js 14 (Server Components onde possível)
- Recharts para gráficos
- shadcn/ui para componentes base
- Tailwind para estilização
- lucide-react para ícones
- API routes para dados

REQUISITOS:
- Responsivo (desktop e mobile)
- Loading states
- Error states
- Animações suaves
- Performance otimizada
- TypeScript tipado

Me forneça:
1. Componente principal do Dashboard
2. Sub-componentes (StatCard, Charts, etc.)
3. API routes necessárias
4. Tipos TypeScript
5. Hooks customizados
\`\`\`

---

### 6. Sistema de Cálculo de Empréstimos

\`\`\`
Você é um especialista em matemática financeira e TypeScript.

Preciso que você crie uma biblioteca COMPLETA de cálculos de empréstimos com as seguintes funções:

FUNÇÃO 1: calculateLoanPrice
- Calcular parcelas pelo Sistema Price (parcelas fixas)
- Parâmetros: valor principal, taxa anual, número de meses
- Retornar array com cada parcela contendo:
  - Número da parcela
  - Valor do principal
  - Valor dos juros
  - Valor total da parcela
  - Saldo devedor

FUNÇÃO 2: calculateLoanSAC
- Calcular parcelas pelo Sistema SAC (parcelas decrescentes)
- Mesmos parâmetros e estrutura de retorno

FUNÇÃO 3: simulateEarlyPayment
- Simular pagamento antecipado de parcelas
- Calcular economia de juros
- Recalcular cronograma

FUNÇÃO 4: calculateRemainingBalance
- Calcular saldo devedor em qualquer ponto
- Considerar parcelas pagas

FUNÇÃO 5: effectiveInterestRate
- Calcular taxa efetiva anual
- Considerar IOF e outras taxas

REGRAS CRÍTICAS:
- USAR Decimal.js para TODOS os cálculos (zero erro de arredondamento)
- Validar todos os inputs
- Tratar casos especiais (última parcela, saldo residual)
- Documentação completa com JSDoc
- Testes unitários incluídos
- Exemplos de uso

ARQUIVO: lib/utils/loan-calculations.ts

Me forneça o código completo com:
1. Todas as funções implementadas
2. Tipos TypeScript
3. Validações
4. Testes unitários (Jest/Vitest)
5. Exemplos de uso comentados
\`\`\`

---

### 7. Componente de Gestão de Parcelamentos

\`\`\`
Você é um especialista em UX e desenvolvimento React.

Preciso que você crie uma interface COMPLETA para gerenciar parcelamentos ativos com as seguintes funcionalidades:

VISUALIZAÇÃO:
- Lista de todos os parcelamentos ativos
- Card para cada parcelamento contendo:
  - Nome do estabelecimento
  - Cartão(s) utilizado(s)
  - Valor total (soma de todas as parcelas)
  - Valor da parcela
  - Número de parcelas (ex: "8/12")
  - Barra de progresso visual
  - Percentual pago
  - Próximas parcelas a vencer
  - Data de início e término

FILTROS:
- Por cartão
- Por status (ativas, encerradas)
- Por valor (maior/menor)
- Por data de término

AÇÕES:
- Ver detalhes (abrir modal com todas as parcelas)
- Editar (alterar observações)
- Simular pagamento antecipado
- Alertar quando parcela está próxima do fim

RESUMO NO TOPO:
- Total em parcelamentos ativos
- Valor mensal comprometido
- Previsão de término
- Impacto no limite dos cartões

DETALHES (MODAL):
- Tabela com TODAS as parcelas
- Colunas: Número, Vencimento, Valor, Status, Ações
- Marcar como paga manualmente
- Adicionar observações por parcela

TECNOLOGIAS:
- Next.js 14
- shadcn/ui (Dialog, Table, Progress, Badge)
- Tailwind CSS
- lucide-react
- @tanstack/react-table
- date-fns

Me forneça:
1. Componente principal (InstallmentsView)
2. Card de parcelamento
3. Modal de detalhes
4. Hooks customizados
5. API routes necessárias
6. Tipos TypeScript completos
\`\`\`

---

### 8. Migração de Dados dos CSVs

\`\`\`
Você é um especialista em ETL e migração de dados com Node.js.

Preciso que você crie um script COMPLETO de migração para importar dados de múltiplos arquivos CSV para o banco de dados PostgreSQL via Prisma.

ARQUIVOS CSV:
1. Cryptos.csv - Investimentos em criptomoedas
2. Despesas_Cotidianas.csv - Despesas por categoria e cartão
3. Despesas_fixas.csv - Despesas recorrentes
4. Empréstimos_e_financiamentos.csv - Empréstimos
5. Mila.csv - Empréstimo a terceiro com estrutura complexa
6. Parcelamentos.csv - Compras parceladas
7. Pix.csv - Despesas via PIX
8. Despesas_e_Proventos_totais.csv - Consolidação geral

REQUISITOS:
1. Ler cada CSV com tratamento de encoding (UTF-8)
2. Validar dados antes de inserir
3. Criar relacionamentos corretos (household, cards, categories)
4. Tratar valores decimais corretamente
5. Converter datas para formato ISO
6. Fazer insert em lotes (batch insert)
7. Transaction para garantir integridade
8. Logging detalhado de progresso
9. Tratamento de erros robusto
10. Rollback em caso de falha
11. Relatório final de importação

ESTRUTURA:
\`\`\`typescript
// scripts/migrate-csv-data.ts

// 1. Criar household padrão
// 2. Criar usuário admin
// 3. Criar cartões (C6, Infinite BB, Bradesco, Black)
// 4. Criar categorias padrão
// 5. Importar despesas cotidianas
// 6. Importar despesas fixas
// 7. Importar parcelamentos
// 8. Importar empréstimos
// 9. Importar investimentos
// 10. Importar empréstimo "Mila"
// 11. Gerar relatório
\`\`\`

TECNOLOGIAS:
- Prisma Client
- csv-parse
- Decimal.js
- date-fns
- TypeScript

Me forneça:
1. Script completo de migração
2. Funções auxiliares
3. Validações
4. Tratamento de erros
5. Logging
6. Documentação de uso
\`\`\`

---

## 🛠️ SCRIPTS BASH PRONTOS

### Script 1: Setup Completo do Projeto

\`\`\`bash
#!/bin/bash
# setup-project.sh

echo "🚀 Iniciando setup do projeto Controle Financeiro..."

# 1. Criar projeto Next.js
echo "📦 Criando projeto Next.js..."
npx create-next-app@latest controle-financeiro \
  --typescript \
  --tailwind \
  --app \
  --use-npm \
  --no-src-dir \
  --import-alias "@/*"

cd controle-financeiro

# 2. Instalar dependências principais
echo "📥 Instalando dependências..."
npm install \
  prisma \
  @prisma/client \
  decimal.js \
  date-fns \
  zod \
  @tanstack/react-table \
  recharts \
  next-auth \
  react-hook-form \
  @hookform/resolvers \
  lucide-react

# 3. Instalar dependências de desenvolvimento
npm install -D \
  @types/node \
  @types/react \
  @types/react-dom

# 4. Configurar shadcn/ui
echo "🎨 Configurando shadcn/ui..."
npx shadcn-ui@latest init -y

# 5. Adicionar componentes shadcn
echo "🧩 Instalando componentes UI..."
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add form
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add progress

# 6. Criar estrutura de pastas
echo "📁 Criando estrutura de pastas..."
mkdir -p app/{api,\(auth\),\(dashboard\)}
mkdir -p app/\(dashboard\)/{expenses,cards,installments,fixed-expenses,loans,lent-money,incomes,investments,reports,budget,categories,settings}
mkdir -p components/{ui,dashboard,expenses,cards,forms,charts,layout}
mkdir -p lib/{validations,utils,api,hooks}
mkdir -p types
mkdir -p prisma

# 7. Inicializar Prisma
echo "🗄️ Inicializando Prisma..."
npx prisma init

# 8. Criar arquivo .env.example
cat > .env.example << EOF
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/financeiro"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-um-secret-seguro-aqui"

# Crypto API (opcional)
COINGECKO_API_KEY=""
EOF

cp .env.example .env.local

# 9. Configurar Git
echo "🔧 Configurando Git..."
git init
git add .
git commit -m "chore: initial setup"

echo "✅ Setup concluído!"
echo ""
echo "📝 Próximos passos:"
echo "1. Edite o arquivo .env.local com suas credenciais"
echo "2. Configure o schema.prisma"
echo "3. Execute: npm run dev"
\`\`\`

---

### Script 2: Setup do Banco de Dados

\`\`\`bash
#!/bin/bash
# setup-database.sh

echo "🗄️ Configurando banco de dados..."

# 1. Verificar se PostgreSQL está rodando
if ! pg_isready -q; then
    echo "❌ PostgreSQL não está rodando!"
    echo "Inicie o PostgreSQL e tente novamente."
    exit 1
fi

# 2. Criar banco de dados
echo "📊 Criando banco de dados..."
createdb financeiro 2>/dev/null || echo "Banco já existe"

# 3. Executar migrations
echo "🔄 Executando migrations..."
npx prisma migrate dev --name init

# 4. Gerar Prisma Client
echo "⚙️ Gerando Prisma Client..."
npx prisma generate

# 5. Executar seed (se existir)
if [ -f prisma/seed.ts ]; then
    echo "🌱 Executando seed..."
    npx prisma db seed
fi

# 6. Abrir Prisma Studio
echo "🎨 Abrindo Prisma Studio..."
npx prisma studio

echo "✅ Banco de dados configurado!"
\`\`\`

---

### Script 3: Backup Automático

\`\`\`bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="financeiro"
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Fazer backup
echo "💾 Criando backup do banco de dados..."
pg_dump -U postgres $DB_NAME > $BACKUP_FILE

# Comprimir backup
gzip $BACKUP_FILE
echo "✅ Backup criado: ${BACKUP_FILE}.gz"

# Manter apenas últimos 30 backups
echo "🧹 Limpando backups antigos..."
ls -t $BACKUP_DIR/*.sql.gz | tail -n +31 | xargs -r rm

echo "✅ Backup concluído!"
\`\`\`

---

### Script 4: Deploy em Railway

\`\`\`bash
#!/bin/bash
# deploy-railway.sh

echo "🚀 Preparando deploy para Railway..."

# 1. Build do projeto
echo "🔨 Building..."
npm run build

# 2. Executar migrations em produção
echo "🗄️ Executando migrations..."
npx prisma migrate deploy

# 3. Deploy via Railway CLI
echo "📤 Fazendo deploy..."
railway up

echo "✅ Deploy concluído!"
echo "🌐 Acesse: https://seu-projeto.railway.app"
\`\`\`

---

## 📝 COMANDOS ÚTEIS

### Desenvolvimento
\`\`\`bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar em produção
npm start

# Lint
npm run lint

# Type check
npx tsc --noEmit
\`\`\`

### Prisma
\`\`\`bash
# Criar nova migration
npx prisma migrate dev --name nome-da-migration

# Executar migrations em produção
npx prisma migrate deploy

# Resetar banco de dados (CUIDADO!)
npx prisma migrate reset

# Gerar Prisma Client
npx prisma generate

# Abrir Prisma Studio (interface visual)
npx prisma studio

# Formatar schema.prisma
npx prisma format

# Validar schema
npx prisma validate
\`\`\`

### Git
\`\`\`bash
# Status
git status

# Adicionar todos os arquivos
git add .

# Commit com mensagem
git commit -m "feat: implementar cálculo de fatura"

# Push para repositório remoto
git push origin main

# Criar nova branch
git checkout -b feature/nome-da-feature

# Merge de branches
git merge feature/nome-da-feature
\`\`\`

### Backup
\`\`\`bash
# Fazer backup manual
./scripts/backup-database.sh

# Configurar backup automático diário (cron)
crontab -e
# Adicionar linha:
# 0 2 * * * /caminho/para/backup-database.sh
\`\`\`

---

## 🔐 SEGURANÇA - CHECKLIST

### Antes de ir para produção:
- [ ] Alterar NEXTAUTH_SECRET para valor seguro
- [ ] Usar variáveis de ambiente em produção (não .env.local)
- [ ] Habilitar HTTPS
- [ ] Configurar CORS corretamente
- [ ] Implementar rate limiting
- [ ] Validar TODOS os inputs (Zod)
- [ ] Usar Prepared Statements (Prisma faz isso automaticamente)
- [ ] Sanitizar inputs de usuário
- [ ] Implementar CSP (Content Security Policy)
- [ ] Configurar headers de segurança
- [ ] Fazer backup automático diário
- [ ] Configurar monitoramento de erros (Sentry)
- [ ] Testar vulnerabilidades (npm audit)
- [ ] Documentar APIs com Swagger/OpenAPI

---

## 📊 MONITORAMENTO

### Métricas a acompanhar:
1. **Performance**
   - Tempo de resposta das APIs
   - Tempo de carregamento das páginas
   - Core Web Vitals

2. **Erros**
   - Taxa de erro das APIs
   - Erros de cliente (JavaScript)
   - Erros de banco de dados

3. **Uso**
   - Usuários ativos
   - Despesas cadastradas por dia
   - Cartões mais usados

4. **Infraestrutura**
   - Uso de CPU
   - Uso de memória
   - Uso de disco
   - Tamanho do banco de dados

### Ferramentas recomendadas:
- **Sentry** - Monitoramento de erros
- **Vercel Analytics** - Analytics e Web Vitals
- **Prisma Pulse** - Monitoramento do banco
- **Grafana + Prometheus** - Métricas customizadas

---

## 🎓 RECURSOS PARA CONSULTA

### Documentação oficial:
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com/docs
- Recharts: https://recharts.org/en-US
- NextAuth.js: https://next-auth.js.org
- Zod: https://zod.dev
- React Hook Form: https://react-hook-form.com

### APIs externas:
- CoinGecko (crypto prices): https://www.coingecko.com/en/api
- IBGE (inflação IPCA): https://servicodados.ibge.gov.br/api/docs
- Banco Central (taxa Selic): https://www.bcb.gov.br/api

---

## ✅ PRÓXIMOS PASSOS RECOMENDADOS

1. **Imediato (hoje):**
   - [ ] Revisar especificação completa
   - [ ] Decidir hospedagem (Railway, Vercel, etc.)
   - [ ] Criar conta no serviço escolhido
   - [ ] Executar script de setup

2. **Curto prazo (esta semana):**
   - [ ] Configurar banco de dados
   - [ ] Implementar autenticação
   - [ ] CRUD de cartões

3. **Médio prazo (este mês):**
   - [ ] CRUD de despesas
   - [ ] Cálculo de faturas
   - [ ] Dashboard básico

4. **Longo prazo (próximos 3 meses):**
   - [ ] Todas as funcionalidades
   - [ ] Testes completos
   - [ ] Deploy em produção
   - [ ] Migração dos dados existentes

---

**Tudo pronto para começar! Qual o próximo passo? 🚀**
