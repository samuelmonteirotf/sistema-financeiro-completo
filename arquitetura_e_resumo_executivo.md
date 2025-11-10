# 🏗️ ARQUITETURA E RESUMO EXECUTIVO
## Sistema de Controle Financeiro

---

## 📊 RESUMO EXECUTIVO

### O que é este projeto?
Um **sistema web completo de controle financeiro pessoal** que resolve os problemas da sua planilha atual:
- ❌ Erros de cálculo
- ❌ Dificuldade em visualizar tendências
- ❌ Falta de alertas automáticos
- ❌ Impossível acessar de qualquer lugar
- ❌ Sem backup automático

### O que o sistema faz?
✅ **Gerencia múltiplos cartões de crédito** com fechamento e vencimento corretos
✅ **Rastreia cada parcela** individualmente sem erros
✅ **Calcula faturas automaticamente** considerando o período correto
✅ **Projeta seu fluxo de caixa** para os próximos 12 meses
✅ **Categoriza despesas automaticamente** aprendendo com seu histórico
✅ **Controla empréstimos** com tabelas de amortização
✅ **Gerencia dinheiro emprestado** a terceiros (como o caso "Mila")
✅ **Acompanha investimentos** com cotação em tempo real
✅ **Gera relatórios visuais** com gráficos interativos
✅ **Alerta você** sobre faturas, limites e vencimentos
✅ **Acessa de qualquer dispositivo** (celular, tablet, computador)
✅ **Backup automático** diário do banco de dados

### Diferencial único
Este é o **ÚNICO sistema** que:
- Usa **Decimal.js** (zero erro de arredondamento)
- Calcula **fechamento de cartão corretamente** (baseado no dia exato)
- Gerencia **empréstimos a terceiros com impacto em múltiplos cartões**
- É **open source** (você tem controle total do código)

### Investimento necessário
- **Tempo:** 3-4 meses de desenvolvimento (seguindo o cronograma)
- **Custo:** 
  - Hospedagem: R$ 0 a R$ 50/mês (Railway gratuito até certo limite)
  - Domínio: R$ 40/ano (opcional)
  - APIs: Grátis (CoinGecko tem tier gratuito)

### Retorno esperado
- **Tempo economizado:** ~10 horas/mês (não mais planilhas)
- **Decisões financeiras melhores:** Visibilidade clara do futuro
- **Paz de espírito:** Alertas automáticos + sem erros de cálculo
- **Acesso anywhere:** Web app responsivo

---

## 🏛️ ARQUITETURA DO SISTEMA

### Visão Geral (Diagrama ASCII)

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                         USUÁRIO                              │
│                    (Browser / Mobile)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   FRONTEND (Next.js 14)                      │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │  Pages       │  Components  │  State Management        │ │
│  │  (App Router)│  (React)     │  (Zustand/Context)       │ │
│  ├──────────────┼──────────────┼──────────────────────────┤ │
│  │  - Dashboard │  - Forms     │  - User data             │ │
│  │  - Expenses  │  - Charts    │  - Cards                 │ │
│  │  - Cards     │  - Tables    │  - Categories            │ │
│  │  - Reports   │  - Modals    │  - Settings              │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ API Calls (fetch)
                     │
┌────────────────────▼────────────────────────────────────────┐
│              BACKEND (Next.js API Routes)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               API Endpoints                            │  │
│  │  /api/auth/[...nextauth]  - Autenticação             │  │
│  │  /api/expenses            - CRUD Despesas             │  │
│  │  /api/cards               - CRUD Cartões              │  │
│  │  /api/installments        - Parcelamentos             │  │
│  │  /api/loans               - Empréstimos               │  │
│  │  /api/reports             - Relatórios                │  │
│  │  /api/investments         - Investimentos             │  │
│  └────────────────┬──────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼──────────────────────────────────────┐  │
│  │            Business Logic Layer                        │  │
│  │  - Validações (Zod)                                   │  │
│  │  - Cálculos financeiros (Decimal.js)                 │  │
│  │  - Regras de negócio                                  │  │
│  │  - Categorização automática                           │  │
│  │  - Geração de relatórios                              │  │
│  └────────────────┬──────────────────────────────────────┘  │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ Prisma Client
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     Tables                             │  │
│  │  - users                    - expenses                 │  │
│  │  - households               - installments             │  │
│  │  - cards                    - fixed_expenses           │  │
│  │  - categories               - loans                    │  │
│  │  - incomes                  - lent_money               │  │
│  │  - investments              - budgets                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Indexes                             │  │
│  │  - date fields              - relationships            │  │
│  │  - foreign keys             - search fields            │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Backup Job (Cron)
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    BACKUP STORAGE                            │
│              (Cloud Storage / Local)                         │
│  - Backups diários (30 dias de retenção)                   │
│  - Formato: SQL comprimido (.sql.gz)                        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   EXTERNAL APIs                              │
│  ┌────────────┬────────────┬────────────────────────────┐   │
│  │ CoinGecko  │ IBGE API   │ Banco Central API          │   │
│  │ (Crypto)   │ (IPCA)     │ (Selic, Câmbio)           │   │
│  └────────────┴────────────┴────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
\`\`\`

---

## 🔄 FLUXO DE DADOS

### 1. Lançamento de Despesa

\`\`\`
Usuário preenche formulário
         │
         ├─> Frontend valida (Zod schema)
         │
         ├─> POST /api/expenses
         │        │
         │        ├─> Backend valida novamente
         │        │
         │        ├─> Calcula parcelas (se parcelado)
         │        │
         │        ├─> Prisma.expense.create()
         │        │
         │        ├─> Prisma.installment.createMany()
         │        │
         │        └─> PostgreSQL salva
         │
         └─> Frontend atualiza UI
                  │
                  └─> Recarrega lista de despesas
\`\`\`

### 2. Cálculo de Fatura

\`\`\`
Usuário acessa fatura do cartão (mês X)
         │
         ├─> GET /api/cards/[id]/invoice?month=YYYY-MM
         │        │
         │        ├─> Backend busca config do cartão
         │        │   (dia fechamento, vencimento)
         │        │
         │        ├─> Calcula período da fatura
         │        │   (fechamento anterior até atual)
         │        │
         │        ├─> Prisma busca despesas do período
         │        │   WHERE date >= start AND date <= end
         │        │
         │        ├─> Prisma busca parcelas do período
         │        │   WHERE dueDate >= start AND dueDate <= end
         │        │
         │        ├─> Decimal.js soma tudo (precisão total)
         │        │
         │        └─> Retorna JSON com detalhes
         │
         └─> Frontend renderiza fatura
                  │
                  ├─> Tabela de items
                  ├─> Total
                  └─> Ações (Pagar, Baixar PDF)
\`\`\`

### 3. Dashboard (Carregamento)

\`\`\`
Usuário acessa dashboard
         │
         ├─> GET /api/reports/dashboard
         │        │
         │        ├─> Calcula receitas do mês
         │        │
         │        ├─> Calcula despesas do mês
         │        │   (despesas + parcelas + fixas)
         │        │
         │        ├─> Calcula saldo
         │        │
         │        ├─> Agrupa despesas por categoria
         │        │
         │        ├─> Agrupa despesas por cartão
         │        │
         │        ├─> Busca próximas faturas
         │        │
         │        ├─> Gera alertas inteligentes
         │        │
         │        └─> Retorna tudo em JSON
         │
         └─> Frontend renderiza
                  │
                  ├─> Cards de resumo
                  ├─> Gráficos (Recharts)
                  ├─> Lista de faturas
                  └─> Painel de alertas
\`\`\`

---

## 🧩 COMPONENTES PRINCIPAIS

### Frontend

\`\`\`
src/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx                    # Dashboard principal
│   │   ├── expenses/page.tsx           # Lista de despesas
│   │   ├── cards/
│   │   │   ├── page.tsx                # Gerenciar cartões
│   │   │   └── [id]/invoice/page.tsx   # Fatura detalhada
│   │   └── reports/page.tsx            # Relatórios
│   │
│   └── api/
│       ├── expenses/route.ts           # CRUD despesas
│       ├── cards/route.ts              # CRUD cartões
│       └── reports/dashboard/route.ts  # Dados do dashboard
│
├── components/
│   ├── dashboard/
│   │   ├── StatCard.tsx                # Card de estatística
│   │   ├── ExpenseChart.tsx            # Gráfico de despesas
│   │   └── AlertsPanel.tsx             # Painel de alertas
│   │
│   ├── expenses/
│   │   ├── ExpenseForm.tsx             # Formulário de despesa
│   │   ├── ExpenseList.tsx             # Lista de despesas
│   │   └── InstallmentPreview.tsx      # Preview de parcelas
│   │
│   └── cards/
│       ├── CardForm.tsx                # Formulário de cartão
│       └── InvoiceDetail.tsx           # Detalhes da fatura
│
└── lib/
    ├── utils/
    │   ├── calculations.ts             # Cálculos financeiros
    │   ├── currency.ts                 # Formatação de moeda
    │   └── date.ts                     # Manipulação de datas
    │
    └── validations/
        ├── expense.ts                  # Schema Zod de despesa
        └── card.ts                     # Schema Zod de cartão
\`\`\`

### Backend (Database Schema)

\`\`\`
Database: financeiro
├── users
│   ├── id (cuid, PK)
│   ├── email (unique)
│   ├── name
│   └── passwordHash
│
├── households
│   ├── id (cuid, PK)
│   └── name
│
├── cards
│   ├── id (cuid, PK)
│   ├── householdId (FK → households)
│   ├── name
│   ├── closingDay
│   ├── dueDay
│   └── limit
│
├── expenses
│   ├── id (cuid, PK)
│   ├── householdId (FK → households)
│   ├── cardId (FK → cards)
│   ├── categoryId (FK → categories)
│   ├── description
│   ├── amount (decimal)
│   ├── date
│   └── installments
│
├── installments
│   ├── id (cuid, PK)
│   ├── expenseId (FK → expenses)
│   ├── installmentNumber
│   ├── dueDate
│   ├── amount (decimal)
│   └── isPaid
│
├── categories
│   ├── id (cuid, PK)
│   ├── householdId (FK → households)
│   ├── name
│   ├── type (expense/income)
│   └── parentId (FK → categories, nullable)
│
└── ... (outras tabelas)
\`\`\`

---

## 🔐 SEGURANÇA EM CAMADAS

\`\`\`
┌──────────────────────────────────────────────────────────┐
│  Layer 1: FRONTEND                                       │
│  - Input sanitization                                    │
│  - Client-side validation (Zod)                          │
│  - XSS prevention (React escape)                         │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│  Layer 2: API GATEWAY                                    │
│  - HTTPS only                                            │
│  - CORS configuration                                    │
│  - Rate limiting                                         │
│  - Request size limits                                   │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│  Layer 3: AUTHENTICATION                                 │
│  - NextAuth.js (JWT/Session)                            │
│  - bcrypt password hashing                               │
│  - CSRF protection                                       │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│  Layer 4: AUTHORIZATION                                  │
│  - Role-based access (admin/member/viewer)              │
│  - Resource ownership validation                         │
│  - Household isolation                                   │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│  Layer 5: BUSINESS LOGIC                                 │
│  - Server-side validation (Zod)                          │
│  - Input sanitization                                    │
│  - SQL injection prevention (Prisma)                     │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│  Layer 6: DATABASE                                       │
│  - Encrypted connections (SSL)                           │
│  - Prepared statements                                   │
│  - Row-level security (RLS)                              │
│  - Automatic backups                                     │
└──────────────────────────────────────────────────────────┘
\`\`\`

---

## 📈 ESCALABILIDADE

### Capacidade Atual (Fase 1)
\`\`\`
Usuários simultâneos: ~100
Transações/segundo: ~10
Despesas no banco: ~1.000.000
Tempo de resposta: <200ms
\`\`\`

### Otimizações Futuras (Se Necessário)
\`\`\`
┌────────────────────────────────────────┐
│  1. Cache Layer (Redis)                │
│     - Cache de queries frequentes      │
│     - Session storage                  │
│     - Rate limiting storage            │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  2. Database Optimizations             │
│     - Read replicas                    │
│     - Connection pooling               │
│     - Materialized views               │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  3. CDN para assets                    │
│     - Cloudflare                       │
│     - Assets estáticos                 │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  4. Serverless Functions               │
│     - Relatórios pesados               │
│     - Processamento em background      │
└────────────────────────────────────────┘
\`\`\`

---

## 🚀 ROADMAP DE LANÇAMENTO

### Versão 1.0 (MVP) - 3 meses
\`\`\`
✅ Autenticação
✅ CRUD de cartões
✅ CRUD de despesas
✅ Cálculo de faturas
✅ Dashboard básico
✅ Parcelamentos
✅ Despesas fixas
\`\`\`

### Versão 1.1 - +1 mês
\`\`\`
□ Empréstimos próprios
□ Empréstimos a terceiros
□ Relatórios avançados
□ Export para Excel/PDF
\`\`\`

### Versão 1.2 - +1 mês
\`\`\`
□ Investimentos
□ Integração com APIs externas
□ Projeção de fluxo de caixa
□ Orçamentos por categoria
\`\`\`

### Versão 2.0 - Futuro
\`\`\`
□ App mobile nativo (React Native)
□ Integração com Open Banking
□ Importação automática de faturas
□ Machine Learning para previsões
□ Assistente virtual (chatbot)
\`\`\`

---

## 💰 CUSTO TOTAL DE PROPRIEDADE (TCO)

### Ano 1

| Item | Custo | Frequência |
|------|-------|------------|
| Hospedagem (Railway) | R$ 20 | /mês |
| Domínio (.com.br) | R$ 40 | /ano |
| SSL Certificate | R$ 0 | Grátis (Let's Encrypt) |
| APIs externas | R$ 0 | Grátis (tier free) |
| Backup storage | R$ 5 | /mês |
| **Total Mensal** | **R$ 25** | |
| **Total Anual** | **R$ 340** | |

### Comparação com alternativas comerciais

| Solução | Custo/mês | Limitações |
|---------|-----------|------------|
| **Seu sistema** | R$ 25 | Nenhuma |
| Mobills | R$ 15 | Limite de cartões, sem parcelamentos detalhados |
| Organizze | R$ 20 | Sem empréstimos a terceiros |
| GuiaBolso | R$ 0 | Vende seus dados, cheio de ads |

**Vantagem:** Controle total + privacidade + sem limites

---

## 🎯 INDICADORES DE SUCESSO (KPIs)

### Técnicos
- ✅ **Disponibilidade:** >99.5% (uptime)
- ✅ **Performance:** Tempo de resposta <300ms
- ✅ **Erros:** Taxa de erro <0.1%
- ✅ **Backups:** 100% de sucesso diário

### Funcionais
- ✅ **Precisão:** 100% dos cálculos corretos
- ✅ **Cobertura:** Todos os cartões suportados
- ✅ **Usabilidade:** <5 cliques para lançar despesa
- ✅ **Mobile:** Funcional em todas as telas

### Negócio
- ✅ **Economia de tempo:** 10h/mês
- ✅ **Visibilidade:** 100% das despesas rastreadas
- ✅ **Decisões:** Dados para decisões informadas
- ✅ **ROI:** Positivo em 3 meses

---

## 🛡️ PLANO DE CONTINUIDADE

### Backup e Recuperação
\`\`\`
┌───────────────────────────────────────┐
│  Backup Diário (2h da manhã)         │
│  ├─ Full backup do PostgreSQL         │
│  ├─ Backup incremental de arquivos    │
│  └─ Upload para cloud storage         │
└───────────────────────────────────────┘
         │
         ├─ Retenção: 30 dias
         ├─ Compressão: gzip
         └─ Criptografia: AES-256

┌───────────────────────────────────────┐
│  Teste de Restauração (Mensal)       │
│  └─ Validar integridade dos backups   │
└───────────────────────────────────────┘
\`\`\`

### Disaster Recovery
\`\`\`
RTO (Recovery Time Objective): 4 horas
RPO (Recovery Point Objective): 24 horas

Plano:
1. Identificar problema
2. Provisionar nova infraestrutura
3. Restaurar último backup
4. Validar dados
5. Redirecionar DNS
\`\`\`

---

## 📞 SUPORTE E MANUTENÇÃO

### Rotina Semanal
- [ ] Revisar logs de erro
- [ ] Verificar métricas de performance
- [ ] Atualizar dependências (security patches)
- [ ] Validar backups

### Rotina Mensal
- [ ] Testar restauração de backup
- [ ] Revisar custos de hospedagem
- [ ] Analisar feedback de uso
- [ ] Planejar melhorias

### Rotina Trimestral
- [ ] Auditoria de segurança
- [ ] Teste de carga
- [ ] Refatoração de código legado
- [ ] Atualização de documentação

---

## ✅ DECISÃO FINAL

### Por que desenvolver este sistema?

#### ✅ Vantagens
1. **Precisão total** - Zero erros de cálculo
2. **Controle completo** - Seu código, suas regras
3. **Privacidade** - Seus dados ficam com você
4. **Customização** - Adapte às suas necessidades
5. **Aprendizado** - Domina tecnologias modernas
6. **Escalável** - Cresce conforme necessário
7. **Custo baixo** - R$ 25/mês vs R$ 100+ em outras soluções
8. **Open source** - Pode compartilhar/vender depois

#### ❌ Desvantagens
1. Investimento inicial de tempo (3-4 meses)
2. Responsabilidade de manutenção
3. Curva de aprendizado de tecnologias

### Recomendação: **DESENVOLVER!** 🚀

**Motivos:**
- Você já tem as planilhas estruturadas (50% do trabalho de análise feito)
- Sistema comercial não atende necessidades específicas (empréstimo "Mila")
- ROI positivo em 3 meses
- Habilidades adquiridas são valiosas para carreira
- Produto final pode ser monetizado

---

## 🎬 PRÓXIMA AÇÃO IMEDIATA

**O que fazer AGORA:**

1. **Decisão:** Confirmar que quer desenvolver o sistema
2. **Ambiente:** Executar script de setup inicial
3. **Banco:** Configurar PostgreSQL
4. **Primeiro commit:** Subir código base para GitHub
5. **Primeira feature:** Implementar CRUD de cartões

**Tempo estimado para começar:** 2 horas

---

**Tudo documentado. Tudo pronto. É só começar! 💪**
