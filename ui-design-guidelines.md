# SocialRaven UI Design Guidelines

This document is the canonical UI design guideline for `socialraven-ui`.

Any agent, developer, or CLI assistant working on UI design or redesign in this project should read and follow this file before making visual changes.

This applies to:
- Codex CLI
- Claude Code CLI
- Human contributors

If another design note conflicts with this file, follow this file for UI decisions unless the user explicitly says otherwise.

---

## 1. Product Intent

SocialRaven should feel:
- Precise
- Fast
- Minimal
- Trustworthy
- Internationally credible for US and EU customers

The visual tone is **Linear-inspired**: engineering-forward, ultra-minimal, purposeful. Every element earns its place. Nothing decorates; everything communicates.

The interface should not look like:
- a marketing landing page
- a Notion clone
- a dashboard template
- an Apple app (we are departing from that direction)

The reference aesthetic is tools like Linear, Vercel, Raycast, and Liveblocks — products that feel like precision instruments, not consumer apps.

---

## 2. Non-Negotiable Principles

### 2.1 Clarity over decoration

Every screen must make the primary action obvious.

Avoid:
- visual clutter
- redundant labels
- decorative elements with no functional purpose
- competing accent colors
- illustrated empty states in serious workflow areas

### 2.2 Density and breathing room must coexist

The interface should feel information-dense but never cramped.

Do not:
- add oversized padding to simulate premium
- leave dead zones between related controls
- over-separate content that belongs together

Layouts should feel tight enough to be useful and open enough to scan quickly.

### 2.3 Reduce visual aggression

Prefer:
- regular and medium weights over repeated bold
- hairline borders over thick separators
- near-invisible elevation over heavy shadows
- subtle muted text for secondary labels

Do not bold everything. Hierarchy comes from size and weight contrast, not from making everything heavier.

### 2.4 Design for trust

The UI should signal reliability.

Prefer:
- stable, predictable layouts
- familiar interaction patterns
- conservative color usage
- polished interactive states

---

## 3. Themes

SocialRaven ships **both light and dark themes**. Neither is an afterthought. Both must look polished and intentional.

Theme is controlled via the `class` strategy on `<html>` (already configured via `next-themes`).

### 3.1 Dark theme — primary

Dark is the flagship experience. Most power users and the core EU/US SaaS audience default to dark.

Character:
- near-black backgrounds, not pitch black
- layered gray surfaces with hairline borders
- low-contrast borders that separate without shouting
- accent and interactive elements as the only real color

### 3.2 Light theme — equally polished

Light mode is not dark mode inverted. It should feel clean and editorial, not washed out.

Character:
- off-white backgrounds (not pure white)
- slightly elevated white card surfaces
- soft gray borders
- same accent color as dark, slightly more saturated

---

## 4. Color System

### 4.1 Accent color

**Linear Violet — `hsl(237, 56%, 60%)`** (`#5E6AD2`)

This is Linear's exact primary color and the sole accent for SocialRaven.

Why violet over blue: SocialRaven manages blue platforms (Facebook, Twitter/X, LinkedIn, Bluesky, Mastodon). A blue accent would blend into platform brand colors throughout the UI. Violet is clearly distinct — it reads as "the tool layer" above the platforms, not another platform.

Light mode behavior: violet reads as a confident, precise accent against off-white surfaces. It does not feel heavy or dark. This is the same trade-off Linear ships.

Dark mode behavior: same value. Violet pops cleanly against dark neutral grays without needing adjustment.

Contrast note: white text on `#5E6AD2` is ~3.8:1. Acceptable for buttons and active states (WCAG AA large UI is 3:1). Do not place 12px or smaller text on a solid violet fill.

Used for:
- primary buttons
- active nav states
- focus rings
- links
- interactive highlights
- selected/active indicators

Must not be used:
- as a background fill for large surfaces
- on multiple competing elements in one viewport
- combined with other accent colors

### 4.2 Light theme tokens

| Token | HSL | Usage |
|-------|-----|-------|
| `--background` | `210 20% 98%` | page background |
| `--surface` | `0 0% 100%` | cards, panels, modals |
| `--surface-raised` | `210 14% 97%` | elevated inner containers |
| `--border` | `214 13% 90%` | default borders |
| `--border-subtle` | `214 13% 94%` | hairline dividers |
| `--foreground` | `220 15% 12%` | primary text |
| `--foreground-muted` | `220 9% 46%` | secondary labels, metadata |
| `--foreground-subtle` | `220 8% 64%` | placeholder, tertiary |
| `--accent` | `237 56% 60%` | Linear violet |
| `--accent-foreground` | `0 0% 100%` | text on accent |
| `--destructive` | `0 72% 51%` | errors, delete |
| `--success` | `152 69% 36%` | success states |
| `--warning` | `38 92% 50%` | warning states |

### 4.3 Dark theme tokens

| Token | HSL | Usage |
|-------|-----|-------|
| `--background` | `220 13% 9%` | page background |
| `--surface` | `220 12% 12%` | cards, panels, modals |
| `--surface-raised` | `220 11% 15%` | elevated inner containers |
| `--border` | `220 9% 20%` | default borders |
| `--border-subtle` | `220 9% 17%` | hairline dividers |
| `--foreground` | `220 10% 94%` | primary text |
| `--foreground-muted` | `220 7% 58%` | secondary labels, metadata |
| `--foreground-subtle` | `220 6% 40%` | placeholder, tertiary |
| `--accent` | `237 56% 60%` | Linear violet (same value) |
| `--accent-foreground` | `0 0% 100%` | text on accent |
| `--destructive` | `0 72% 55%` | errors, delete |
| `--success` | `152 60% 44%` | success states |
| `--warning` | `38 88% 55%` | warning states |

### 4.4 Color rules

- Neutral surfaces must stay neutral — do not tint backgrounds with brand color
- Accent appears where the user needs to act or where something is actively selected
- Semantic colors (success, warning, destructive) must not be used for cosmetic variation
- No gradients on surfaces — only allowed on specific marketing elements like the landing page
- No neon, no oversaturated palettes

---

## 5. Typography

### 5.1 Typeface

**Inter** — the sole typeface for all UI.

Load via `next/font/google` with `subsets: ['latin']` and `display: 'swap'`.

Drop all SF Pro / SF Mono / "heming" font references. Inter handles every weight and use case needed.

### 5.2 Scale

Use a tight, purposeful scale. Do not introduce ad-hoc font sizes.

| Role | Size | Weight | Tracking |
|------|------|--------|----------|
| Page title | `text-xl` (20px) | 600 | `-0.01em` |
| Section heading | `text-base` (16px) | 600 | `-0.005em` |
| Label / UI text | `text-sm` (14px) | 400–500 | `0` |
| Body copy | `text-sm` (14px) | 400 | `0` |
| Caption / metadata | `text-xs` (12px) | 400 | `0` |
| Code / monospace | `font-mono text-sm` | 400 | `0` |

### 5.3 Rules

- Page titles should be `text-xl font-semibold`, never larger in product UI
- Never use `text-2xl` or above inside the app shell (landing page excluded)
- Avoid excessive uppercase labels — use sentence case everywhere
- Do not set body text lighter than `--foreground-muted`; below that is illegible
- Hierarchy must be legible without relying on bold alone

---

## 6. Iconography

### 6.1 Library

**Phosphor Icons** — `@phosphor-icons/react`

Replace all Lucide icons with Phosphor equivalents. Do not mix icon libraries.

### 6.2 Weight usage

| Context | Weight |
|---------|--------|
| Default UI (nav, labels, inputs) | `regular` |
| Active / selected state | `fill` |
| Emphasis (destructive, important actions) | `bold` |
| Large decorative / empty state | `thin` or `light` |

### 6.3 Sizes

| Context | Size |
|---------|------|
| Inline with small text | `16` |
| Standard UI controls | `18` |
| Sidebar nav items | `18` |
| Toolbar / prominent actions | `20` |
| Empty states / illustrations | `32–48` |

### 6.4 Rules

- Icons must always be paired with a label or have a clear tooltip — do not rely on icon-only controls for novel features
- Icon color should inherit from the surrounding text unless it carries independent semantic meaning
- Active nav icons use `fill` weight with the accent color

---

## 7. Spacing and Layout

### 7.1 Spacing scale

Stick to the Tailwind default spacing scale. Do not invent custom spacing variables.

Common rhythms:
- Between tightly related inline elements: `gap-1.5` or `gap-2`
- Between controls in a form row: `gap-3`
- Between sections within a card: `gap-4` or `gap-6`
- Between cards in a grid: `gap-4`
- Card internal padding: `p-4` (compact) or `p-6` (standard)
- Page content padding: `px-6 py-6` or `px-8 py-8`

### 7.2 Border radius

| Element | Radius |
|---------|--------|
| Cards, panels, modals | `rounded-lg` (8px) |
| Buttons, inputs, selects | `rounded-md` (6px) |
| Badges, chips, tags | `rounded-md` or `rounded-full` |
| Tooltips | `rounded-md` |
| Avatar | `rounded-full` |

Keep radii consistent. Do not mix `rounded-xl` and `rounded-sm` on the same type of element without reason.

### 7.3 Layout width

Protected pages should span the full available content area beside the sidebar.

- Do not wrap core app pages inside narrow `max-w-*` containers without a product reason
- Use `max-w-prose` only for genuinely text-heavy reading content
- Use responsive grids where width improves scanning

---

## 8. Elevation and Borders

### 8.1 Borders preferred over shadows

Linear-style depth uses **hairline borders** not drop shadows.

Use `border border-[--border]` on cards and panels. Add `shadow-sm` only where a subtle lift is warranted (modals, floating elements, dropdowns).

Do not use `shadow-md` or above on regular cards.

### 8.2 Shadow use cases

| Component | Shadow |
|-----------|--------|
| Inline cards | none or `shadow-xs` |
| Hover-elevated cards | `shadow-sm` |
| Modals, dialogs | `shadow-lg` |
| Popovers, dropdowns | `shadow-md` |
| Tooltips | `shadow-sm` |

### 8.3 Backdrop blur

Use `backdrop-blur` sparingly — only on floating overlays, command palettes, or the mobile nav sheet. Do not apply it to regular cards.

---

## 9. Component Guidance

### 9.1 Buttons

Hierarchy: `default` (accent filled) → `secondary` (ghost with border) → `ghost` (text only) → `destructive`

Rules:
- Height: `h-8` (compact, most common), `h-9` (default), `h-10` (prominent CTA only)
- Font: `text-sm font-medium`
- One primary button per viewport section max
- Labels must be concise — not full sentences
- Icons inside buttons: `size={16}`, gap `gap-1.5`

Avoid:
- oversized CTA buttons in utility pages
- icon-only buttons without a tooltip
- destructive buttons not separated from normal actions

### 9.2 Inputs and selects

- Height: `h-9` standard
- Font: `text-sm`
- Border: `1px solid var(--border)` with `ring-2 ring-accent/40` on focus
- Keep labels above inputs, not inside (placeholder text is not a substitute for labels)
- Align related inputs in rows, not stacked when they logically belong side by side

### 9.3 Cards and panels

- `bg-[--surface] border border-[--border] rounded-lg`
- Do not stack multiple shadows on the same card
- Header inside card: `px-4 pt-4 pb-3 border-b border-[--border]`
- Use `bg-[--surface-raised]` for inner callout zones inside a card

### 9.4 Sidebar

- Background: `bg-[--surface]` with left border
- Nav items: `h-8 px-2.5 rounded-md text-sm`
- Active item: `bg-accent/10 text-accent font-medium` with `fill` icon weight
- Inactive item: `text-[--foreground-muted]` with `regular` icon weight
- Section labels: `text-xs text-[--foreground-subtle] uppercase tracking-wide font-medium`

### 9.5 Badges and tags

- `text-xs font-medium px-2 py-0.5 rounded-md`
- Use semantic color tokens: success green, warning amber, destructive red, default gray
- Do not use badge colors cosmetically — only when they carry real status meaning

### 9.6 Tabs and segmented controls

- Prefer understated underline tabs or pill-style segmented controls
- Active state: `text-foreground font-medium` with a slim underline or background fill
- Avoid loud colored tab bars that compete with the page content

### 9.7 Banners and notices

- Soft semantic backgrounds: `bg-success/10`, `bg-warning/10`, `bg-destructive/10`
- `rounded-lg border border-[semantic]/20 text-sm px-4 py-3`
- Keep copy short — do not put paragraphs in banners
- Use a relevant Phosphor icon (`fill` weight) in the leading position

### 9.8 Modals and dialogs

- Max width: `max-w-md` (standard), `max-w-lg` (wide), `max-w-sm` (confirmation)
- `bg-[--surface] border border-[--border] shadow-lg rounded-xl`
- Header: title + optional close icon, separated by a border from body
- Footer: action buttons right-aligned, destructive actions left-aligned

---

## 10. Motion and Animation

Animations should feel **immediate and purposeful**, not decorative.

Rules:
- Duration: `100–200ms` for micro-interactions, `200–300ms` for transitions
- Easing: `ease-out` for entrances, `ease-in` for exits, `ease-in-out` for transformations
- Use Framer Motion only where CSS transitions are insufficient (e.g., layout animations, presence)
- No loading spinners on actions that complete in under 300ms — show optimistic UI instead

Avoid:
- long page-transition animations
- bouncy spring physics on utility controls
- staggered list animations on every render

---

## 11. Audience Fit: US and EU Customers

The product should feel credible in both markets.

That means:
- no gimmicky visuals
- no loud growth-hack aesthetics
- no childish illustrations in workflow areas
- strong readability at all viewport sizes
- refined spacing and precise alignment
- a tool, not a toy

The UI should signal:
- operational reliability
- privacy awareness (especially important for EU)
- business maturity
- product confidence

---

## 12. What to Avoid

Do not introduce:
- SF Pro or any Apple system font reference
- Lucide icons (migrating to Phosphor)
- heavy drop shadows on cards
- gradients on surfaces (landing page excepted)
- neon or oversaturated accent colors
- multiple competing accent colors in one view
- oversized page titles inside the app shell
- narrow centered layouts with wasted side space
- inconsistent border radii across similar components
- inconsistent control heights
- backdrop blur on regular cards
- decorative badges or chips with no status meaning
- random font-weight changes without hierarchy purpose

---

## 13. Redesign Workflow

Whenever redesigning an existing page:

1. Read this file first.
2. Inspect the local page and nearby components before making changes.
3. Preserve information architecture unless there is a clear usability problem.
4. Preserve all business logic and permissions behavior unless the task explicitly includes behavior changes.
5. Improve hierarchy before adding decoration.
6. Remove unnecessary spacing before inventing new components.
7. Reduce boldness before adding more color.
8. Use full available layout width when it improves scanning.
9. Keep destructive sections separated below normal settings.
10. Verify both light and dark themes look correct after any change.

---

## 14. Implementation Notes for CLI Agents

When a user asks for UI work in `socialraven-ui`, the agent should:

1. Read this file first.
2. Inspect the local page and nearby components before redesigning.
3. Use Inter (loaded via `next/font/google`) for all typography.
4. Use `@phosphor-icons/react` for all icons — do not import from `lucide-react`.
5. Apply tokens via CSS variables (`var(--background)`, `var(--foreground-muted)`, etc.) not hardcoded colors.
6. Verify the result looks correct in both `light` and `dark` theme classes.
7. Keep the result production-ready, not exploratory.

When in doubt:
- simplify
- tighten spacing
- reduce bold text
- improve hierarchy
- keep the page calm and precise

---

## 15. Definition of Done for UI Changes

A UI task is not complete unless the result is:
- visually cleaner than before
- easier to scan
- aligned with this guideline
- consistent with nearby app pages
- correct in both light and dark themes
- responsive
- free of obvious excess spacing
- free of unnecessary bold typography
- appropriate for a premium B2B or prosumer SaaS audience
