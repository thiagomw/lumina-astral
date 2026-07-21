# Jornada de deploy — Lumina Astral em produção

Registro passo a passo de como a aplicação foi para o ar em
`https://luminastral.duckdns.org`. Este documento é o "case #2" citado no
README: a parte de DevOps do projeto, documentada à medida que foi feita.

## Contexto de partida

- Aplicação Next.js + Prisma/Postgres + NextAuth + Stripe, já funcionando em
  desenvolvimento local (porta 3001).
- Uma VPS na AWS (EC2, Ubuntu 26.04) já existente e em uso — **não dedicada**
  a este projeto: ela já hospeda outros três sites pessoais, cada um como um
  `server` block de nginx + certificado Let's Encrypt via certbot.
- Um domínio gratuito via DuckDNS (`luminastral.duckdns.org`) apontado para o
  IP da VPS.

Esse último ponto (VPS compartilhada) mudou a estratégia no meio do caminho —
detalhado no Passo 6.

## Passo 1 — Preparar o Next.js para rodar em container

Adicionado `output: "standalone"` em `next.config.ts`. Isso faz o
`next build` gerar, além do build normal, uma pasta `.next/standalone` com
só o necessário para rodar em produção (um `server.js` próprio + as
dependências realmente usadas em runtime) — sem precisar do `node_modules`
inteiro nem do código-fonte dentro da imagem final.

## Passo 2 — Dockerfile multi-stage

Um único `Dockerfile` com três estágios:

1. **deps** — instala as dependências (`npm ci`) num container isolado, para
   aproveitar cache do Docker: se o `package.json` não mudar, esse passo não
   roda de novo nos próximos builds.
2. **builder** — copia o código, roda `npx prisma generate` (gera o client
   do Prisma a partir do `schema.prisma`) e `npm run build`.
3. **runner** — a imagem final, enxuta: só copia `.next/standalone`,
   `.next/static` e `public` do estágio anterior. Roda como usuário não-root
   (`nextjs`, uid 1001) por segurança.

Motivo do multi-stage: a imagem final não carrega compilador, cache de
build nem dependências de desenvolvimento — só o que o servidor precisa para
rodar.

## Passo 3 — docker-compose de produção

Criado `docker-compose.prod.yml` com três serviços:

- **db**: Postgres 16, com `healthcheck` (`pg_isready`) para os outros
  serviços saberem quando o banco está realmente pronto, não só "no ar".
- **migrate**: usa o estágio `builder` da mesma imagem (que tem a CLI do
  Prisma) para rodar `npx prisma migrate deploy` — as migrações do banco —
  **uma vez**, antes da aplicação subir. Definido com
  `depends_on: db: condition: service_healthy` e `restart: "no"` (é uma
  tarefa que roda e termina, não um serviço contínuo).
- **app**: a imagem final (estágio `runner`), só sobe depois que o
  `migrate` terminar com sucesso (`condition: service_completed_successfully`).

Rodar migração como um serviço à parte (em vez de na inicialização do app)
evita condição de corrida quando há múltiplas réplicas do app subindo ao
mesmo tempo, e deixa explícito no compose qual é a ordem de dependência.

## Passo 4 — Variáveis de ambiente de produção

Criado um `.env.production` **direto na VPS** (nunca no Git — `.env*` já
está no `.gitignore`), com:

- Credenciais do Postgres geradas com `openssl rand -hex 24`.
- `AUTH_SECRET` gerado com `openssl rand -base64 32`.
- `DATABASE_URL` apontando para `db:5432` (o nome do serviço no compose,
  não `localhost` — dentro da rede do Docker Compose, os serviços se
  enxergam pelo nome).
- `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` apontando para
  `https://luminastral.duckdns.org`.
- Chaves do Stripe deixadas em branco por enquanto (produto funciona sem
  elas, só o checkout fica desativado até configurar).

## Passo 5 — Acesso SSH e Security Group da AWS

A porta 22 (SSH) não respondia de fora. Diagnóstico:

1. Testado o IP com `Test-NetConnection` — porta 80 respondia, porta 22 não.
   Isso descartou "servidor fora do ar" e apontou para firewall.
2. Confirmado que a VPS é AWS EC2: o controle de portas fica no
   **Security Group** da instância (console AWS → EC2 → Instances →
   Security → link do Security Group → Inbound rules).
3. A regra de SSH só liberava um IP específico (`/32`) — e esse IP era de
   uma sessão anterior, diferente do IP público atual (comum com internet
   residencial, que costuma ter IP dinâmico). Corrigido atualizando a
   regra para o IP público atual.

Lição: Security Group restrito por IP é mais seguro que abrir para
`0.0.0.0/0`, mas exige atualizar a regra sempre que o IP de quem acessa
mudar.

## Passo 6 — Descoberta: a VPS é compartilhada

Ao tentar subir um proxy reverso Caddy (para HTTPS automático) no
`docker-compose.prod.yml`, o container falhou:

```
failed to bind host port 0.0.0.0:80/tcp: address already in use
```

Investigando (`ss -tlnp`, `systemctl list-units`), a porta 80 já estava
ocupada por um **nginx rodando como serviço do sistema**, com configurações
em `/etc/nginx/sites-enabled/` para três outros domínios/projetos já
hospedados nessa mesma VPS.

Decisão: em vez de brigar pela porta 80/443 com um proxy reverso dentro do
Docker, seguir o mesmo padrão já usado pelos outros sites — a aplicação
Next.js expõe a porta 3001 **só em loopback**
(`127.0.0.1:3001:3001` no compose, não `0.0.0.0`), e o nginx do host é
quem faz o proxy reverso e termina o TLS, com um novo arquivo em
`/etc/nginx/sites-available/lumina-astral`.

Isso evitou duas coisas ruins: derrubar os outros sites, e ter dois
proxies reversos (Caddy + nginx) competindo pelas mesmas portas.

## Passo 7 — Espaço em disco esgotado durante o build

O primeiro `docker compose build` falhou no meio do `npm ci` com
`ENOSPC: no space left on device`. Diagnóstico:

```bash
df -h /            # 94% usado, só 451M livres
sudo du -h -d 1 /   # /usr (3.2G) e /var (1.5G) eram os maiores
lsblk               # disco de 8G no total, já todo particionado
```

Limpar cache (`docker builder prune`, `apt-get clean`, `journalctl
--vacuum-size`) liberou algo, mas o problema de fundo era o **volume EBS
de 8GB**, quase todo consumido só pelo sistema operacional — não dava para
compilar uma aplicação Next.js (com `node_modules` e build do TypeScript)
nesse espaço.

Solução definitiva: aumentar o volume no console AWS (EC2 → Volumes →
Modify volume → 25 GiB) e, sem precisar desligar a instância, estender a
partição e o filesystem por SSH:

```bash
sudo growpart /dev/nvme0n1 1     # estende a partição para o novo espaço
sudo resize2fs /dev/nvme0n1p1    # estende o filesystem ext4
```

Modificar um volume EBS na AWS é uma operação *online*: o novo tamanho
aparece para o sistema operacional em segundos, mas a partição e o
filesystem continuam do tamanho antigo até serem estendidos manualmente.

## Passo 8 — Um detalhe bobo: pasta `public` vazia

Segundo erro de build, depois do disco resolvido:

```
COPY --from=builder /app/public ./public
ERROR: ... "/app/public": not found
```

A pasta `public/` existia localmente mas estava vazia — e o Git **não
versiona pastas vazias**, então ela simplesmente não existia no clone feito
na VPS. Resolvido adicionando um arquivo `public/.gitkeep` (convenção comum
para forçar o Git a rastrear uma pasta sem conteúdo real).

## Passo 9 — Instalar Docker na VPS

Seguido o processo oficial da Docker para Ubuntu: adicionar o repositório
apt da Docker (com a chave GPG deles) e instalar `docker-ce`,
`docker-ce-cli`, `containerd.io`, `docker-buildx-plugin` e
`docker-compose-plugin`. O usuário `ubuntu` foi adicionado ao grupo
`docker` para rodar comandos sem precisar de `sudo` (efeito só a partir de
uma nova sessão SSH).

## Passo 10 — Build, migração e subida

```bash
git clone https://github.com/thiagomw/lumina-astral.git
cd lumina-astral
sudo docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Isso builda as imagens (`migrate` e `app`), sobe o Postgres, espera ele
ficar saudável, roda as migrações uma vez, e só então sobe a aplicação.

## Passo 11 — nginx + certbot para o domínio

Criado `/etc/nginx/sites-available/lumina-astral` com um proxy simples
para `http://127.0.0.1:3001`, habilitado com um link simbólico em
`sites-enabled/`, e emitido o certificado com:

```bash
sudo certbot --nginx -d luminastral.duckdns.org --redirect
```

O certbot edita automaticamente o arquivo de configuração do nginx,
adicionando os blocos de `listen 443 ssl`, os caminhos do certificado, e o
redirecionamento de HTTP para HTTPS. A renovação automática já fica
agendada (os certificados Let's Encrypt duram 90 dias).

## Passo 12 — Verificação final

```bash
curl -I https://luminastral.duckdns.org/
```

Retornou `HTTP/1.1 200 OK` com os headers de segurança definidos em
`next.config.ts` (`X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy`) presentes na resposta.

## O que ainda falta (próximos casos)

### CI/CD (próximo)

- GitHub Actions builda a imagem Docker a cada push na `master` e publica
  num registry (GHCR) — o build acontece fora da VPS, que só faz `pull` +
  restart. Importante: hoje o build é feito na própria VPS via SSH, e foi
  justamente isso que esgotou o disco no Passo 7 — buildar fora do host
  evita repetir esse problema.
- Chave SSH e variáveis de ambiente de produção guardadas como *secrets* do
  GitHub Actions, nunca hardcoded no workflow.

### Observabilidade

- Logs estruturados, um endpoint de healthcheck exposto, e
  [Uptime Kuma](https://github.com/louislam/uptime-kuma) para monitoramento
  externo. Prometheus/Grafana fica como próximo passo *se* houver
  necessidade real de métricas mais profundas — não faz sentido simular um
  setup enterprise para um projeto desse tamanho.
- Rotação de log do Docker (`max-size`/`max-file`): sem isso, logs sem
  rotação são só mais uma forma de encher o disco de novo — o mesmo modo de
  falha do Passo 7.
- Backup do Postgres: hoje os dados vivem só no volume Docker da VPS, sem
  rotina de backup.
- Stripe em modo produção: as chaves ainda estão em teste/vazias.

### Infraestrutura como código — migração para uma VPS dedicada

A VPS usada neste deploy é compartilhada com outros três projetos pessoais
(ver Passo 6) — por isso o próximo salto de infraestrutura não mexe nela,
e sim provisiona uma **VPS nova, dedicada só ao Lumina Astral**:

- **Terraform** provisiona a VPS do zero (instância, disco, regras de
  firewall) como código versionado.
- **cloud-init**, rodando na criação da máquina, instala Docker, cria um
  usuário non-root e configura firewall básico (`ufw`) — e já desabilita
  login SSH por senha (só por chave), já que o Terraform gerencia o par de
  chaves de qualquer forma.
- Sem Ansible: para um host único, cloud-init + Docker Compose já cobre o
  que seria necessário de um config management — Ansible entraria se
  houvesse múltiplos hosts para manter consistentes.
- **Caddy** como reverse proxy com HTTPS automático — nesta VPS nova isso
  funciona bem, ao contrário da VPS atual, onde o Caddy chegou a ser
  cogitado e descartado por brigar com o nginx que já rodava lá (Passo 6).
- `terraform.tfstate` fica fora do Git (`.gitignore`) mesmo sem backend
  remoto configurado, já que o repositório é público.
- Corte final: quando a VPS nova estiver no ar, repontar o domínio DuckDNS
  para o novo IP e só então desligar a aplicação na VPS antiga.
