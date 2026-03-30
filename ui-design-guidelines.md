# SocialRaven UI Design Guidelines

This document is the canonical UI guideline for `socialraven-ui`.

Any agent, developer, or CLI assistant working on UI in this project must read and follow this file before making visual changes.

This applies to:
- Codex CLI
- Claude Code CLI
- Human contributors

If another note conflicts with this file, follow this file for UI decisions unless the user explicitly overrides it.

---

## 1. Purpose

SocialRaven should feel:
- clear
- trustworthy
- operational
- collaborative
- enterprise-ready

The reference direction is the current Atlassian Design System:
- token-first
- calm, structured surfaces
- strong information hierarchy
- obvious actions
- restrained color use
- accessible by default

SocialRaven is **Atlassian-inspired**, not an Atlassian clone.

That means:
- copy the discipline, not the branding literally
- use Atlassian interaction patterns and color roles as the mental model
- keep SocialRaven-specific implementation grounded in this repo's tokens and components

The UI must not look like:
- a glossy startup landing page
- a dark-only power tool
- a template-heavy admin dashboard
- a playful consumer app
- a one-off visual experiment

---

## 2. Product Principles

### 2.1 Clarity first

Every screen must make the main task obvious.

Prefer:
- visible labels
- predictable layouts
- explicit actions
- stable states
- plain language

Avoid:
- decorative UI that competes with the task
- ambiguous icon-only actions for important workflows
- hidden state changes
- clever interaction patterns that reduce readability

### 2.2 System over improvisation

The product should feel assembled from a consistent system.

Do not:
- invent one-off radii, shadows, or control heights
- change spacing rhythm between similar screens
- mix unrelated visual styles in one flow
- solve hierarchy problems with novelty

### 2.3 Trustworthy, not flashy

Prefer:
- neutral surfaces
- crisp borders
- measured emphasis
- conservative semantic color use
- layouts that hold up under real data

Avoid:
- glassmorphism
- loud gradients across product surfaces
- heavy shadows on standard cards
- playful treatment in analytics, billing, settings, or operational views

### 2.4 Accessibility is part of the design

Readable contrast, visible focus, and non-color cues are mandatory.

Prefer:
- visible focus rings
- sentence-case labels
- 14px minimum for standard UI text
- icons or labels that reinforce color-coded meaning

Do not:
- rely on color alone for state
- place critical text on low-contrast fills
- hide interaction states

---

## 3. Repo-Specific Implementation Constraints

These constraints are mandatory for AI tools working in this repo.

### 3.1 Theme system

Theme is controlled via `next-themes` using the `class` strategy on `<html>`.

Current implementation facts:
- default theme is `light`
- `dark` theme is supported and must remain production-ready
- product colors are defined in [`socialraven-ui/src/app/globals.css`](/Users/mac/Workspace/RemoteRepo/socialraven/socialraven-ui/src/app/globals.css)

### 3.2 Token-first rule

For product UI, use local CSS tokens, not ad hoc colors.

Primary local tokens already available:
- `--background`
- `--surface`
- `--surface-raised`
- `--surface-sunken`
- `--foreground`
- `--foreground-muted`
- `--foreground-subtle`
- `--border`
- `--border-subtle`
- `--accent`
- `--accent-hover`
- `--accent-active`
- `--accent-foreground`
- `--success`
- `--warning`
- `--destructive`
- `--info`

Do not hard-code colors for:
- surfaces
- text
- borders
- standard buttons
- form controls
- nav states
- badges

Hard-coded values are allowed only for:
- external platform brand colors
- illustrations
- charts when a documented chart token is missing and a real token migration is being added
- exact brand assets

### 3.3 Current typography constraint

Atlassian's current app typefaces are Atlassian Sans and Atlassian Mono.

SocialRaven currently uses **Inter** in the actual app via [`socialraven-ui/src/app/layout.tsx`](/Users/mac/Workspace/RemoteRepo/socialraven/socialraven-ui/src/app/layout.tsx).

For this repo:
- keep **Inter** as the app UI font unless the user explicitly requests a font migration
- follow Atlassian's density, hierarchy, and readability principles
- do not introduce a second UI sans-serif family into the protected app

This is important for AI tools:
- use Atlassian as the design language reference
- do not silently switch the product font to Atlassian Sans in implementation work

---

## 4. Color Model

This section corrects the most important misunderstanding in the previous doc.

Atlassian's color system is **role-based**, not "use one blue everywhere".

When choosing color, think in this order:
1. neutral
2. brand
3. semantic status
4. accent
5. chart

### 4.1 Color roles

Use these roles conceptually:
- `neutral`: standard UI surfaces, text, borders, chrome
- `brand`: primary product identity and main action emphasis
- `information`: informative but non-dangerous system messaging
- `success`: positive state
- `warning`: caution or attention needed
- `danger`: destructive or severe issue
- `discovery`: something new or exploratory
- `accent`: color with no semantic meaning, interchangeable with other accent hues
- `inverse`: text/icons on bold fills
- `input`: form-field-specific treatments

### 4.2 SocialRaven mapping

For SocialRaven:
- the product's blue identity maps to the **brand** role
- the local token `--accent` currently behaves as the product **brand** token in implementation
- do not treat `--accent` as a generic free-choice accent in this repo

This distinction matters:
- **brand** = SocialRaven blue for primary action and selected emphasis
- **accent** = non-semantic categorical emphasis where the exact hue is interchangeable

### 4.3 Brand color usage

Use SocialRaven blue for:
- primary buttons
- selected navigation
- links
- focused states
- selected controls
- key informational emphasis
- single-series default analytics marks

Do not use SocialRaven blue for:
- large decorative page washes
- multiple unrelated highlights in one viewport
- warning, success, or destructive meanings
- every series in a multi-series chart

### 4.4 Semantic colors

Use semantic colors only for real meaning:
- `--success` for success and healthy status
- `--warning` for caution, limits, or degraded state
- `--destructive` for destructive action, severe error, or failed state
- `--info` for informational states when blue informational emphasis is appropriate

Do not use brand blue as a replacement for semantic meaning.

### 4.5 Accent colors

Atlassian accent colors are interchangeable non-semantic hues.

Use accent colors only when color is:
- organizational
- categorical
- decorative in a restrained way
- user-assigned
- non-semantic and swappable

Good uses:
- calendar/event chips
- category indicators
- optional visual grouping
- non-semantic highlights in a dense workspace

Bad uses:
- success, warning, error, or status meaning
- primary CTA styling
- text that needs strong contrast on subtle accent fills
- replacing a chart palette

### 4.6 Emphasis levels

Atlassian color usage relies heavily on emphasis levels.

In practical terms:
- use neutral surfaces first
- use subtle/subtler fills for low-emphasis grouping
- use bold fills sparingly for primary emphasis
- pair subtle backgrounds with borders when contrast needs reinforcement

For AI tools:
- prefer border + subtle background over saturated fills
- prefer selected states that read clearly in both themes
- if a subtle fill is too low-contrast, add the matching border instead of jumping straight to a bold fill

### 4.7 Current local tokens

The current repo token values in [`socialraven-ui/src/app/globals.css`](/Users/mac/Workspace/RemoteRepo/socialraven/socialraven-ui/src/app/globals.css) remain the implementation source of truth unless the task explicitly includes a token refactor.

Use these mental mappings:

| Local token | Role |
|-------|-------|
| `--background` | app canvas neutral |
| `--surface` | default container neutral |
| `--surface-raised` | raised neutral |
| `--surface-sunken` | recessed neutral |
| `--foreground` | primary text |
| `--foreground-muted` | secondary text |
| `--foreground-subtle` | tertiary text |
| `--border` | standard border |
| `--border-subtle` | subtle separator |
| `--accent` | SocialRaven brand blue |
| `--accent-hover` | hovered brand blue |
| `--accent-active` | pressed brand blue |
| `--success` | success semantic |
| `--warning` | warning semantic |
| `--destructive` | danger semantic |
| `--info` | informational semantic |

### 4.8 Mandatory color rules

- Neutral surfaces stay neutral.
- Brand blue marks interaction and selected emphasis, not decoration.
- Semantic colors are reserved for true status meaning.
- Accent hues are interchangeable and non-semantic.
- Platform brand colors appear only when representing external social networks.
- Never tint entire product sections blue just because the logo is blue.

---

## 5. Analytics and Graph Color Rules

This section is mandatory for dashboards, reports, charts, and KPI views.

Atlassian's guidance is clear:
- use **chart tokens** for chart marks
- use normal text and border tokens for axes, legends, labels, and gridlines
- do not treat chart colors like normal UI accent colors

### 5.1 Chart UI versus chart data

Use:
- `color.text` equivalent for chart title and legend text
- `color.text.subtle` equivalent for tick labels and secondary labels
- `color.border` equivalent for gridlines and frames
- chart tokens for bars, lines, areas, points, thresholds, and segments

In this repo, that means:
- axes, labels, legends, and support text should use `--foreground`, `--foreground-muted`, `--foreground-subtle`, and `--border`
- chart marks should use dedicated chart tokens, not generic `--accent` plus random Tailwind colors

### 5.2 Single-series charts

For one primary series:
- use the brand chart color as the default
- use neutral chart color for de-emphasized comparisons or historical context

Examples:
- follower growth over time
- scheduled posts volume
- engagement trend line

### 5.3 Multi-series charts

For categorical multi-series charts:
- use a dedicated categorical chart palette
- keep series count reasonable
- preserve a stable series-to-color mapping across filters and refreshes

Do not:
- repeat brand blue across every series
- use semantic colors unless the series itself carries semantic meaning
- build chart palettes from random Tailwind classes

### 5.4 Status and severity charts

If the chart encodes meaning like health or severity:
- use success, warning, danger, information, discovery, and neutral appropriately
- do not use categorical hues when the color is supposed to communicate status

Examples:
- publish success rate by platform
- failed posts versus warning states
- account health or connection reliability

### 5.5 Accessibility rules for charts

- Do not rely on color alone to distinguish series.
- Use labels, legends, tooltips, patterns, markers, or direct annotations.
- Do not place regular text directly on chart colors unless contrast is explicitly verified.
- Add separation between adjacent segments when colors touch, especially in stacked bars and pie/donut charts.
- Use neutral chart lines for thresholds, targets, and baselines unless the threshold itself is semantic.

### 5.6 SocialRaven chart implementation rule

The current repo has only generic chart tokens:
- `--chart-1`
- `--chart-2`
- `--chart-3`
- `--chart-4`
- `--chart-5`

That is not strong enough guidance for reliable AI-generated analytics UI.

When creating or refactoring analytics UI, prefer introducing or mapping to a more explicit chart token model such as:
- `--chart-brand`
- `--chart-neutral`
- `--chart-categorical-1`
- `--chart-categorical-2`
- `--chart-categorical-3`
- `--chart-categorical-4`
- `--chart-categorical-5`
- `--chart-categorical-6`
- `--chart-success`
- `--chart-warning`
- `--chart-danger`
- `--chart-discovery`

If a task does not include token refactoring:
- use the existing `--chart-*` tokens consistently
- document the mapping in the component
- do not mix them with random hard-coded chart colors

### 5.7 Analytics screen visual tone

Analytics views should feel:
- analytical, not decorative
- easy to scan
- dense but readable
- calm under heavy data

Prefer:
- clear section titles
- compact legends
- small supporting notes
- visible time-range controls
- restrained highlight usage

Avoid:
- glowing charts
- multiple saturated backgrounds
- oversized metric cards fighting with the chart
- decorative gradients in data regions

---

## 6. Themes

SocialRaven supports both light and dark themes.

### 6.1 Light theme

Light mode is the flagship experience.

It should feel:
- neutral
- crisp
- readable
- structured

### 6.2 Dark theme

Dark mode should preserve the same hierarchy and system logic.

It should not become:
- a new brand
- a neon dashboard
- a high-gloss aesthetic

Use:
- deep neutral backgrounds
- clearly separated layers
- brighter borders than typical dark SaaS products
- brand emphasis sparingly

### 6.3 Theme rules

- Do not hard-code light-only or dark-only product colors in component classes.
- If a color must work in both themes, it should come from repo tokens.
- Do not rely on third-party default colors without checking both themes.
- Verify every meaningful UI change in both light and dark mode.

---

## 7. Typography

### 7.1 Type direction

SocialRaven currently uses **Inter** for app UI.

Use:
- Inter for app shell, forms, tables, cards, and dashboards
- `font-mono` only for code-like values, IDs, or tokens

Do not introduce:
- display fonts in the protected app
- multiple sans-serif families
- marketing-style typography in operational screens

### 7.2 Hierarchy and density

Use a practical product-first scale.

| Role | Size | Weight |
|------|------|--------|
| Page title | `20px` to `24px` | `600` |
| Section heading | `16px` to `18px` | `600` |
| Card heading | `14px` to `16px` | `600` |
| Standard UI text | `14px` | `400` to `500` |
| Dense nav / compact labels | `13px` | `400` to `500` |
| Secondary metadata | `12px` | `400` to `500` |

Rules:
- if there is no reason to go larger, use `13px` or `14px`
- keep protected-app typography compact and consistent
- prefer emphasis through weight and color before increasing font size
- use sentence case by default

---

## 8. Iconography

If choosing a new icon direction, Atlaskit aligns best with the target visual language.

Rules:
- do not mix icon styles inside the same screen
- default icon color should inherit surrounding text color
- use platform logos only for external networks
- pair icons with labels unless the meaning is already standard
- icon-only actions need tooltips and should be used sparingly for important tasks

---

## 9. Spacing, Radius, and Elevation

### 9.1 Spacing

Use a stable spacing rhythm.

Common defaults:
- tight inline spacing: `gap-1.5` or `gap-2`
- control groups: `gap-2` or `gap-3`
- card sections: `gap-4`
- major page sections: `gap-6` or `gap-8`
- card padding: `p-4` or `p-5`
- dialog padding: `p-6`

### 9.2 Radius

Use disciplined rounding.

| Element | Radius |
|-------|-------|
| Buttons and inputs | `8px` |
| Menus and popovers | `8px` |
| Cards and panels | `12px` |
| Dialogs | `12px` |
| Pills and avatars | `full` only when semantically appropriate |

Do not jump between arbitrary radii on the same screen.

### 9.3 Elevation

Prefer borders and surface contrast before shadows.

Use:
- no shadow or very light shadow for standard cards
- moderate shadow for popovers and dialogs

Avoid:
- layered shadows
- ambient glows
- dramatic floating-card treatment

---

## 10. Component Guidance

### 10.1 Sourcing

When choosing or building components:
- prefer Atlassian patterns and behavior
- use shadcn/ui as an implementation layer, not the visual source of truth
- restyle wrappers when needed so the result reads as one coherent system

### 10.2 Buttons

Hierarchy:
- `primary` for the main action
- `secondary` for supporting actions
- `subtle` or `ghost` for low-emphasis actions
- `destructive` only for destructive outcomes

Rules:
- standard height: `h-9` or `h-10`
- one primary action per major section
- labels should be direct
- use brand blue intentionally

### 10.3 Inputs

- keep labels outside the field
- use help text below the field
- keep validation adjacent and specific
- align related controls when viewport width allows

### 10.4 Cards and panels

- use neutral surfaces
- use clear headers when content mixes multiple concerns
- solve grouping with spacing first, dividers second
- use nested sunken surfaces sparingly

### 10.5 Navigation

- active state should be clear and brand-led
- inactive items should still be easy to scan
- structure should prioritize orientation over ornament

### 10.6 Tables and dense data

Prefer:
- clear headers
- visible filters
- compact density options
- row hover states
- predictable row actions

Avoid:
- cardifying everything when a table is the correct tool
- hiding critical actions
- using color alone to convey row state

### 10.7 Badges and lozenges

- keep them compact
- use semantic colors only for real meaning
- use blue only for informational or selected states, not generic decoration

### 10.8 Dialogs

- keep titles explicit
- keep confirmation copy short
- make dangerous actions unmistakable

---

## 11. What AI Tools Must Not Do

Do not:
- treat the current local `--accent` token as a generic accent bucket
- turn every emphasis element blue
- use brand blue as a substitute for semantic warning, success, or danger
- build analytics colors from random Tailwind palette classes
- put chart labels, legends, and axes on arbitrary chart colors
- use decorative gradients in protected app workflows
- apply heavy shadows to standard cards
- introduce a second UI font family
- blindly ship stock shadcn styling
- rely on color alone for meaning

---

## 12. Workflow for UI Changes

Whenever redesigning or creating a page:

1. Read this file first.
2. Inspect the local page and nearby components.
3. Preserve business logic and permissions behavior unless behavior changes are requested.
4. Normalize spacing, hierarchy, and state treatment before inventing new visuals.
5. Use neutral surfaces first and brand emphasis second.
6. Use semantic colors only when the meaning is semantic.
7. For analytics, separate chart-mark colors from chart-interface colors.
8. Verify both light and dark themes.
9. Keep the result production-ready, not exploratory.

---

## 13. Definition of Done

A UI task is not complete unless the result is:
- cleaner than before
- easier to scan
- aligned with this guideline
- consistent with nearby screens
- correct in both light and dark themes
- responsive
- accessible in common states
- using brand and semantic color correctly
- using analytics colors intentionally and consistently
- appropriate for a mature B2B product
