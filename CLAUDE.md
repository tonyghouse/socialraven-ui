# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on port 3001
npm run build    # Production build
npm run lint     # ESLint
```

There are no test scripts configured.

## Architecture

**SocialRaven UI** is a Next.js 15 App Router social media scheduling and management platform. Users connect OAuth accounts (Instagram, Twitter/X, LinkedIn, Facebook, YouTube) and schedule posts with media to multiple platforms simultaneously.

### Route Groups

- `(auth)/` — Clerk sign-in/sign-up pages
- `(protected)/` — Authenticated app with sidebar/mobile nav layout; all sub-routes require auth
- `(public)/` — Policy pages, no auth required
- `app/api/auth/[platform]/` — OAuth initiation + callback handlers for each social platform
- `app/page.tsx` — Public landing page; redirects signed-in users to `/dashboard`

### Data Flow

1. **Auth:** Clerk manages user sessions. Service functions call `getToken()` to get a Bearer JWT for every backend request.
2. **Backend:** All app data (posts, accounts, analytics) is fetched from `NEXT_PUBLIC_BACKEND_URL` (defaults to `https://api.socialraven.io`).
3. **Media:** Files are uploaded to S3 via presigned URLs obtained from the backend (`/media/presign`).
4. **OAuth:** Each platform's OAuth flow runs entirely in Next.js API routes (`src/app/api/auth/[platform]/route.ts` + `/callback/route.ts`). Twitter uses OAuth 1.0a; others use OAuth 2.0.

### Key Directories

- `src/service/` — All backend API calls; one file per concern (e.g., `pagingatedPosts.ts`, `schedulePost.ts`)
- `src/model/` — TypeScript interfaces for backend data (`PostResponse`, `ConnectedAccount`, `PostCollection`, etc.)
- `src/components/ui/` — shadcn/ui primitives (don't edit these directly; regenerate via `npx shadcn-ui`)
- `src/components/schedule-post/` — Forms for scheduling IMAGE, VIDEO, and TEXT post types
- `src/lib/` — Utilities: `utils.ts` exports `cn()` for Tailwind class merging; `x-oauth.ts` handles HMAC-SHA1 signing for Twitter

### Authentication & Middleware

`src/middleware.ts` uses Clerk to protect all routes except `/`, `/sign-in`, `/sign-up`, `/privacy-policy`, and `/terms-of-service`.

### Styling

TailwindCSS with CSS HSL variables for theming (supports dark mode via `class` strategy). Uses `cn()` from `@/lib/utils` everywhere for conditional class merging. Custom font: `heming` (local) alongside Inter.

### Environment Variables

Key variables expected in `.env.local`:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_BACKEND_URL` — Backend API base URL
- `NEXT_PUBLIC_BASE_URL` — App base URL (for OAuth redirect URIs)
- Per-platform OAuth credentials: `X_API_KEY/SECRET`, `INSTAGRAM_APP_ID/SECRET`, `FACEBOOK_APP_ID/SECRET`, `LINKEDIN_CLIENT_ID/SECRET`, `YT_CLIENT_ID/SECRET`
