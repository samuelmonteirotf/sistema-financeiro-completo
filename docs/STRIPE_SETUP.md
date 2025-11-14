# Configuração do Stripe

## 1. Criar Conta no Stripe

1. Acesse https://dashboard.stripe.com/register
2. Cadastre sua conta (use email empresarial)
3. Ative o modo teste

## 2. Obter API Keys

1. Dashboard → Developers → API Keys
2. Copie:
   - Publishable key (pk_test_…)
   - Secret key (sk_test_…)
3. Adicione ao `.env`

## 3. Criar Produtos e Preços

1. Dashboard → Products → Add Product

**PLANO FREE**
- Nome: "Plano Free"
- Preço: R$ 0,00
- Recorrência: Mensal
- Não precisa de Price ID (é apenas referência para o frontend)

**PLANO PRO**
- Nome: "Plano Pro"
- Preços recomendados:
  - Mensal: R$ 49,00 (copiar Price ID → `STRIPE_PRICE_PRO_MONTHLY`)
  - Anual: valor com desconto no Stripe (copiar Price ID → `STRIPE_PRICE_PRO_ANNUAL`)
- Configure também USD e EUR se desejar vender em múltiplas moedas.

**PLANO PREMIUM**
- Nome: "Plano Premium"
- Preços recomendados:
  - Mensal: R$ 129,00 (copiar Price ID → `STRIPE_PRICE_PREMIUM_MONTHLY`)
  - Anual: valor com desconto no Stripe (copiar Price ID → `STRIPE_PRICE_PREMIUM_ANNUAL`)
- Habilite as moedas necessárias (BRL, USD, EUR) em cada price.

## 4. Configurar Webhook

### Desenvolvimento (Stripe CLI)

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Encaminhar webhooks para local
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copie o webhook secret (whsec_…) para o .env
```

### Produção

1. Dashboard → Developers → Webhooks
2. Add endpoint
3. URL: `https://seudominio.com/api/webhooks/stripe`
4. Events: selecione todos relacionados a:
   - `checkout.session`
   - `customer.subscription`
   - `invoice`
5. Copie o webhook secret e configure no `.env` de produção

## 5. Testar Webhook

```bash
# Terminal 1: rodar app
npm run dev

# Terminal 2: encaminhar webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: disparar evento de teste
stripe trigger checkout.session.completed
```

## 6. Cartões de Teste

- Sucesso: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Qualquer CVV e data futura
