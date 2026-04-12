# CLAUDE.md

Guia nav Claude Code repo. Regras críticas aqui; resto em `docs/claude/`.

## Projeto

Reescrita frontend Vidro (plataforma vídeo). Backend .NET `../Api/` completo. Frontend construído incremental, fase a fase.

## Regras sempre ativas

- **Idioma:** todo código inglês (vars, funções, tipos, comentários, testes). **Commits português.**
- **Escopo:** nunca edite arquivos fora dir. Pode **ler** `../Api/` p/ entender contratos, não modificar. Endpoint faltando algo → informe usuário.
- **Endpoints da API:** antes implementar endpoint frontend, **leia `../Api/docs/claude/features-index.md`** p/ confirmar path exato, arquivo fonte backend (`src/VidroApi.Api/Features/...`) e shape request/response. Não adivinhe paths.
- **Commits:** **nunca commite sem pedido explícito.** Implementar → rodar testes → sugerir mensagem português → esperar aprovação.
- **Sem `fetch` direto:** todo HTTP via `apiClient` (`src/shared/lib/api-client.ts`). Exceções: uploads presigned e `features/*/server.ts`.

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

Leia doc **antes** tarefa descrita. Pular → infringir padrões que existem por motivo.

- **[docs/claude/architecture.md](docs/claude/architecture.md)** — Antes criar rotas, mexer camadas, `apiClient`, tipos compartilhados ou providers root. Cobre layout `src/`, responsabilidades, regra API client, estratégia renderização, formatos resposta API, query keys.

- **[docs/claude/conventions.md](docs/claude/conventions.md)** — Antes escrever qualquer código: legibilidade (vars nomeadas, ternários 3 linhas, extração funções), naming, layout feature module, padrões `api.ts`/`hooks.ts`, error handling, imports.

- **[docs/claude/auth.md](docs/claude/auth.md)** — Antes mexer sign in/up/out, proteção rota, `tokenStore`, `renewToken`, ou qualquer coisa SSR hydration. Cobre regra ordem sign out e padrão server snapshot em `useIsAuthenticated`.

- **[docs/claude/features-index.md](docs/claude/features-index.md)** — Antes criar/mexer feature, ou buscar "onde está endpoint X / hook Y". Mapa cada feature: arquivos, endpoints backend, hooks, tipos, componentes. **Atualize ao add/remover endpoints, hooks ou componentes.**

- **[docs/claude/workflow.md](docs/claude/workflow.md)** — Antes nova fase, criar branches, ou fim de cada passo implementação. Cobre fases projeto, branching, ciclo pós-implementação (testes → docs → commit sugerido → próximos passos).

- **[docs/plans/](docs/plans/)** — Planos detalhados por fase. Ver plano fase ativa antes implementar; marcar tarefas ✅ conforme concluídas.