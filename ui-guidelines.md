# SocialRaven UI Design Guidelines (Vibe)

This document is the canonical UI guideline for `socialraven-ui`.

Any agent, developer, or CLI assistant working on UI in this project must read and follow this file before making visual changes.

This applies to:
- Codex CLI
- Claude Code CLI
- Human contributors

If another note conflicts with this file, follow this file for UI decisions unless the user explicitly overrides it.

---

## 1. Product Direction

SocialRaven should now feel:
- operational
- structured
- product-grade
- structured workspace-inspired
- calm under real data

The reference system is **Vibe Design System**.

That means:
- strong hierarchy
- crisp bordered surfaces
- clear primary actions
- dense but readable information layouts
- restrained color usage
- typography that feels like a product workspace, not a landing-page template

SocialRaven is **Vibe-aligned**, not a literal clone of any external product.

Copy:
- the system behavior
- the spacing logic
- the visual discipline

Do not copy:
- external product naming
- unrelated brand motifs
- random accent colors

---

## 2. Source of Truth

### 2.1 Primary system

Use **Vibe first**.

Primary packages:
- `@vibe/core`
- `@vibe/icons`
- `@vibe/style`

### 2.2 Fallback order

1. Vibe components first
2. Existing local primitives second
3. shadcn/ui only when Vibe does not cover the use case
4. Custom components last

### 2.3 Important constraint

Do not introduce a second competing design language.

Specifically:
- do not design new screens around Geist
- do not reintroduce Vercel-style product chrome
- do not mix Vibe and shadcn for the same component type on one screen unless there is no alternative

---

## 3. Color Rules

Detailed monday.com and Vibe color research lives in `ui-color-guidelines.md`.
Read that file before making palette or public-page visual-system changes.

### 3.1 Primary accent

**Blue is the only primary accent.**

Use the Vibe primary token family:
- `--primary-color`
- `--primary-hover-color`
- `--primary-selected-color`

Do not introduce:
- purple as a second primary
- gradient-heavy CTA treatments
- multiple competing action colors

### 3.2 Neutrals

Most of the UI should be built from Vibe neutrals:
- `--primary-background-color`
- `--secondary-background-color`
- `--allgrey-background-color`
- `--ui-border-color`
- `--layout-border-color`
- `--primary-text-color`
- `--secondary-text-color`

Prefer neutral structure first, accent second.

### 3.3 Semantic colors

Use Vibe semantic tokens only for status:
- `--positive-color`
- `--negative-color`
- `--warning-color`

Do not use semantic colors as decorative accents.

---

## 4. Typography

Use the Vibe font stack:
- body: `Figtree`
- headings: `Poppins`
- mono/supporting code text: `Roboto Mono`

Rules:
- headings should feel compact and product-oriented
- avoid oversized hero typography that reads like consumer marketing
- body copy should stay readable and controlled
- labels should be crisp and slightly denser than prose

Preferred local utility classes:
- `text-heading-*`
- `text-label-*`
- `text-copy-*`

---

## 5. Layout and Surfaces

### 5.1 Surface model

The default product language is:
- app canvas in muted gray
- white or dark contained cards
- clear border separation
- moderate radii
- light shadow only where grouping needs emphasis

Prefer:
- a few meaningful panels
- stable grids
- explicit section headers
- visible structure

Avoid:
- floating everything without containment
- card-on-card-on-card nesting
- soft startup blobs and decorative glow backgrounds in product areas
- glassmorphism

### 5.2 Border discipline

Vibe-style interfaces rely heavily on borders.

Use:
- `--layout-border-color` for section and container separation
- `--ui-border-color` for controls and lighter internal boundaries

Do not:
- invent custom border colors per page
- use shadow where a border communicates more clearly

### 5.3 Radius

Use restrained radius values:
- controls: around `0.75rem` to `0.875rem`
- cards/panels: around `1rem` to `1.25rem`

Do not introduce exaggerated pill or blob radii outside intentional chips/lozenges.

---

## 6. Components

### 6.1 Buttons

Buttons must follow these roles:
- one clear blue primary action
- secondary buttons remain neutral
- tertiary/icon actions stay visually quiet

Do not place multiple primary-blue CTAs next to each other without a clear hierarchy.

### 6.2 Navigation

Navigation should feel like application chrome:
- compact
- bordered
- predictable
- low-noise

Avoid:
- flashy nav backgrounds
- oversized nav text
- hero-style navigation controls

### 6.3 Cards and panels

Cards are for:
- grouped content
- previews
- workflow summaries
- legal/document blocks

Cards are not decoration.

### 6.4 Status and messaging

Use:
- Vibe `AttentionBox` where message treatment matters
- clear inline status pills for workflow state
- semantic colors only when meaning is real

### 6.5 Icons

Prefer `@vibe/icons`.

Lucide is allowed only when:
- the icon does not exist in Vibe
- the screen already depends on Lucide and changing it adds no value

Do not mix wildly different icon weights on the same surface.

---

## 7. Theme Strategy

Theme is controlled through `next-themes`.

Current class mapping:
- light theme => `default-app-theme`
- dark theme => `black-app-theme`

Rules:
- keep both light and dark working
- rely on Vibe theme tokens first
- only bridge local tokens when existing app code still needs them
- dark mode should use neutral charcoal and black surfaces, never violet or purple-tinted black
- do not handcraft page-specific dark palettes

---

## 8. Public Pages

Public pages should now look like a serious product front door, not a startup splash page.

That means:
- operational hero language
- structured comparison sections
- information-dense cards
- clear proof, workflow, and pricing sections

Avoid:
- abstract marketing fluff
- oversized decorative gradients
- novelty sections with no product value

---

## 9. Protected App

Protected routes should feel even more Vibe-native than marketing pages.

Prefer:
- sidebar and top-level shells that resemble workspace software
- compact spacing
- status-first cards
- predictable grids

Avoid:
- landing-page visuals inside dashboard views
- decorative illustrations in core workflow surfaces

---

## 10. Existing Local Tokens

The repo still contains bridge tokens like:
- `--background`
- `--foreground`
- `--border`
- `--accent`

These exist to support older local components.

Rule:
- for new UI, prefer Vibe variables directly
- when touching old code, it is acceptable to use bridge tokens if that is the safer incremental change
- do not add a third token system

---

## 11. shadcn Usage

shadcn components remain in the repo as legacy primitives.

Rules:
- do not edit `src/components/ui/` directly unless the task explicitly requires it
- do not build new public design language around shadcn defaults
- if a shadcn primitive is still used, restyle it so it reads as part of the Vibe system

---

## 12. Review Standard

Before shipping a UI change, verify:
- the page clearly reads as Vibe-aligned
- blue is still the only primary accent
- the hierarchy is obvious without decorative tricks
- both light and dark themes still work
- cards, borders, and spacing feel system-driven rather than improvised
- any new component choice follows the Vibe-first sourcing order

If a screen feels like generic Tailwind output, it is not done.
