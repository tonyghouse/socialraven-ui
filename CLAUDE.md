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

TailwindCSS with CSS HSL variables for theming (supports dark mode via `class` strategy). Uses `cn()` from `@/lib/utils` everywhere for conditional class merging. Product typography is wired through the Geist font variables exposed in `src/app/layout.tsx` and bridged in `src/app/globals.css`.

- **Sizing units rule:** prefer `rem` for text, spacing, widths, heights, radii, and other dimensions that should follow the global app scale. Use `em` when something should scale relative to the parent text size. Avoid `px` unless it is a true precision-only detail such as a 1px border/divider, a hairline, or an unavoidable external/browser-specific value.

### Density & Scale Controls

When the user asks to make the app feel bigger, smaller, denser, or more premium, do not resize random pages first. Start with the shared scale controls below, then only do page-level tightening/loosening if needed.

- **Global desktop scale:** `src/app/globals.css`
  The desktop/tablet root `rem` scale is controlled in the `@media (min-width: 768px)` block on `html`.
  Current value:
  ```css
  font-size: clamp(92%, calc(110% - 0.2083vw), 100%);
  ```
  This scales most Tailwind `rem`-based text, spacing, widths, heights, radii, and gaps together.
  If the user asks for something like "go to 94%", usually change the first `clamp(...)` value from `92%` to `94%` first, then only adjust the middle `calc(...)` term if the interpolation feels off.

- **Protected app header:** `src/components/layout/protected-page-header.tsx`
  This controls the shared top header used across protected pages.
  Current key values:
  `h-[58px]`, icon `h-8 w-8`, title `text-[17px]`, description `text-[13px]`
  Keep `src/components/layout/page-skeleton-primitives.tsx` aligned with the same sizing.

- **Protected sidebar readability:** `src/components/sidebar/app-sidebar.tsx`
  This controls the protected desktop sidebar density.
  Current key values:
  expanded width `w-[232px]`, collapsed width `w-[70px]`
  brand icon box `h-9 w-9`, brand title `text-base`
  nav rows `h-10`, nav text `text-[14px]`, nav icons `h-[18px] w-[18px]`
  If the app scale should stay the same but the sidebar needs to feel easier to read, tweak these values instead of changing the global scale.

- **Workspace switcher inside sidebar:** `src/components/sidebar/WorkspaceSwitcher.tsx`
  This should stay visually aligned with the sidebar brand row and nav items.
  Current key values:
  trigger icon box `h-10 w-10`, workspace title `text-[14px]`

- **Public navbar brand sizing:** `src/components/navbar/navbar.tsx`
  If the public site brand text looks too small or too large relative to `Pricing` / `Sign up`, fix it here instead of changing the whole navbar scale.

- **Global "compactness" primitives:** shared UI components
  These affect perceived density across most pages:
  `src/components/ui/button.tsx`
  `src/components/ui/card.tsx`
  `src/components/ui/input.tsx`
  `src/components/ui/textarea.tsx`
  `src/components/ui/tabs.tsx`
  `src/components/ui/sheet.tsx`
  `src/components/ui/confirm-dialog.tsx`
  If the app feels too chunky or too tiny everywhere, adjust these before patching dozens of individual screens.

- **Page-level density pass:** protected route files
  Only after shared controls are correct, tweak local wrappers like:
  `space-y-*`, `gap-*`, `p-*`, `px-*`, `py-*`, empty-state heights, and large detail panel paddings in `src/app/(protected)/**`.
  Prefer small one-step changes such as:
  `space-y-6 -> space-y-5`
  `gap-6 -> gap-5`
  `p-6 -> p-5`
  `py-16 -> py-12`

- **Important rule:** if the user says the current scale is correct, do not touch the global `html` scale in `globals.css`. Adjust only the local chrome they mention, such as the sidebar, top header, or a specific page family.

### Environment Variables

Key variables expected in `.env.local`:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_BACKEND_URL` — Backend API base URL
- `NEXT_PUBLIC_BASE_URL` — App base URL (for OAuth redirect URIs)
- Per-platform OAuth credentials: `X_API_KEY/SECRET`, `INSTAGRAM_APP_ID/SECRET`, `FACEBOOK_APP_ID/SECRET`, `LINKEDIN_CLIENT_ID/SECRET`, `YT_CLIENT_ID/SECRET`
