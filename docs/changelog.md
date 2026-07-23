# Changelog — registro de mudanças

Log cronológico de mudanças menores que não justificam um documento
próprio. Trabalhos maiores continuam com seu próprio arquivo (ver
`docs/deploy-journey.md` e `docs/seo.md`).

## 2026-07-23 — Hardening do .gitignore

**O que foi feito**: revisão de tudo que estava versionado no repositório
em busca de arquivos que não deveriam ser públicos.

- Encontrado: `.claude/settings.local.json` estava commitado — é
  configuração local do Claude Code (permissões específicas desta
  máquina/sessão), equivalente a um `.env.local`: não é do time, não
  precisa estar no repositório. Removido do controle de versão com
  `git rm --cached` (o arquivo continua no disco, só parou de ser
  rastreado).
- Adicionado ao `.gitignore`, de forma preventiva (nada disso existia
  ainda no repo, mas evita que apareça sem querer no futuro):
  - `*.key` — chaves SSH soltas (além do `*.pem` que já existia)
  - `*.tfstate`, `*.tfstate.*`, `.terraform/` — quando o Terraform entrar
    no roadmap (ver `docs/deploy-journey.md`), o state nunca deve ir pro
    Git, mesmo sem backend remoto configurado
  - `.vscode/`, `.idea/` — configuração de editor é pessoal, não do time
  - `*.swp`, `*.swo`, `*~` — arquivos temporários de editor
  - `*.log`, `Thumbs.db`, `desktop.ini` — lixo de sistema operacional/log
    genérico

**Por quê**: pedido direto do usuário para revisar o repositório inteiro e
garantir que nada que "as pessoas não podem e não precisam ver" ficasse
público, não só reagir a um caso pontual.

## 2026-07-23 — VPS sobrecarregada e build do `migrate` quebrado

**Contexto**: ao publicar a correção das variáveis `NEXT_PUBLIC_*` (ver
`docs/seo.md`), o deploy travou a VPS inteira.

**O que aconteceu**:

1. `docker compose up -d --build` builda `migrate` e `app` **em paralelo**
   por padrão. Como os dois usavam o mesmo estágio `builder` (que roda um
   `next build` completo — TypeScript + bundler), isso significava compilar
   a aplicação inteira **duas vezes ao mesmo tempo** numa VPS com ~900MB de
   RAM. Resultado: swap 100% cheio, load average acima de 11, e a própria
   VPS parou de aceitar novas conexões SSH — derrubando de tabela os
   outros 3 sites hospedados nela (recuperaram sozinhos depois).
2. Depois de estabilizar, o build ainda falhava com
   `ERR_INVALID_URL (input: '')`. Causa: `NEXT_PUBLIC_APP_URL` só era
   passado como build arg pro serviço `app`, não pro `migrate` (que usa o
   mesmo Dockerfile/estágio). Sem o arg, a variável vira uma **string
   vazia** dentro do container — não `undefined`. O fallback usava `??`
   (nullish coalescing), que só cai pro valor padrão em `null`/`undefined`,
   não em string vazia — então `new URL("")` explodia.

**Correções**:

- Trocado `??` por `||` em todo lugar que lê `NEXT_PUBLIC_APP_URL` — cobre
  o caso de string vazia também, não só ausência da variável.
- Criado um estágio `migrator` novo no Dockerfile, enxuto: só instala
  dependências e roda `prisma generate` — **sem** `next build`. O serviço
  `migrate` não precisa da aplicação compilada, só da CLI do Prisma e do
  schema, então não faz sentido pagar o custo (tempo + RAM) de compilar o
  Next.js pra isso. Build do `migrate` caiu de ~90s para ~11s.

**Lição pro roadmap**: isso reforça o item de CI/CD já planejado (ver
`docs/deploy-journey.md`) — buildar fora dessa VPS pequena evita esse tipo
de sobrecarga por completo, já que ela só precisaria fazer `pull` de uma
imagem pronta.
