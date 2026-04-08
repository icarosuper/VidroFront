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

## Language

All code must be in English: variable names, function names, types, comments, and test names. The only exception is commit messages, which are written in Portuguese.

## Git commits

**NEVER commit code without explicit user request.** Always:
1. Implement the changes
2. Run tests to verify they pass
3. Show the user the changes and suggest a commit message
4. Wait for the user to approve or request the commit

The user will decide when and how to commit.

## Working style

After each implementation step:
1. **Run relevant tests** — `bun run test` after finishing a feature. Fix any failures before proceeding.
2. **Update relevant docs** — reflect any route, API, or design changes in `docs/plans/`. Mark completed tasks as ✅ in the implementation plan.
3. **Suggest a commit message in Portuguese** — the user reviews and commits manually. Never commit without being asked.
4. **Show the next possible steps** — brief list so the user can choose what to implement next.

## Branching strategy

- **Feature branches** — one branch per phase or feature group (e.g. `feature/auth`, `feature/channels`), branching off `master` and merged back via PR.
- **`master`** — always deployable.

## Code readability

- **Named variables over inline expressions** — always assign the result of a check or expression to a descriptively named variable before using it in a condition. Never inline results directly into `if` statements.
  ```ts
  // ✅
  const emailAlreadyTaken = users.some(u => u.email === email)
  if (emailAlreadyTaken) return { error: 'Email already in use' }

  // ❌
  if (users.some(u => u.email === email)) return { error: 'Email already in use' }
  ```

- **Extract complex logic into functions** — if a block needs a comment to explain what it does, it should be a function with a name that explains it instead.

- **Names express intent** — the name should answer "what", not "how". Avoid abbreviations, single-letter names (outside loops), and generic names like `result`, `data`, `temp`.

- **Ternaries always span three lines** — condition on the first line, `?` branch on the second, `:` branch on the third. Never write a ternary on a single line.
  ```ts
  // ✅
  const label = isAuthenticated
    ? 'Sign out'
    : 'Sign in'

  // ❌
  const label = isAuthenticated ? 'Sign out' : 'Sign in'
  ```
