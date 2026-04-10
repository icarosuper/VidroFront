# Workflow

Leia este doc para entender como o projeto é construído fase por fase, a estratégia de branches e o ciclo de trabalho após cada implementação.

## Escopo de edição

Você pode **ler** outros projetos no repositório (ex: `../Api/`) para entender contratos, tipos e endpoints. Mas **nunca edite** nada fora de `/home/icaro/Projetos/Vidro/FrontNovo/`. Se um endpoint da API estiver faltando dados necessários para o frontend, **informe o usuário** em vez de alterar o backend.

## Fases de implementação

O projeto é construído fase por fase. Planos detalhados em `docs/plans/`:

1. **Scaffold** — TanStack Start + shadcn + estrutura + api-client
2. **Auth** — signIn, signUp, signOut, renovação de token, proteção de rota
3. **Settings** — perfil do usuário, avatar
4. **Channel** — create/edit/delete, dashboard
5. **Home + Watch** — trending, feed, HLS player, reações
6. **Public channel/user pages** — SSR + SEO
7. **Upload** — presigned URL, progresso, polling de status
8. **Comments** — list, add, reply, edit, delete, reactions
9. **Playlists**

**Cada fase precisa ser entregue funcional.** Nada meio feito entre fases.

## Branching

- **Feature branches** — uma branch por fase ou grupo de features (ex: `feature/auth`, `feature/channels`), saindo de `master` e voltando via PR.
- **`master`** — sempre deployável.

## Working style — após cada passo

1. **Rodar testes relevantes.** `bun run test` após terminar uma feature. Corrigir falhas antes de prosseguir.
2. **Atualizar docs relevantes.** Reflita qualquer mudança de rota, API, ou design em:
   - `docs/plans/` — marcar tarefas como ✅
   - `docs/claude/features-index.md` — ao adicionar/remover endpoints, hooks ou componentes
   - `docs/claude/architecture.md` — ao mudar camadas, api-client, estratégia de renderização
   - `docs/claude/auth.md` — ao mexer em qualquer coisa de auth
   - `docs/claude/conventions.md` — só se uma convenção mudar (raro)
3. **Sugerir commit message em português.** O usuário revisa e commita manualmente.
4. **Mostrar próximos passos possíveis.** Lista breve para o usuário escolher o que implementar.

## Git commits

**NUNCA commite código sem pedido explícito do usuário.** Fluxo:

1. Implementar as mudanças
2. Rodar testes para verificar que passam
3. Mostrar ao usuário as mudanças e sugerir commit message (em português)
4. Esperar aprovação ou pedido explícito

O usuário decide quando e como commitar.

## Comandos frequentes

```bash
bun run dev                                 # http://localhost:3000
bun run build                               # build de produção
bun run test                                # todos os testes
bun run test src/tests/api-client.test.ts   # um arquivo específico
biome check                                 # lint
biome format                                # format
```
