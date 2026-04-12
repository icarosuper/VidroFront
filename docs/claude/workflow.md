# Workflow

Leia doc: entender projeto fase por fase, estratégia branches, ciclo pós-implementação.

## Escopo de edição

Pode **ler** outros projetos (ex: `../Api/`) p/ entender contratos, tipos, endpoints. **Nunca edite** fora de `/home/icaro/Projetos/Vidro/FrontNovo/`. API faltar dados → **informe usuário**, não altere backend.

## Fases de implementação

Planos detalhados em `docs/plans/`:

1. ✅ **Scaffold** — TanStack Start + shadcn + estrutura + api-client
2. ✅ **Auth** — signIn, signUp, signOut, renovação de token, proteção de rota
3. ✅ **Settings** — perfil do usuário, avatar
4. ✅ **Channel** — create/edit/delete
5. ✅ **Home + Watch** — trending, feed, HLS player, reações
6. ✅ **Public channel/user pages** — SSR + SEO
7. ✅ **Upload** — presigned URL, progresso, polling de status
8. ✅ **Comments** — list, add, reply, edit, delete, reactions
9. **Playlists**

**Cada fase: entrega funcional.** Nada meio feito entre fases.

## Branching

- **Feature branches** — 1 branch por fase/grupo (ex: `feature/auth`, `feature/channels`), sai de `master`, volta via PR.
- **`master`** — sempre deployável.

## Working style — após cada passo

1. **Rodar testes.** `bun run test` pós-feature. Corrigir falhas antes de prosseguir.
2. **Atualizar docs.** Reflita mudanças em:
   - `docs/plans/` — marcar ✅
   - `docs/claude/features-index.md` — ao add/remover endpoints, hooks, componentes
   - `docs/claude/architecture.md` — ao mudar camadas, api-client, renderização
   - `docs/claude/auth.md` — qualquer mudança de auth
   - `docs/claude/conventions.md` — só se convenção mudar (raro)
3. **Sugerir commit message em português.** Usuário revisa e commita.
4. **Mostrar próximos passos.** Lista breve p/ usuário escolher.

## Git commits

**NUNCA commite sem pedido explícito.** Fluxo:

1. Implementar mudanças
2. Rodar testes
3. Mostrar mudanças + sugerir commit message (português)
4. Esperar aprovação

Usuário decide quando/como commitar.

## Comandos frequentes

```bash
bun run dev                                 # http://localhost:3000
bun run build                               # build de produção
bun run test                                # todos os testes
bun run test src/tests/api-client.test.ts   # um arquivo específico
biome check                                 # lint
biome format                                # format
```