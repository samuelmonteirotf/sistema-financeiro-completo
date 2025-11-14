# Política de Anonimização e Conformidade LGPD

## Visão Geral

Este projeto utiliza dados **exclusivamente fictícios** durante desenvolvimento, testes e demonstrações. Toda a base é provisionada via Prisma + PostgreSQL com valores sintéticos gerados por scripts (faker.js) e nunca contém CPFs, RGs, e-mails ou tokens reais. A política segue os princípios estabelecidos pela **LGPD (Lei nº 13.709/2018)** — especialmente os Artigos 6º e 7º — e referências de governança da **ISO/IEC 27001**.

## Política de Anonimização

1. **Seeds e fixtures**: apenas dados aleatórios, nomes genéricos ou domínios `example.com`.
2. **Logs e tracing**: campos sensíveis são truncados (`[REDACTED]`) automaticamente quando detectados no diretório `logs/`.
3. **Variáveis secretas**: armazenadas somente em arquivos `.env.local`/`Secrets Manager` (nunca versionadas).
4. **Exportações**: qualquer dump gerado por desenvolvedores deve passar pelo script `npm run audit:lgpd` antes de ser compartilhado.

### Medidas Técnicas

- **faker.js** para criação de identidades sintéticas.
- **Hashing/bcrypt** de senhas mesmo em ambientes de teste.
- **Observabilidade sanitizada**: console/logs recebem apenas IDs ou hashes parciais.
- **Ferramenta de auditoria** (`scripts/auditoria-lgpd.ts`) escaneia o repositório em busca de CPFs, e-mails reais, chaves de API e tokens conhecidos.

## Direitos do Titular e Canal de Contato

- **Acesso, retificação, portabilidade e eliminação** podem ser solicitados via `privacidade@example.com`.
- Todas as solicitações são registradas no board interno de privacidade e respondidas em até 15 dias.

## Fluxo de Remoção de Dados

1. Titular envia requisição autenticada para `privacidade@example.com` ou via app.
2. O próprio usuário (ou operador autorizado) executa `DELETE /api/privacy/delete-data`. O endpoint recupera o `userId` autenticado via NextAuth, executa uma transação no Prisma e remove **todos** os registros relacionados (Expenses, Categories, Budgets, Loans, Investments, Subscription/Histórico e o próprio usuário).
3. O backend responde `{ success: true }` quando a operação for concluída.
4. Auditoria registra o ticket, gera comprovante para o titular e agenda purga definitiva em backups.

> **Nota:** `/api/privacy/delete-data` exige sessão autenticada e nunca aceita `userId` manual — elimina o risco de operadores removerem dados de terceiros.

## Consentimento para Analytics

- Um banner (`components/privacy/ConsentBanner.tsx`) é exibido no primeiro acesso solicitando consentimento explícito para coleta de métricas.
- A escolha é persistida em `localStorage.consent` (`"true"` ou `"false"`). O usuário pode alterar a decisão limpando o armazenamento local ou clicando novamente enquanto o banner estiver visível.
- `lib/analytics.tsx` carrega Google Analytics/Meta Pixel somente se `localStorage.consent === "true"`. Caso contrário, nenhum script externo de tracking é injetado.

## Checklist de Conformidade

- [x] ✅ Nenhum dado real em seeds ou fixtures
- [x] ✅ Variáveis sensíveis isoladas em `.env.local` e Secret Manager
- [x] ✅ Tokens mascarados automaticamente em logs (`[REDACTED]`)
- [x] ✅ Política de anonimização documentada neste arquivo
- [x] ✅ Endpoint de deleção automática (`DELETE /api/privacy/delete-data`)
- [x] ✅ Consentimento granular para analytics (bloqueio por padrão)
- [x] ✅ Script `npm run audit:lgpd` rodado em CI/CD antes de deploy

## Referências

- [LGPD – Lei nº 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [ISO/IEC 27001 – Information Security Management](https://www.iso.org/isoiec-27001-information-security.html)
