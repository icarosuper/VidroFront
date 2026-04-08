# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Reescrita do frontend do Vidro (plataforma de vídeo). O backend .NET já está completo. Este frontend é construído incrementalmente, fase por fase (ver `docs/plans/`).

## Stack

- **Framework:** TanStack Start (SSR seletivo, file-based routing via `src/routes/`)
- **Data fetching:** TanStack Query
- **UI:** shadcn/ui + Tailwind CSS v4
- **Package manager:** bun
- **Linting/formatting:** Biome (`biome check`, `biome format`)
- **Tests:** Vitest

## Commands

```bash
bun run dev          # dev server (http://localhost:3000)
bun run build        # production build
bun run test         # run all tests
bun run test src/tests/api-client.test.ts  # run single test file
biome check          # lint
biome format         # format
```

## Architecture

### File layout (after Phase 1 scaffold)

```
src/
├── routes/          # File-based routes (TanStack Router)
│   ├── __root.tsx   # Layout root: Header, providers, devtools
│   ├── index.tsx
│   ├── watch.$videoId.tsx
│   ├── search.tsx
│   ├── $username.tsx
│   ├── $username.$channel.tsx
│   ├── upload.tsx
│   ├── settings.tsx
│   └── dashboard.tsx
├── features/        # Vertical-slice feature modules
│   ├── auth/        # components/, hooks.ts, server.ts, types.ts
│   ├── videos/      # components/, hooks.ts, api.ts, types.ts
│   ├── channels/
│   ├── comments/
│   ├── playlists/
│   └── users/
├── shared/
│   ├── components/ui/   # shadcn/ui wrappers
│   ├── lib/
│   │   ├── api-client.ts   # central fetch wrapper
│   │   └── token-store.ts  # in-memory access token
│   └── types.ts            # base types: ApiSuccess, ApiError, EnumValue, etc.
└── tests/
```

### API client rule

**No feature ever calls `fetch` directly.** All HTTP goes through `apiClient` in `src/shared/lib/api-client.ts`. Features export typed functions in `features/*/api.ts`; TanStack Query hooks in `features/*/hooks.ts` consume those functions.

```ts
// features/videos/api.ts
export function getVideo(id: string) {
  return apiClient.get<Video>(`/v1/videos/${id}`)
}

// features/videos/hooks.ts
export function useVideo(id: string) {
  return useQuery({ queryKey: ['videos', id], queryFn: () => getVideo(id) })
}
```

Query key convention: `['resource-type', id]` e.g. `['videos', videoId]`, `['channels', handle]`.

### Auth pattern

- `accessToken` lives **in memory only** (`tokenStore`) — never localStorage, never a cookie accessible to JS
- `refreshToken` lives in an **httpOnly cookie** — handled exclusively by server functions in `features/auth/server.ts`
- `apiClient` intercepts 401 → calls `renewTokenCallback` → retries once → on failure clears token
- Authenticated routes use `beforeLoad` to redirect to `/` with login modal if no session
- SSR routes call a server function to obtain `accessToken` before render (no client waterfall)

### Rendering strategy

| Route | Strategy |
|-------|----------|
| `/`, `/watch/:videoId`, `/search` | SSR |
| `/:username`, `/:username/:channel` | SSR + ISR |
| `/upload`, `/dashboard`, `/settings` | Client-only (auth required) |

### API response shapes

```ts
// Success: always { data: T } — api-client unwraps to T
// Error: { code: string; message: string }
// Enum fields in responses: { id: number; value: string } — send only id in requests
// Pagination (videos/comments): CursorPage<K, T> with nextCursor: string | null
// Pagination (playlists): PagedResult<T> with items + nextCursor
// Deleted comments: keep in UI with isDeleted: true, content: null
```

### Environment

```
VITE_API_URL=http://localhost:5000   # .NET backend
```

## Implementation phases

The project is built phase by phase. Detailed plans are in `docs/plans/`:
1. Scaffold (TanStack Start + shadcn + structure + api-client)
2. Auth (signIn, signUp, signOut, token renewal, route protection)
3. Settings (user profile, avatar)
4. Channel (create, edit, delete, dashboard)
5. Home + Watch (trending, feed, HLS player, reactions)
6. Public channel/user pages (SSR + SEO)
7. Upload (presigned URL, progress, status polling)
8. Comments (list, add, reply, edit, delete, reactions)
9. Playlists

Each phase must ship working — nothing half-done.
