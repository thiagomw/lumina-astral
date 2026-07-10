# ✦ Lumina Astral

Plataforma SaaS de mapa astral — cálculo astronômico real (Sol, Lua,
Ascendente, planetas, casas e aspectos), com cadastro/login e planos pagos.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **astronomy-engine** para o cálculo real das posições planetárias
- **PostgreSQL + Prisma** para dados de usuários, perfis natais e assinaturas
- **NextAuth (Auth.js) v5** com login por email/senha
- **Stripe** (modo teste) para os planos pagos

## Rodando localmente

### 1. Pré-requisitos

- Node.js 20+
- Docker (para o Postgres local) — ou um Postgres já rodando em outro lugar

### 2. Instalar dependências

```bash
npm install
```

### 3. Subir o banco de dados

```bash
docker compose up -d
```

Isso sobe um Postgres local na porta `5432` com as credenciais já usadas no
`.env.example`.

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Gere um `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Cole o valor gerado em `AUTH_SECRET` no `.env`.

As variáveis `STRIPE_*` podem ficar em branco por enquanto — o checkout
simplesmente informa que os pagamentos ainda não foram configurados até você
adicionar suas chaves de teste do Stripe (veja a seção **Stripe** abaixo).

### 5. Rodar as migrações do Prisma

```bash
npx prisma migrate dev --name init
```

### 6. Rodar o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura de planos

Definida em `src/lib/planos.ts` e refletida no enum `Plan` do Prisma:

| Plano      | O que libera                                          |
| ---------- | ------------------------------------------------------ |
| Grátis     | Sol, Lua e Ascendente                                  |
| Essencial  | + todos os planetas e as 12 casas                      |
| Místico    | + aspectos entre planetas e conteúdos exclusivos       |

O gating acontece tanto na lista de posições (`PlacementsList`) quanto na roda
visual do mapa (`ChartWheel`) — usuários do plano Grátis não recebem no HTML
nenhum dado dos planetas bloqueados.

## Stripe (modo teste)

1. Crie uma conta em [dashboard.stripe.com](https://dashboard.stripe.com) e
   pegue as chaves de **teste** em `Developers > API keys`.
2. Crie dois produtos recorrentes (Essencial e Místico) e copie os `price_id`
   de cada um.
3. Preencha no `.env`:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PRICE_ESSENCIAL`
   - `NEXT_PUBLIC_STRIPE_PRICE_MISTICO`
4. Para testar o webhook localmente, use a Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   e copie o `whsec_...` gerado para `STRIPE_WEBHOOK_SECRET`.

Sem essas variáveis, os botões de assinatura mostram uma mensagem explicando
que o checkout ainda não foi configurado — nada quebra.

## Cálculo do mapa astral

`src/lib/astrologia.ts` calcula, a partir de data/hora/local de nascimento:

- Longitude eclíptica geocêntrica de cada planeta (Sol a Plutão)
- Ascendente e Meio do Céu (fórmulas validadas numericamente por
  interpolação de altitude no horizonte)
- Casas pelo sistema **Whole Sign** (signo inteiro)
- Aspectos maiores (conjunção, oposição, trígono, quadratura, sextil)

O fuso horário de nascimento é informado manualmente no formulário (não há
geolocalização automática de fuso histórico); a busca de cidade usa a API
pública do OpenStreetMap/Nominatim.

## Scripts úteis

```bash
npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção
npm run lint     # eslint
npx prisma studio # explorar o banco visualmente
```

## Próximos passos (deploy / DevOps)

Este README cobre apenas o ambiente local. A hospedagem (VPS, Docker em
produção, CI/CD, domínio, HTTPS etc.) será tratada em uma etapa separada.
