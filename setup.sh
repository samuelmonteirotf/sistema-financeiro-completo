#!/bin/bash

# Script de Setup Automatizado - Controle Financeiro
# Configura PostgreSQL com Docker e prepara o projeto

set -e

echo "🚀 Iniciando setup do Controle Financeiro..."
echo ""

# Verificar se Docker está disponível
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado!"
    echo "📋 Siga as instruções em DOCKER_SETUP.md para habilitar a integração WSL2"
    exit 1
fi

echo "✅ Docker encontrado: $(docker --version)"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "Instale o Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo ""

# Instalar dependências
echo "📦 Instalando dependências do npm..."
npm install
echo ""

# Subir PostgreSQL com Docker
echo "🐳 Iniciando PostgreSQL com Docker..."
docker compose up -d

# Aguardar PostgreSQL ficar pronto
echo "⏳ Aguardando PostgreSQL inicializar..."
sleep 5

# Verificar se PostgreSQL está rodando
if ! docker compose ps | grep -q "postgres.*Up"; then
    echo "❌ Erro ao iniciar PostgreSQL"
    echo "Execute: docker compose logs postgres"
    exit 1
fi

echo "✅ PostgreSQL rodando com sucesso"
echo ""

# Remover migrations antigas (SQLite)
if [ -d "prisma/migrations" ]; then
    echo "🗑️  Removendo migrations antigas..."
    rm -rf prisma/migrations
fi

# Criar migrations para PostgreSQL
echo "🔄 Criando migrations para PostgreSQL..."
npx prisma migrate dev --name init

# Gerar Prisma Client
echo "⚙️  Gerando Prisma Client..."
npx prisma generate

echo ""
echo "✅ Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Execute: npm run dev"
echo "   2. Acesse: http://localhost:3000"
echo "   3. Crie uma conta e teste a integração da Binance"
echo ""
echo "🛠️  Ferramentas disponíveis:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Adminer (Web UI): http://localhost:8080"
echo "   - Prisma Studio: npx prisma studio"
echo ""
echo "📖 Consulte DOCKER_SETUP.md para mais comandos úteis"
