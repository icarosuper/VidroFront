# Conventions

Leia este doc antes de escrever componentes, hooks ou funções de API. Ele define os padrões não-óbvios que devem ser seguidos em todo o código.

## Idioma

- **Código em inglês:** variáveis, funções, tipos, comentários, nomes de testes.
- **Commits em português.**
- **Docs em `docs/`** podem ser em português.

## Legibilidade

### Variáveis nomeadas > expressões inline

Sempre atribua resultado de checks/expressões a uma variável com nome descritivo antes de usar em condição.

```ts
// ✅
const emailAlreadyTaken = users.some((u) => u.email === email)
if (emailAlreadyTaken) return { error: 'Email already in use' }

// ❌
if (users.some((u) => u.email === email)) return { error: 'Email already in use' }
```

### Extraia lógica complexa em funções

Se um bloco precisa de comentário para explicar o que faz, deve ser uma função com nome que explique.

### Nomes expressam intenção

O nome responde "o que", não "como". Evite abreviações, nomes de letra única (exceto loops) e nomes genéricos (`result`, `data`, `temp`).

### Ternários sempre em três linhas

Condição na primeira, `?` na segunda, `:` na terceira. Nunca em uma linha.

```ts
// ✅
const label = isAuthenticated
  ? 'Sign out'
  : 'Sign in'

// ❌
const label = isAuthenticated ? 'Sign out' : 'Sign in'
```

## Feature module layout

Toda feature em `src/features/<name>/` segue:

```
features/<name>/
├── api.ts              # fns que chamam apiClient. Uma fn por endpoint.
├── hooks.ts            # useQuery/useMutation/useInfiniteQuery consumindo api.ts
├── types.ts            # Request/Response/Summary/Entidade
├── server.ts           # (opcional) createServerFn para SSR ou httpOnly cookie
└── components/         # UI específica da feature
```

### Regras

- **Um `api.ts` nunca chama `fetch` diretamente** — sempre via `apiClient`, exceto uploads presigned (veja [architecture.md](architecture.md)).
- **Hooks só consomem `api.ts`**, não importam `apiClient` nem `fetch`.
- **Funções de api aceitam `signal?: AbortSignal`** e repassam. Isso permite cancelamento automático pelo React Query.
- **Request shapes** usam `id` numérico para enums (ex: `visibility: number`). **Response shapes** recebem `EnumValue`.
- **`*Summary`** é o tipo enxuto para listagens; **`Channel`/`Video`/etc.** é o detalhe completo.

### Exemplo: nova endpoint

```ts
// features/videos/api.ts
export function getVideo(videoId: string, signal?: AbortSignal) {
  return apiClient.get<Video>(`/v1/videos/${videoId}`, signal)
}

// features/videos/hooks.ts
export function useVideo(videoId: string) {
  return useQuery({
    queryKey: ['videos', videoId],
    queryFn: ({ signal }) => getVideo(videoId, signal),
  })
}
```

### Mutations + invalidação

Mutations invalidam as query keys afetadas **no `onSuccess`** e usam `toastApiError` no `onError`.

```ts
export function useUpdateVideo(videoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateVideoRequest) => updateVideo(videoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos', videoId] })
    },
    onError: toastApiError,
  })
}
```

## Query keys

Formato: `['resource-type', id, ...sub]`.

```ts
['videos', videoId]
['videos', 'trending']
['videos', 'feed']
['channels', handle]
['users', 'me']
['channels', channelId, 'videos']
```

Para keys usadas em múltiplos lugares, exporte um objeto `*Keys` (ex: `userKeys.me()` em `features/users/hooks.ts`).

## Error handling

- **Erros de API** sempre viram `ApiClientError { code, message, status }`.
- **Toasts:** use `toastApiError(error)` de `shared/lib/toast-error.ts`. Ele traduz `code` para mensagem user-facing via `error-messages.ts`.
- **Não use `try/catch` só pra toast** — passe `onError: toastApiError` no `useMutation`.
- **Códigos conhecidos** estão em `API_ERROR_CODES` (`shared/types.ts`). Se você reage a um código específico, importe dessa constante (não use string literal).

## Naming

| Tipo | Padrão | Exemplo |
|---|---|---|
| Hook | `useXxx` / `useXxxMutation` | `useVideo`, `useCreateChannel` |
| API fn | verbo + recurso | `getVideo`, `createChannel`, `uploadChannelAvatar` |
| Server fn | `serverXxx` ou verbo descritivo | `serverSignIn`, `getInitialToken`, `fetchVideoSsr` |
| Request type | `XxxRequest` | `CreateVideoRequest` |
| Response type | `XxxResponse` / entidade | `CreateVideoResponse`, `Video` |
| Summary type | `XxxSummary` | `VideoSummary`, `ChannelSummary` |
| Page type | `XxxPage` | `FeedPage`, `CommentsPage` |
| Enum mirror | const as const | `VideoStatus`, `ReactionType` |

## Componentes

- **shadcn/ui** em `src/components/ui/`. Customize por extensão, não editando os wrappers base.
- **Components de feature** ficam em `src/features/<name>/components/`. Componentes compartilhados entre features vão para `src/components/`.
- **Forms:** composição direta com componentes shadcn + `useState` + validação inline. Não introduza `react-hook-form` ou libs de form sem discussão.
- **Sem props drilling além de 2 níveis** — use context (ex: `AuthModalProvider`) quando for necessário.

## Imports

Usa alias `#/` para `src/`:

```ts
import { apiClient } from '#/shared/lib/api-client'
import { toastApiError } from '#/shared/lib/toast-error'
```

Ordem (Biome organiza automaticamente):
1. Libs externas
2. `#/shared/*`
3. `#/features/*`, `#/components/*`
4. Relativos (`./`)
