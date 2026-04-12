# Fase 9 — Playlists

## Objetivo

Implementar criação, edição, exclusão e gerenciamento de vídeos em playlists. Playlists podem ter escopo de usuário (`User`) ou canal (`Channel`) e visibilidade pública ou privada.

---

## Contratos da API

### Endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `POST` | `/v1/playlists` | required | Criar playlist |
| `GET` | `/v1/playlists/{playlistId}` | optional | Buscar playlist com items |
| `PUT` | `/v1/playlists/{playlistId}` | required | Editar nome/descrição/visibilidade |
| `DELETE` | `/v1/playlists/{playlistId}` | required | Deletar playlist |
| `GET` | `/v1/users/{username}/channels/{handle}/playlists` | optional | Listar playlists de um canal (cursor) |
| `GET` | `/v1/users/{username}/playlists` | optional | Listar playlists pessoais do usuário (cursor) |
| `POST` | `/v1/playlists/{playlistId}/items` | required | Adicionar vídeo à playlist |
| `DELETE` | `/v1/playlists/{playlistId}/items/{videoId}` | required | Remover vídeo da playlist |

### Shapes relevantes

**`POST /v1/playlists` — request:**
```ts
{ name: string; description?: string; visibility: PlaylistVisibility; scope: PlaylistScope; channelId?: string }
```
> `channelId` obrigatório quando `scope === PlaylistScope.Channel`.

**`POST /v1/playlists` — response:**
```ts
{ playlistId: string }
```

**`GET /v1/playlists/{playlistId}` — response:**
```ts
{
  playlistId: string; name: string; description?: string;
  visibility: EnumValue; scope: EnumValue; videoCount: number;
  channelId?: string; createdAt: string;
  items: { videoId: string; title: string; thumbnailUrl?: string; durationSeconds?: number }[]
}
```

**`GET /v1/channels/{channelId}/playlists` e `/v1/users/{userId}/playlists` — response (`PagedResult`):**
```ts
{ items: PlaylistSummary[]; nextCursor?: string }
// PlaylistSummary: { id, name, description?, visibility: EnumValue, videoCount, createdAt }
```

**`PUT /v1/playlists/{playlistId}` — request:**
```ts
{ name: string; description?: string; visibility: PlaylistVisibility }
```

**`POST /v1/playlists/{playlistId}/items` — request:**
```ts
{ videoId: string }
```

### Regras de negócio (backend)
- Playlist `Channel` só aceita vídeos do próprio canal.
- Playlist privada retorna 404 para não-dono (tanto `GET` individual quanto nas listagens).
- `listPlaylistsByUser` só retorna playlists com `scope === User`.
- `listPlaylistsByChannel` só retorna playlists com `scope === Channel`.

---

## Arquivos a criar/editar

### `src/features/playlists/`

| Arquivo | O que implementar |
|---|---|
| `types.ts` | `PlaylistSummary`, `Playlist`, `PlaylistItem`, `PlaylistsPage`, `CreatePlaylistRequest`, `CreatePlaylistResponse`, `UpdatePlaylistRequest` |
| `api.ts` | `createPlaylist`, `getPlaylist`, `updatePlaylist`, `deletePlaylist`, `listChannelPlaylists`, `listUserPlaylists`, `addVideoToPlaylist`, `removeVideoFromPlaylist` |
| `hooks.ts` | `usePlaylist`, `useChannelPlaylists`, `useUserPlaylists`, `useCreatePlaylist`, `useUpdatePlaylist`, `useDeletePlaylist`, `useAddVideoToPlaylist`, `useRemoveVideoFromPlaylist`, `playlistKeys` |
| `components/CreatePlaylistForm.tsx` | Form de criação (nome, descrição, visibilidade, escopo + channelId opcional) |
| `components/EditPlaylistForm.tsx` | Form de edição (nome, descrição, visibilidade) |
| `components/PlaylistCard.tsx` | Card resumido: nome, videoCount, visibilidade badge |
| `components/PlaylistItemList.tsx` | Lista de vídeos dentro de uma playlist com botão de remover (owner-only) |

### Rotas novas

| Rota | Arquivo | Estratégia | Auth | Descrição |
|---|---|---|---|---|
| `/playlists/$playlistId` | `routes/playlists.$playlistId.tsx` | SSR (público, mas owner vê itens privados) | optional | Página de detalhe da playlist |

### Rotas editadas

| Rota | Arquivo | Mudança |
|---|---|---|
| `/$username/$channel` | `routes/$username.$channel.tsx` | Adicionar aba/seção "Playlists" listando playlists do canal |
| `/dashboard` | `routes/dashboard.tsx` | Adicionar seção para gerenciar playlists pessoais |

---

## Passos de implementação

- ✅ **1. Types** — `src/features/playlists/types.ts`
- ✅ **2. API** — `src/features/playlists/api.ts`
- ✅ **3. Hooks** — `src/features/playlists/hooks.ts` com `playlistKeys`
- ✅ **4. Components**
  - ✅ `PlaylistCard.tsx`
  - ✅ `CreatePlaylistForm.tsx`
  - ✅ `EditPlaylistForm.tsx`
  - ✅ `PlaylistItemList.tsx`
- ✅ **5. Rota `/playlists/$playlistId`** — página de detalhe SSR
- ✅ **6. Canal page** — adicionar seção de playlists em `/$username/$channel`
- ✅ **7. Dashboard** — adicionar gestão de playlists pessoais
- ✅ **8. Atualizar `docs/claude/features-index.md`**
- ✅ **9. Rodar testes**

---

## Notas

- `PlaylistVisibility` e `PlaylistScope` já estão definidos em `src/shared/types.ts`.
- Na rota de detalhe, carregar a playlist via loader SSR para SEO; hydration normal para ações de owner.
- `addVideoToPlaylist` invalida `playlistKeys.detail(playlistId)` após sucesso.
- Playlist `Channel` só aparece na page do canal; playlist `User` aparece no dashboard e na page pública do usuário (quando o `userId` for exposto — confirmar se backend expõe `userId` em `UserProfile`).
