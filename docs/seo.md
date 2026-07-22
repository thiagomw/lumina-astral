# SEO — preparando o Lumina Astral para aparecer no Google

Registro do que foi feito para o site ser indexável e compartilhável
corretamente, e por quê.

## Contexto de partida

O `layout.tsx` só tinha um `title` e `description` genéricos, aplicados a
todas as páginas por igual. Não havia `robots.txt`, `sitemap.xml`, imagem
de Open Graph, nem sinalização de quais páginas são públicas e quais são
privadas (dashboard, login, cadastro).

## Passo 1 — Metadata base no layout raiz

Em `src/app/layout.tsx`:

- `metadataBase`: define a URL canônica (`NEXT_PUBLIC_APP_URL`, com fallback
  para `localhost:3001`) usada para resolver toda URL relativa em metadata
  (Open Graph, sitemap, etc.) — sem isso, o Next.js gera avisos e pode
  montar URLs erradas em produção.
- `title` com `template: "%s · Lumina Astral"`: páginas internas só
  precisam declarar o próprio título (`"Planos e preços"`) e o Next.js
  monta `"Planos e preços · Lumina Astral"` sozinho.
- `description`, `keywords`, `openGraph` e `twitter` (card
  `summary_large_image`) preenchidos com o texto real do produto — antes só
  existia o básico.
- `robots: { index: true, follow: true }` como padrão global, sobrescrito
  por página onde fizer sentido (ver Passo 4).

## Passo 2 — Imagem de Open Graph dinâmica

Criado `src/app/opengraph-image.tsx` usando a convenção de arquivo especial
do Next.js (`ImageResponse` do pacote `next/og`). Isso gera automaticamente
a imagem que aparece quando o link é compartilhado no WhatsApp, Twitter/X,
LinkedIn, etc., sem precisar desenhar um PNG estático à mão.

**Detalhe que quebrou na primeira tentativa**: o design original incluía o
símbolo `✦` (usado no logo do site). O motor que renderiza essa imagem
(satori) tenta buscar dinamicamente, via rede, a fonte de qualquer glifo
fora do alfabeto latino básico — e essa busca falhou no build
(`Failed to download dynamic font. Status: 400`). Como essa API externa
pode falhar de novo (rede instável, rate limit, etc.), e o site não deveria
depender disso pra gerar uma imagem, o símbolo foi removido da imagem OG —
ela usa só texto simples, sem glifos especiais.

## Passo 3 — `robots.ts` e `sitemap.ts`

Também usando convenções de arquivo do Next.js (`src/app/robots.ts` e
`src/app/sitemap.ts`), que geram `/robots.txt` e `/sitemap.xml` a partir de
código TypeScript, em vez de arquivos estáticos escritos à mão:

- `robots.ts`: libera tudo (`/`) exceto `/dashboard` e `/api` — área
  logada e rotas de API não têm por que ser rastreadas por um buscador.
- `sitemap.ts`: lista só as páginas realmente públicas e com conteúdo
  próprio — `/` (prioridade 1) e `/planos` (prioridade 0.8).

## Passo 4 — `noindex` nas páginas sem valor de busca

Login, cadastro e dashboard **não** entram no sitemap e recebem
`robots: { index: false }` na própria metadata da página:

- `/login` e `/cadastro`: só têm um formulário, sem conteúdo único — prática
  comum é não indexar para não competir com a própria home nem gerar
  conteúdo "fino" (thin content) no Google. Mantido `follow: true` porque
  não custa nada deixar os links seguidos.
- `/dashboard/*`: área privada, atrás de login. Marcado
  `index: false, follow: false` na metadata **e** bloqueado no
  `robots.txt` — dupla proteção, já que o robots.txt impede o rastreamento
  (o buscador nem chega a ver a página), e a metadata cobre o caso de a URL
  ser descoberta por outro caminho (ex: alguém compartilhando o link).

## Passo 5 — Dados estruturados (JSON-LD)

Adicionado um bloco `<script type="application/ld+json">` na home
(`src/app/page.tsx`) com schema.org `Organization` + `WebSite`. Isso ajuda
buscadores a entender "quem" é o site (nome, URL) de forma estruturada, o
que pode habilitar exibições mais ricas nos resultados de busca. Mantido
simples de propósito — nada de `SoftwareApplication` ou dados de preço
via JSON-LD por enquanto, para não declarar algo que não temos certeza que
o Google vai validar corretamente sem mais testes.

## Verificação

```bash
npm run build   # build limpo, sem o warning da fonte dinâmica
npm run start
curl http://localhost:3001/robots.txt
curl http://localhost:3001/sitemap.xml
curl -o og.png http://localhost:3001/opengraph-image   # inspecionado visualmente
```

Rotas confirmadas no build: `/opengraph-image`, `/robots.txt` e
`/sitemap.xml` aparecem como estáticas (`○`) na saída do `next build`.

## O que ainda falta

- Enviar o site ao **Google Search Console** e submeter o `sitemap.xml`
  manualmente (isso não dá pra automatizar do lado do código — é uma ação
  no painel do Google, feita uma vez).
- Validar o rich result do JSON-LD na
  [ferramenta de teste do Google](https://search.google.com/test/rich-results)
  depois do deploy.
- Se o domínio mudar de `luminastral.duckdns.org` para um domínio próprio
  no futuro (ver `docs/deploy-journey.md`), atualizar `NEXT_PUBLIC_APP_URL`
  e reenviar o sitemap no Search Console — um domínio novo é tratado como
  site novo aos olhos do Google.
