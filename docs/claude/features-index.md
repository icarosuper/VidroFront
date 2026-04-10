# Features index

Mapa de cada feature com arquivos, endpoints backend consumidos, hooks expostos e tipos principais. **Atualize este doc sempre que adicionar/remover endpoints, hooks ou componentes.**

## auth — `src/features/auth/`

Autenticação (signup/signin/signout), renovação de token, modal global. Ver [auth.md](auth.md) para detalhes do padrão.

| Arquivo | Conteúdo |
|---|---|
| `server.ts` | `serverSignUp`, `serverSignIn`, `serverSignOut`, `renewToken`, `getInitialToken` |
| `hooks.tsx` | `AuthProvider`, `AuthModalProvider`, `useIsAuthenticated`, `useSignIn`, `useSignUp`, `useSignOut`, `useAuthModal` |
| `types.ts` | `SignUpRequest`, `SignInRequest`, `AuthTokens` |
| `components/AuthModal.tsx` | Modal global de login/signup |
| `components/SignInForm.tsx` | |
| `components/SignUpForm.tsx` | |

**Endpoints backend (via server.ts):**
- `POST /v1/auth/signup`
- `POST /v1/auth/signin`
- `POST /v1/auth/signout`
- `POST /v1/auth/renew-token`

---

## users — `src/features/users/`

Perfil do usuário autenticado e upload de avatar.

| Arquivo | Conteúdo |
|---|---|
| `api.ts` | `getMe`, `uploadAvatar` |
| `hooks.ts` | `useCurrentUser`, `useUploadAvatar`, `userKeys.me()` |
| `types.ts` | `UserProfile` |
| `components/ProfileInfo.tsx` | |
| `components/AvatarUpload.tsx` | Upload via presigned URL |

**Endpoints backend:**
- `GET /v1/users/me`
- `POST /v1/users/me/avatar` (retorna presigned URL; upload PUT direto no storage)

---

## channels — `src/features/channels/`

CRUD de canais, follow/unfollow, avatar.

| Arquivo | Conteúdo |
|---|---|
| `api.ts` | `getUserChannels`, `getChannel`, `createChannel`, `updateChannel`, `followChannel`, `unfollowChannel`, `uploadChannelAvatar` |
| `hooks.ts` | `useUserChannels`, `useChannel`, `useCreateChannel`, `useUpdateChannel`, `useFollowChannel`, `useUnfollowChannel`, `useUploadChannelAvatar` |
| `types.ts` | `Channel`, `ChannelSummary`, `ChannelsResponse`, `CreateChannelRequest/Response`, `UpdateChannelRequest`, `UploadAvatarResponse` |
| `components/CreateChannelForm.tsx` | |
| `components/EditChannelForm.tsx` | |
| `components/SubscribeButton.tsx` | Toggle follow/unfollow com optimistic feel |

**Endpoints backend:**
- `GET /v1/users/{username}/channels`
- `GET /v1/users/{username}/channels/{handle}`
- `POST /v1/channels`
- `PUT /v1/channels/{handle}`
- `POST /v1/users/{username}/channels/{handle}/follow`
- `DELETE /v1/users/{username}/channels/{handle}/follow`
- `POST /v1/channels/{handle}/avatar`

---

## videos — `src/features/videos/`

Trending, feed, detalhe, reações, upload (create + presigned + polling de status), thumbnail, CRUD, listagem por canal.

| Arquivo | Conteúdo |
|---|---|
| `api.ts` | `getTrending`, `getFeed`, `getVideo`, `registerView`, `reactToVideo`, `removeReaction`, `getChannelVideos`, `createVideo`, `uploadVideoFile` (XHR c/ progresso), `updateVideo`, `uploadThumbnail` |
| `hooks.ts` | `useTrending`, `useFeed`, `useVideo`, `useRegisterView`, `useReactToVideo`, `useRemoveReaction`, `useVideoStatus`, `useCreateVideo`, `useUpdateVideo`, `useChannelVideos`, `useUploadThumbnail` |
| `server.ts` | `fetchVideoSsr` — usado pelo loader de `/watch/$videoId` |
| `types.ts` | `Video`, `VideoSummary`, `ChannelVideoSummary`, `TrendingResponse`, `FeedPage`, `ChannelVideosPage`, `CreateVideoRequest/Response`, `UpdateVideoRequest/Response`, `ThumbnailUploadResponse` |
| `components/VideoCard.tsx` | Card reutilizável (home/feed e canal). Props: `hideChannelInfo` oculta avatar/nome do canal; `isOwner` exibe botão de editar, overlay de status e badge de visibilidade |
| `components/VideoGrid.tsx` | |
| `components/VideoPlayer.tsx` | Player HLS |
| `components/UploadVideoForm.tsx` | Cria vídeo + faz upload + polling |
| `components/EditVideoForm.tsx` | |

**Endpoints backend:**
- `GET /v1/videos/trending?limit`
- `GET /v1/feed?limit&cursor`
- `GET /v1/videos/{videoId}`
- `POST /v1/videos/{videoId}/view`
- `POST /v1/videos/{videoId}/react`
- `DELETE /v1/videos/{videoId}/react`
- `GET /v1/channels/{channelId}/videos?limit&cursor`
- `POST /v1/channels/{channelId}/videos` (retorna `uploadUrl` presigned)
- `PUT /v1/videos/{videoId}`
- `POST /v1/videos/{videoId}/thumbnail` (presigned)

**Upload flow:** `createVideo` → PUT direto no `uploadUrl` com progresso via `XMLHttpRequest` → `useVideoStatus` faz polling até `VideoStatus.Ready` ou `Failed`.

---

## comments — `src/features/comments/`

| Arquivo | Conteúdo |
|---|---|
| `api.ts` | `listComments`, `listReplies`, `addComment`, `editComment`, `deleteComment`, `reactToComment`, `removeCommentReaction` |
| `hooks.ts` | `useComments`, `useReplies`, `useAddComment`, `useEditComment`, `useDeleteComment`, `useReactToComment`, `useRemoveCommentReaction`, `commentKeys` |
| `types.ts` | `CommentSummary`, `CommentsPage`, `ReplySummary`, `RepliesPage` |
| `components/CommentList.tsx` | Lista paginada de comentários com sort Recent/Popular, form de adicionar |
| `components/ReplyList.tsx` | Replies lazy-loaded por comentário, form de reply inline |

**Endpoints backend:**
- `GET /v1/videos/{videoId}/comments?sort&limit&cursor`
- `GET /v1/comments/{commentId}/replies?limit&cursor`
- `POST /v1/videos/{videoId}/comments`
- `PUT /v1/comments/{commentId}`
- `DELETE /v1/comments/{commentId}`
- `POST /v1/comments/{commentId}/reactions`
- `DELETE /v1/comments/{commentId}/reactions`

---

## playlists — `src/features/playlists/`

**Status:** stubs vazios (fase 9).

| Arquivo | Conteúdo |
|---|---|
| `api.ts` | *(vazio)* |
| `hooks.ts` | *(vazio)* |
| `types.ts` | *(vazio)* |

---

## Rotas (`src/routes/`)

| Rota | Arquivo | Estratégia | Auth | Features consumidas |
|---|---|---|---|---|
| `/` | `index.tsx` | SSR | pública | videos (trending/feed) |
| `/watch/$videoId` | `watch.$videoId.tsx` | SSR | pública | videos, channels, comments |
| `/search` | `search.tsx` | SSR | pública | videos |
| `/$username` | `$username.tsx` + `$username.index.tsx` | SSR | pública | users, channels |
| `/$username/$channel` | `$username.$channel.tsx` | SSR | pública | channels, videos |
| `/upload` | `upload.tsx` | client-only | **required** | videos |
| `/dashboard` | `dashboard.tsx` | client-only | **required** | channels, videos |
| `/settings` | `settings.tsx` | client-only | **required** | users |

## Shared

| Módulo | Arquivo | Conteúdo |
|---|---|---|
| api client | `src/shared/lib/api-client.ts` | `apiClient`, `ApiClientError`, `setRenewTokenCallback` |
| token store | `src/shared/lib/token-store.ts` | `tokenStore` (get/set/clear/subscribe) |
| tipos base | `src/shared/types.ts` | `ApiSuccess`, `ApiError`, `ValidationError`, `EnumValue`, `CursorPage`, `PagedResult`, `API_ERROR_CODES`, `VideoStatus`, `VideoVisibility`, `ReactionType`, `PlaylistVisibility`, `PlaylistScope`, `CommentSortOrder` |
| erros | `src/shared/lib/error-messages.ts` | Mapa `code → mensagem user-facing` |
| toast | `src/shared/lib/toast-error.ts` | `toastApiError(error)` |
| components globais | `src/components/` | `Header`, `ThemeToggle`, `ui/*` (shadcn) |
| integração | `src/integrations/tanstack-query/` | `QueryClient` + devtools |
