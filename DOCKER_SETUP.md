# 🐳 Configuração do Docker Desktop com WSL2

## Passo 1: Habilitar Integração WSL2 no Docker Desktop

1. **Abra o Docker Desktop** no Windows
2. Vá em **Settings** (ícone de engrenagem)
3. Navegue até **Resources → WSL Integration**
4. **Habilite**:
   - ✅ "Enable integration with my default WSL distro"
   - ✅ Sua distribuição WSL2 (provavelmente Ubuntu)
5. Clique em **Apply & Restart**

## Passo 2: Verificar Instalação

Depois que o Docker Desktop reiniciar, execute no WSL2:

```bash
docker --version
docker compose version
```

Você deve ver as versões instaladas sem erros.

## Passo 3: Iniciar o PostgreSQL

No diretório do projeto (`/home/nexus/projects/controle-financeiro`), execute:

```bash
# Subir o PostgreSQL
docker compose up -d

# Verificar se está rodando
docker compose ps
```

Você verá:
- **postgres** rodando na porta 5432
- **adminer** (opcional) rodando na porta 8080 - interface web para administrar o banco

## Passo 4: Resetar Migrations do Prisma

```bash
# Remover migrations antigas (SQLite)
rm -rf prisma/migrations

# Criar nova migration para PostgreSQL
npx prisma migrate dev --name init

# Gerar o Prisma Client
npx prisma generate
```

## Passo 5: (Opcional) Popular com Dados de Teste

Se quiser criar um usuário de teste:

```bash
npx prisma db push
```

## Passo 6: Rodar o Projeto

```bash
# Instalar dependências (se necessário)
npm install

# Rodar em modo desenvolvimento
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🛠️ Comandos Úteis

### PostgreSQL
```bash
# Ver logs do PostgreSQL
docker compose logs -f postgres

# Parar o PostgreSQL
docker compose down

# Parar e remover volumes (APAGA DADOS!)
docker compose down -v

# Reiniciar PostgreSQL
docker compose restart postgres
```

### Adminer (Interface Web)
Acesse: **http://localhost:8080**
- **Server**: `postgres`
- **Username**: `postgres`
- **Password**: `postgres`
- **Database**: `controle_financeiro`

### Prisma
```bash
# Abrir Prisma Studio (interface visual do banco)
npx prisma studio

# Ver status das migrations
npx prisma migrate status

# Resetar banco (APAGA TODOS OS DADOS!)
npx prisma migrate reset
```

---

## 🔧 Troubleshooting

### Erro: "docker: command not found"
- Certifique-se de que habilitou a integração WSL2 no Docker Desktop (Passo 1)
- Reinicie o WSL2: `wsl --shutdown` no PowerShell, depois reabra o terminal

### Erro: "port 5432 already in use"
- Outra instância do PostgreSQL já está rodando
- Pare o serviço: `docker compose down`
- Ou mude a porta no `docker-compose.yml`

### Erro ao conectar no banco
- Verifique se o container está rodando: `docker compose ps`
- Verifique a URL no `.env`:
  ```
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/controle_financeiro?schema=public"
  ```

### Migrations não aplicam
```bash
# Force reset (CUIDADO: apaga dados)
npx prisma migrate reset --force

# Ou recrie do zero
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

---

## 📋 Checklist de Setup Completo

- [ ] Docker Desktop instalado e rodando
- [ ] Integração WSL2 habilitada
- [ ] `docker compose up -d` executado com sucesso
- [ ] Migrations criadas (`npx prisma migrate dev --name init`)
- [ ] Prisma Client gerado (`npx prisma generate`)
- [ ] `npm run dev` rodando sem erros
- [ ] Sistema acessível em http://localhost:3000

---

## 🎯 Próximos Passos

Depois que o sistema estiver rodando:

1. **Criar usuário de teste** via interface de registro
2. **Testar integração da Binance** na página de investimentos
3. **Adicionar criptomoedas** e ver os preços atualizando em tempo real
4. **Testar CRUD completo** (criar, listar, excluir investimentos)

**Observação**: Lembre-se que ainda existem itens críticos de segurança a serem implementados antes de ir para produção (autenticação real, etc).
