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
