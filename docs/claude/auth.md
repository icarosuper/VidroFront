# Auth

Leia este doc antes de mexer em sign in/sign up/sign out, protection de rota, ou qualquer código que toque `tokenStore`, `renewToken`, `apiClient` 401 handling ou SSR hydration.

## Modelo

- **Access token** vive **somente em memória** (`src/shared/lib/token-store.ts`). Nunca em `localStorage`, nunca em cookie acessível ao JS.
- **Refresh token** vive em **cookie httpOnly** (`vid_rt`, 30 dias). Manipulado exclusivamente por server functions em `features/auth/server.ts`.
- **401 handling:** `apiClient` intercepta → chama `renewTokenCallback` → grava novo token → retry único. Se falhar, limpa o token e lança `ApiClientError`.
- **Rotas protegidas** usam `beforeLoad` para redirecionar ao `/` com modal de login quando não há sessão.
- **Rotas SSR autenticadas** recebem o `accessToken` via router context do `__root.tsx` (sem waterfall).

## Arquivos relevantes

| Arquivo | Papel |
|---|---|
| `src/shared/lib/token-store.ts` | Store em memória com `subscribe` para `useSyncExternalStore` |
| `src/shared/lib/api-client.ts` | Renew + retry em 401, `setRenewTokenCallback` |
| `src/features/auth/server.ts` | `serverSignIn`, `serverSignUp`, `serverSignOut`, `renewToken`, `getInitialToken` |
| `src/features/auth/hooks.tsx` | `AuthProvider`, `AuthModalProvider`, `useIsAuthenticated`, `useSignIn/Up/Out`, `useAuthModal` |
| `src/routes/__root.tsx` | Loader SSR que resolve token inicial + hidratação client |

## Server functions (auth/server.ts)

Todas usam `createServerFn` do `@tanstack/react-start`.

| Função | Método | O que faz |
|---|---|---|
| `serverSignUp` | POST | Cadastra; não retorna token |
| `serverSignIn` | POST | Autentica, grava cookie refresh, retorna access token |
| `serverSignOut` | POST | Revoga refresh no backend, deleta cookie |
| `renewToken` | POST | Usa cookie refresh → novo access token + rotaciona refresh |
| `getInitialToken` | GET | Chamada no loader do `__root`; retorna access token inicial se houver refresh válido, senão `null` |

Detalhes:
- Refresh token cookie: `httpOnly`, `secure` em produção, `sameSite: 'lax'`, `maxAge: 30d`, `path: '/'`.
- `getInitialToken` limpa o cookie se a renovação falhar (token inválido/expirado).

## Sign out — ordem crítica

Em `useSignOut`, limpe o estado local **antes** de `await serverSignOut(...)`. Isso garante que o `useSyncExternalStore` notifique imediatamente e a UI atualize sem esperar o servidor (ou reload).

```ts
// ✅
tokenStore.clear()
apiClient.setRenewTokenCallback(null)
queryClient.clear()
if (accessToken) await serverSignOut({ data: { accessToken } })

// ❌ — UI só atualiza depois que o servidor responder
if (accessToken) await serverSignOut({ data: { accessToken } })
tokenStore.clear()
```

## SSR hydration — sem flash

O root route (`__root.tsx`) tem `beforeLoad` que chama `getInitialToken()` **apenas no servidor** e retorna o token no context. O `loader` repassa para o componente. O token é serializado no dehydrated state do router e chega ao cliente sem waterfall.

### `useIsAuthenticated` — server snapshot

Usa `useSyncExternalStore` com três argumentos:
1. `subscribe` — reatividade para sign in/out pós-mount
2. **client snapshot** — `() => tokenStore.get() !== null`
3. **server snapshot** — `() => initialIsAuthenticated` (injetado via `AuthProvider` context)

Durante a hidratação, o React usa o **server snapshot**. Se fosse hardcoded `() => false`, o HTML do servidor renderizaria "não autenticado" e o cliente mostraria um flash ao corrigir. A solução é o `AuthProvider` injetar `initialIsAuthenticated` via context.

### `tokenStore` é client-only

**`tokenStore.set` nunca roda no servidor** — estado global mutável vaza entre requests concorrentes. A inicialização acontece no `RootApp` com guard `typeof window !== 'undefined'`.

```ts
// __root.tsx — dentro do RootApp component
const isClient = typeof window !== 'undefined'
const tokenAlreadySet = tokenStore.get() !== null
if (isClient && !tokenAlreadySet && initialToken !== null) {
  tokenStore.set(initialToken)
  apiClient.setRenewTokenCallback(() => renewToken())
}
```

## Rotas protegidas

```ts
// src/routes/upload.tsx (idem dashboard, settings)
export const Route = createFileRoute('/upload')({
  beforeLoad: () => {
    const notAuthenticated = tokenStore.get() === null
    if (notAuthenticated) throw redirect({ to: '/' })
  },
  component: UploadPage,
})
```

`beforeLoad` roda tanto no server quanto no client, mas como `tokenStore` só tem valor no client, o guard efetivamente protege na navegação client. Para proteção em primeira requisição, SSR routes usam `accessToken` do context do root (`context.accessToken`).

## SSR autenticado (padrão de rota)

```ts
// src/routes/watch.$videoId.tsx
export const Route = createFileRoute('/watch/$videoId')({
  loader: async ({ params, context: { queryClient, accessToken } }) => {
    await queryClient.prefetchQuery({
      queryKey: ['videos', params.videoId],
      queryFn: () => fetchVideoSsr(params.videoId, accessToken),
    })
  },
})
```

`accessToken` vem do router context (populado no `beforeLoad` do `__root`). No client, é `null` (o `tokenStore` assume o controle).

## Hooks (auth/hooks.tsx)

| Hook | Retorno | Observações |
|---|---|---|
| `useIsAuthenticated()` | `boolean` | Reativo via `useSyncExternalStore`; SSR-safe |
| `useSignIn()` | mutation | Em sucesso, seta token e `renewTokenCallback` |
| `useSignUp()` | mutation | Não autentica — só cria conta |
| `useSignOut()` | mutation | Ordem: limpar local → chamar server |
| `useAuthModal()` | `{ isOpen, open, close, mode }` | Modal global de login/signup controlada via `AuthModalProvider` |
