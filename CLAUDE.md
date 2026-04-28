# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and Codex CLI when working with this sub-project.

## Reference Implementation

The original implementation lives at `../v0/v0-socialraven-ui/` — **read-only, never modify it**.
When implementing a feature, read the relevant v0 code to understand the original logic, then re-implement it cleanly here with tests.

## Commands

```bash
npm run dev      # Start dev server on port 3001
npm run build    # Production build
npm run lint     # ESLint
```

No test scripts configured yet — add Playwright for e2e as features are introduced.

## Current State (Barebones)

This project has been stripped to a clean foundation. What exists:

| Path | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout — ClerkProvider + ThemeProvider |
| `src/app/page.tsx` | Public landing page |
| `src/app/not-found.tsx` | 404 page |
| `src/app/globals.css` | Global styles + CSS variables |
| `src/middleware.ts` | Clerk route protection |
| `src/app/(auth)/` | Clerk sign-in / sign-up pages |
| `src/app/(protected)/dashboard/` | Maintenance message (placeholder) |
| `src/app/(public)/` | Public pages — pricing, about, terms, privacy, etc. |
| `src/components/ui/` | shadcn/ui primitives — do not edit directly |
| `src/components/landing-page/` | Landing page sections |
| `src/components/navbar/` | Public navbar |
| `src/components/public/` | Public layout, footer, pricing grid |
| `src/components/theme/` | Dark/light mode provider + switcher |
| `src/components/generic/` | Clerk appearance config, toaster, platform icons |
| `src/constants/plans.ts` | Plan definitions (used by pricing page) |
| `src/lib/utils.ts` | `cn()` Tailwind class merge utility |
| `src/hooks/use-mobile.tsx` | Mobile breakpoint hook |

**Not yet implemented** (add feature-by-feature with tests):
- Social account OAuth connect flows (`src/app/api/auth/`)
- Post creation, scheduling, publishing
- Dashboard content
- Sidebar + protected app navigation
- Workspace management
- Analytics, billing, calendar

## Architecture

**Package:** Next.js 15 App Router, TypeScript, React 18, Tailwind CSS, shadcn/ui.

### Route Groups

- `(auth)/` — Clerk sign-in/sign-up pages
- `(protected)/` — Auth-required routes; layout is a simple `SignedIn`/`SignedOut` gate (no sidebar yet)
- `(public)/` — No auth required

### Authentication

`src/middleware.ts` uses Clerk to protect all routes under `(protected)/`. The protected layout (`src/app/(protected)/layout.tsx`) uses `<SignedIn>` / `<RedirectToSignIn>` — no workspace gate or sidebar until those features are added.

### Styling

TailwindCSS with CSS HSL variables for theming (supports dark mode via `class` strategy). Uses `cn()` from `@/lib/utils` everywhere for conditional class merging. Typography wired through Geist font variables in `src/app/layout.tsx` and `src/app/globals.css`.

- **Sizing units rule:** prefer `rem`; use `px` only for 1px borders/hairlines.

### Density & Scale Controls

- **Global desktop scale:** `src/app/globals.css` — `@media (min-width: 768px)` block on `html`.
  Current value: `font-size: clamp(92%, calc(110% - 0.2083vw), 100%);`
- **Public navbar brand sizing:** `src/components/navbar/navbar.tsx`
- **Global compactness primitives:** `src/components/ui/button.tsx`, `card.tsx`, `input.tsx`, `textarea.tsx`, `tabs.tsx`, `sheet.tsx`

### Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY
NEXT_PUBLIC_BACKEND_URL     — API base URL
NEXT_PUBLIC_BASE_URL        — App base URL (OAuth redirect URIs)
```

Per-platform OAuth credentials added back as each platform is implemented.
