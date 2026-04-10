# CLAUDE.md

Guia de navegação para o Claude Code neste repositório. Regras críticas ficam aqui; tudo o mais está em `docs/claude/`.

## Projeto

Reescrita do frontend do Vidro (plataforma de vídeo). Backend .NET em `../Api/` já está completo. Frontend construído incrementalmente, fase por fase.

## Regras sempre ativas

- **Idioma:** todo código em inglês (variáveis, funções, tipos, comentários, testes). **Commits em português.**
- **Escopo:** nunca edite arquivos fora deste diretório. Pode **ler** `../Api/` para entender contratos, mas nada de modificar. Se um endpoint estiver faltando algo, informe o usuário.
- **Endpoints da API:** antes de implementar um novo endpoint no frontend, **leia `../Api/docs/claude/features-index.md`** para confirmar o path exato, o arquivo fonte no backend (`src/VidroApi.Api/Features/...`) e o shape do request/response. Não adivinhe paths.
- **Commits:** **nunca commite sem pedido explícito.** Implementar → rodar testes → sugerir mensagem em português → esperar aprovação.
- **Sem `fetch` direto:** todo HTTP passa por `apiClient` (`src/shared/lib/api-client.ts`). Exceções: uploads presigned e `features/*/server.ts`.

## Comandos

```bash
bun run dev                                 # http://localhost:3000
bun run build
bun run test                                # todos
bun run test src/tests/api-client.test.ts   # um arquivo
biome check
biome format
```

## Stack resumida

TanStack Start (SSR seletivo, file-based routing) · TanStack Query · shadcn/ui + Tailwind v4 · bun · Biome · Vitest

`VITE_API_URL` → backend .NET (default `http://localhost:5000`)

## Onde ler o quê

Leia o doc **antes** de começar o tipo de tarefa descrito. Se pular, você vai infringir padrões que existem por um motivo.

- **[docs/claude/architecture.md](docs/claude/architecture.md)** — Leia antes de criar rotas, mexer em camadas, `apiClient`, tipos compartilhados ou providers no root. Cobre layout de `src/`, responsabilidades, regra do API client, estratégia de renderização, formatos de resposta da API, query keys.

- **[docs/claude/conventions.md](docs/claude/conventions.md)** — Leia antes de escrever qualquer código: legibilidade (variáveis nomeadas, ternários em 3 linhas, extração de funções), naming, layout de feature module, padrões de `api.ts`/`hooks.ts`, error handling, imports.

- **[docs/claude/auth.md](docs/claude/auth.md)** — Leia antes de mexer em sign in/up/out, proteção de rota, `tokenStore`, `renewToken`, ou qualquer coisa que toque SSR hydration. Cobre regra de ordem no sign out e o padrão do server snapshot em `useIsAuthenticated`.

- **[docs/claude/features-index.md](docs/claude/features-index.md)** — Leia antes de criar/mexer em uma feature, ou quando procurar "onde está o endpoint X / hook Y". Mapa de cada feature: arquivos, endpoints backend, hooks, tipos, componentes. **Atualize ao adicionar/remover endpoints, hooks ou componentes.**

- **[docs/claude/workflow.md](docs/claude/workflow.md)** — Leia antes de começar uma nova fase, criar branches, ou no final de cada passo de implementação. Cobre fases do projeto, branching, ciclo pós-implementação (testes → docs → commit sugerido → próximos passos).

- **[docs/plans/](docs/plans/)** — Planos detalhados por fase. Ver o plano da fase ativa antes de implementar; marcar tarefas como ✅ conforme concluídas.
