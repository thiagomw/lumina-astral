<div align="center">

# ✦ Lumina Astral

**SaaS de mapa astral com cálculo astronômico real** — Sol, Lua, Ascendente,
planetas, casas e aspectos, calculados de verdade (não é texto genérico) a
partir de data, hora e local de nascimento.

Projeto pessoal construído do zero: produto, arquitetura, autenticação,
pagamentos e o motor de cálculo astrológico.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-checkout-635bff?logo=stripe)
![License](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

</div>

---

## 🔮 Sobre o projeto

O Lumina Astral é uma plataforma SaaS de mapa astral com uma proposta
diferente da maioria dos apps do gênero: em vez de texto genérico por signo,
o mapa é calculado com posições planetárias reais para a data, hora e local
de nascimento da pessoa — usando efemérides astronômicas, não templates.

O produto segue um modelo de assinatura por camadas: o plano gratuito libera
o essencial (Sol, Lua, Ascendente), e planos pagos desbloqueiam o mapa
completo (todos os planetas, casas e aspectos entre eles).

> Este é o **case #1** de uma série: aqui está a aplicação completa
> (produto + engenharia). O **case #2** vai documentar a jornada de DevOps —
> Docker, CI/CD e deploy em produção — ainda em andamento.

## ✨ Funcionalidades

- **Cálculo astrológico real**, não texto pré-pronto: Sol, Lua e mais 8
  planetas, Ascendente, Meio do Céu, casas (Whole Sign) e aspectos maiores
  entre planetas
- **Cadastro e login** com sessão segura (Auth.js / NextAuth v5)
- **Formulário de nascimento** com busca de cidade (geocoding) e resolução de
  fuso horário
- **Dashboard** com roda do mapa em SVG + lista de posições
- **Modelo de assinatura em 3 camadas** (Grátis / Essencial / Místico), com
  paywall aplicado tanto na API quanto na renderização — o plano gratuito
  não recebe no HTML nenhum dado que não deveria ver
- **Checkout e webhook do Stripe** prontos para produção (modo teste)
- **100% responsivo**, com identidade visual própria (jovem, mística, fluida)

## 🛠️ Stack técnica

| Camada          | Tecnologia                                      |
| --------------- | ------------------------------------------------ |
| Frontend         | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Autenticação     | NextAuth (Auth.js) v5, bcrypt                    |
| Banco de dados   | PostgreSQL + Prisma ORM                          |
| Pagamentos       | Stripe (Checkout + Webhooks)                     |
| Cálculo astral   | astronomy-engine (efemérides)                    |
| Geocoding        | OpenStreetMap / Nominatim                        |

## 🧠 O motor de cálculo astrológico

A parte mais interessante do projeto tecnicamente: `src/lib/astrologia.ts`
não usa nenhuma API de terceiros para gerar o mapa — o cálculo é feito
localmente a partir de efemérides astronômicas reais:

- Longitude eclíptica **geocêntrica aparente** de cada planeta (com correção
  de aberração), obtida via vetores geocêntricos — não heliocêntricos, um
  erro comum em implementações ingênuas
- **Ascendente e Meio do Céu** calculados via tempo sideral local + obliquidade
  da eclíptica, com a fórmula validada numericamente contra uma busca de raiz
  (root-finding) sobre altitude no horizonte
- **Casas** pelo sistema Whole Sign
- **Aspectos** maiores (conjunção, oposição, trígono, quadratura, sextil) com
  orbes configuráveis

## 🔐 Segurança

Escrito com boas práticas do mercado desde o início, não como camada extra:

- Senhas com hash **bcrypt** (custo 12), nunca em texto puro
- Validação de entrada com **Zod** em todas as rotas de API
- ORM com **queries parametrizadas** (Prisma) — sem superfície para SQL injection
- **Webhook do Stripe** valida a assinatura da requisição antes de processar
- Segredos apenas em variáveis de ambiente — nunca commitados (`.env` é
  ignorado; só o template `.env.example`, sem valores reais, é versionado)
- Rotas autenticadas protegidas por middleware de sessão
- Paywall reforçado no backend, não só na interface
- Headers de segurança (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`) e header `X-Powered-By` removido

## 🚀 Rodando localmente

### Pré-requisitos

- Node.js 20+
- Docker (para o Postgres local) — ou qualquer Postgres acessível (ex:
  [Neon](https://neon.tech), gratuito)

### Passo a passo

```bash
# 1. instalar dependências
npm install

# 2. subir o banco local (ou use uma connection string de outro Postgres)
docker compose up -d

# 3. configurar variáveis de ambiente
cp .env.example .env
# preencha DATABASE_URL e gere um AUTH_SECRET:
openssl rand -base64 32

# 4. aplicar as migrações
npx prisma migrate dev

# 5. rodar
npm run dev
```

Acesse [http://localhost:3001](http://localhost:3001).

As variáveis `STRIPE_*` podem ficar em branco — o checkout informa que os
pagamentos ainda não foram configurados até você adicionar chaves de teste
(veja a seção **Stripe** abaixo).

## 💳 Stripe (modo teste)

1. Crie uma conta em [dashboard.stripe.com](https://dashboard.stripe.com) e
   pegue as chaves de **teste** em `Developers > API keys`.
2. Crie dois produtos recorrentes (Essencial e Místico) e copie os `price_id`.
3. Preencha no `.env`: `STRIPE_SECRET_KEY`,
   `NEXT_PUBLIC_STRIPE_PRICE_ESSENCIAL`, `NEXT_PUBLIC_STRIPE_PRICE_MISTICO`.
4. Para testar o webhook localmente, use a Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```
   e copie o `whsec_...` gerado para `STRIPE_WEBHOOK_SECRET`.

## 🗺️ Estrutura de planos

| Plano      | O que libera                                     |
| ---------- | -------------------------------------------------- |
| Grátis     | Sol, Lua e Ascendente                              |
| Essencial  | + todos os planetas e as 12 casas                  |
| Místico    | + aspectos entre planetas e conteúdos exclusivos   |

## 📦 Scripts

```bash
npm run dev       # ambiente de desenvolvimento
npm run build     # build de produção
npm run lint      # eslint
npx prisma studio # explorar o banco visualmente
```

## 🧭 Roadmap

- [x] Produto completo: landing, auth, cálculo astral, dashboard, planos
- [x] Checkout e webhook Stripe (modo teste)
- [x] Containerização de produção (Docker multi-stage + docker-compose)
- [x] Deploy em VPS com domínio próprio e HTTPS (Let's Encrypt)
- [ ] **CI/CD** (em andamento): deploy automático via GitHub Actions a cada
      push — hoje ainda é manual via SSH
- [ ] Observabilidade, backup do banco e Stripe em modo produção

O passo a passo completo do deploy — incluindo os perrengues (disco cheio,
VPS compartilhada com outros projetos, etc.) — está documentado em
[`docs/deploy-journey.md`](docs/deploy-journey.md). É o "case #2" da
série: a jornada de DevOps.

---

<div align="center">

Feito por [Thiago Ribeiro](https://github.com/thiagomw) · projeto pessoal de
portfólio, sem fins comerciais.

</div>
