# SocialRaven UI Color Guidelines

This file documents the monday.com and Vibe color research for SocialRaven UI work.

Use this together with `ui-guidelines.md`. The design direction is Vibe-aligned, not a literal clone of monday.com.

## Research Sources

Local source of truth:
- `@vibe/style/dist/index.css`
- `@vibe/style/dist/tokens.json`
- `src/app/globals.css`

Public monday.com pages reviewed:
- `https://monday.com/llms.txt`
- `https://monday.com/`
- `https://monday.com/pricing`
- `https://monday.com/projects/features`
- `https://monday.com/features/dashboards`
- `https://monday.com/features/automations`
- `https://monday.com/features/kanban`
- `https://monday.com/features/gantt`
- `https://monday.com/integrations`
- `https://monday.com/workdocs`
- `https://monday.com/features/forms`
- `https://monday.com/features/files`
- `https://monday.com/crm`
- `https://monday.com/crm/features`
- `https://monday.com/crm/pricing`
- `https://monday.com/crm/campaigns`
- `https://monday.com/dev`
- `https://monday.com/dev/pricing`
- `https://monday.com/service`
- `https://monday.com/service/pricing`
- `https://monday.com/w/sidekick`
- `https://monday.com/w/vibe`
- `https://monday.com/w/enterprise`
- `https://monday.com/w/customer-stories`
- `https://monday.com/p/about/`
- `https://monday.com/w/nonprofits`
- `https://monday.com/templates`
- `https://monday.com/app-marketplace`

Observed pattern:
- The product UI is mostly white and pale gray surfaces with crisp borders.
- Saturated colors usually appear as board group rails, status pills, charts, small icons, tiny product badges, or one primary CTA.
- The public site adds product-marketing accents, but the reusable product design language comes from Vibe tokens.

## Priority Order

Use colors in this order:

1. Vibe semantic variables like `--primary-background-color` and `--primary-color`.
2. Vibe board color variables like `--color-done-green` only for status, grouping, charts, and decorative data cues.
3. `color-mix()` with a Vibe token for subtle tints.
4. Raw hex values only in documentation, migrations, or when mapping a token that does not exist yet.

Do not hard-code page-specific hex colors in components.

## Core Vibe Neutrals

These are the main monday/Vibe structural colors. Most UI should be built from these.

| Role | Token | Light value | Use |
| --- | --- | --- | --- |
| Primary surface | `--primary-background-color` | `#ffffff` | Cards, rows, controls, contained panels |
| Secondary surface | `--secondary-background-color` | `#ffffff` | Secondary panels and popovers |
| Canvas surface | `--allgrey-background-color` | `#f6f7fb` | Page backgrounds and section canvases |
| Primary surface tint | `--primary-surface-color` | `#eceff8` | Large muted blocks, selected shell areas |
| UI background | `--ui-background-color` | `#e7e9ef` | Disabled or inset control surfaces |
| UI hover background | `--ui-background-hover-color` | `#d8d9e0` | Neutral hover states |
| Light border | `--ui-border-color` | `#c3c6d4` | Control borders, internal card dividers |
| Layout border | `--layout-border-color` | `#d0d4e4` | Section boundaries, outer panels |
| Primary text | `--primary-text-color` | `#323338` | Headings and high-emphasis text |
| Secondary text | `--secondary-text-color` | `#676879` | Body copy and descriptions |
| Placeholder/icon text | `--placeholder-color`, `--icon-color` | `#676879` | Muted labels and passive icons |
| Inverted background | `--inverted-color-background` | `#323338` | Dark pills or inverted callouts |
| Deep product surface | `--color-surface` | `#292f4c` | Rare deep section or chart background |

Practical mix:
- Public page canvas: `--allgrey-background-color`.
- Public page cards: `--primary-background-color`.
- Internal card dividers: `--ui-border-color`.
- Page/section separators: `--layout-border-color`.

## Primary Blue Family

Blue remains the only primary action color in SocialRaven.

| Role | Token | Light value | Use |
| --- | --- | --- | --- |
| Primary action | `--primary-color` | `#0073ea` | Primary CTA, active tab, focused primary state |
| Primary hover | `--primary-hover-color` | `#0060b9` | Primary CTA hover |
| Primary selected | `--primary-selected-color` | `#cce5ff` | Selected item background, icon tile tint |
| Primary selected hover | `--primary-selected-hover-color` | `#aed4fc` | Selected hover |
| Primary highlight | `--primary-highlighted-color` | `#f0f7ff` | Very light information panels |
| Link | `--link-color` | `#1f76c2` | Inline links |
| Highlight alias | `--color-highlight_blue` | `#cce5ff` | Legacy selected blue alias |
| Light blue legacy | `--color-glitter` | `#d9f0ff` | Soft blue panel, if existing code already uses it |
| Focus blue legacy | `--color-highlight` | `#dff0ff` | Soft focus/info panel |

Rules:
- Use saturated blue only once per action group.
- Use `--primary-highlighted-color` or `color-mix(in srgb, var(--primary-color) 8%, var(--primary-background-color))` for subtle page decoration.
- Do not use purple, pink, green, or orange as a competing CTA color.

## Semantic Status Colors

Use semantic tokens when the color has real meaning.

| Meaning | Base | Hover | Selected | Selected hover |
| --- | --- | --- | --- | --- |
| Positive | `--positive-color` `#00854d` | `--positive-color-hover` `#007038` | `--positive-color-selected` `#bbdbc9` | `--positive-color-selected-hover` `#b5cec0` |
| Negative | `--negative-color` `#d83a52` | `--negative-color-hover` `#b63546` | `--negative-color-selected` `#f4c3cb` | `--negative-color-selected-hover` `#ecb7bf` |
| Warning | `--warning-color` `#ffcb00` | `--warning-color-hover` `#eaaa15` | `--warning-color-selected` `#fceba1` | `--warning-color-selected-hover` `#f2d973` |

Rules:
- `positive`, `negative`, and `warning` are not decorative brand accents.
- For public-page visual interest, prefer board color families below instead of semantic tokens unless the copy is truly status-based.

## Board And Status Accent Families

monday.com's product look comes from board-like color cues. Use these as small accents: left rails, status cells, chart bars, avatar rings, tiny icons, tag dots, or section rhythm.

### Greens

| Token | Value | Soft pair | Use |
| --- | --- | --- | --- |
| `--color-grass_green` | `#037f4c` | `--color-grass_green-selected` `#81bfa5` | Dark green group rail, dev-like status |
| `--color-done-green` | `#00c875` | `--color-done-green-selected` `#80e3ba` | Done/success board status |
| `--color-bright-green` | `#9cd326` | `--color-bright-green-selected` `#cde992` | Bright progress or freshness cue |
| `--color-green-haze` | `#00a359` | Use `color-mix()` | Secondary green accent |
| `--color-jade` | `#03c875` | Use `color-mix()` | Legacy alias for done green |
| `--color-brand-green` | `#11dd80` | Use `color-mix()` | Brand illustration accent only |
| `--color-brand-malachite` | `#00cd6f` | Use `color-mix()` | Brand illustration accent only |

### Yellows And Oranges

| Token | Value | Soft pair | Use |
| --- | --- | --- | --- |
| `--color-egg_yolk` | `#ffcb00` | `--color-egg_yolk-selected` `#ffe580` | Warning-like board status, highlight chips |
| `--color-working_orange` | `#fdab3d` | `--color-working_orange-selected` `#fed59e` | In-progress board status |
| `--color-dark-orange` | `#ff6d3b` | `--color-dark-orange-selected` `#ffb196` | Strong warm rail, sparingly |
| `--color-saladish` | `#cab641` | `--color-saladish-selected` `#e4daa0` | Muted yellow-green status |
| `--color-brand-gold` | `#ffcc00` | Use `color-mix()` | Brand illustration accent only |
| `--color-orange` | `#fdab3d` | Use `--color-working_orange-selected` | Legacy alias |
| `--color-yellow` | `#ffcb00` | Use `--color-egg_yolk-selected` | Legacy alias |

### Reds And Pinks

| Token | Value | Soft pair | Use |
| --- | --- | --- | --- |
| `--color-bazooka` | `#f65f7c` | Use `color-mix()` | Soft red-pink decorative rail |
| `--color-stuck-red` | `#df2f4a` | `--color-stuck-red-selected` `#f0a1ad` | Stuck/error board status |
| `--color-dark-red` | `#bb3354` | `--color-dark-red-selected` `#dd99a9` | Strong red status |
| `--color-sofia_pink` | `#e50073` | `--color-sofia_pink-selected` `#ff8ac4` | Pink category or campaign accent |
| `--color-lipstick` | `#ff5ac4` | `--color-lipstick-selected` `#fface1` | Bright pink highlight, sparingly |
| `--color-bubble` | `#faa1f1` | `--color-bubble-selected` `#fcd0f8` | Very soft pink/lilac panel |
| `--color-peach` | `#ffadad` | `--color-peach-selected` `#ffd6d6` | Soft peach panel |
| `--color-sunset` | `#ff7575` | `--color-sunset-selected` `#ffbaba` | Warm red-orange status |
| `--color-private` | `#f65f7c` | Use `color-mix()` | Private/locked context accent |
| `--color-like_red` | `#fb275d` | Use `color-mix()` | Social/like icon only |

### Purples And Indigos

| Token | Value | Soft pair | Use |
| --- | --- | --- | --- |
| `--color-purple` | `#9d50dd` | `--color-purple-selected` `#d0aeed` | Category accent only, never primary CTA |
| `--color-dark_purple` | `#784bd1` | `--color-dark_purple-selected` `#bba5e8` | Deep category rail |
| `--color-berry` | `#7e3b8a` | `--color-berry-selected` `#be9dc4` | Muted purple status |
| `--color-dark_indigo` | `#401694` | `--color-dark_indigo-selected` `#a08bc9` | Deep indigo, sparingly |
| `--color-indigo` | `#5559df` | `--color-indigo-selected` `#aaacef` | Board category, roadmap accent |
| `--color-lavender` | `#bda8f9` | `--color-lavender-selected` `#ded4fc` | Soft purple panel |
| `--color-lilac` | `#9d99b9` | `--color-lilac-selected` `#ceccdc` | Muted purple-gray accent |
| `--color-brand-iris` | `#595ad4` | Use `color-mix()` | Brand/product illustration accent only |
| `--color-brand-purple` | `#a358d0` | Use `color-mix()` | Brand/product illustration accent only |

### Blues, Cyans, And Teals

| Token | Value | Soft pair | Use |
| --- | --- | --- | --- |
| `--color-bright-blue` | `#579bfc` | `--color-bright-blue-selected` `#abcdfd` | Board rail, chart bar, secondary blue accent |
| `--color-dark-blue` | `#007eb5` | `--color-dark-blue-selected` `#80c2df` | Data/status blue, not CTA |
| `--color-royal` | `#216edf` | `--color-royal-selected` `#95bbf2` | Strong blue data accent |
| `--color-navy` | `#225091` | `--color-navy-selected` `#90a7c8` | Dark blue rail |
| `--color-aquamarine` | `#4eccc6` | `--color-aquamarine-selected` `#a6e5e2` | Teal/cyan category accent |
| `--color-chili-blue` | `#66ccff` | `--color-chili-blue-selected` `#b2e5ff` | Bright cyan board status |
| `--color-river` | `#74afcc` | `--color-river-selected` `#b3d0de` | Muted blue-gray accent |
| `--color-sky` | `#a1e3f6` | `--color-sky-selected` `#d0f1fa` | Soft sky panel |
| `--color-teal` | `#175a63` | `--color-teal-selected` `#8bacb1` | Deep teal rail, mature accent |
| `--color-aqua` | `#00d1d1` | Use `color-mix()` | Legacy bright cyan |
| `--color-live_blue` | `#009aff` | Use `color-mix()` | Legacy live/public accent |
| `--color-jeans` | `#597bfc` | Use `--color-bright-blue-selected` | Legacy bright blue |
| `--color-public` | `#009aff` | Use `color-mix()` | Public/shared context accent |
| `--color-brand-blue` | `#00a9ff` | Use `color-mix()` | Brand illustration accent only |
| `--color-brand-light-blue` | `#00cff4` | Use `color-mix()` | Brand illustration accent only |

### Neutrals And Earth Tones

| Token | Value | Soft pair | Use |
| --- | --- | --- | --- |
| `--color-winter` | `#9aadbd` | `--color-winter-selected` `#ccd6de` | Cool muted status |
| `--color-explosive` | `#c4c4c4` | `--color-explosive-selected` `#e1e1e1` | Neutral board status |
| `--color-american_gray` | `#757575` | `--color-american_gray-selected` `#bfbfbf` | Neutral label |
| `--color-blackish` | `#333333` | `--color-blackish-selected` `#999999` | Deep neutral, sparingly |
| `--color-brown` | `#7f5347` | `--color-brown-selected` `#bfa9a3` | Brown category accent |
| `--color-orchid` | `#e484bd` | `--color-orchid-selected` `#ecbad7` | Muted pink category accent |
| `--color-tan` | `#bca58a` | `--color-tan-selected` `#d6cabc` | Warm neutral panel |
| `--color-coffee` | `#cd9282` | `--color-coffee-selected` `#dec0b7` | Warm muted category |
| `--color-steel` | `#a9bee8` | `--color-steel-selected` `#d4dff4` | Soft blue-gray panel |
| `--color-pecan` | `#563e3e` | `--color-pecan-selected` `#ab9f9f` | Dark warm rail |

## Product Marketing Accents Observed On Public monday.com

These appear on public product pages and button styles. They are useful for research, but should not become SocialRaven defaults.

| Context | Color | Value | Guidance |
| --- | --- | --- | --- |
| Work OS / work management iris | `workos-iris` | `#6161ff` | Inspiration only; do not replace primary blue |
| Work OS hover iris | `workos hover` | `#5151d5` | Inspiration only |
| CRM dark tint | `crm-dark-tint-01` | `#00889b` | Use Vibe teal/blue tokens instead when possible |
| CRM dark | `crm-green-dark` | `#00a0a0` | Use Vibe teal/aquamarine family instead |
| CRM CTA | `crm-cta-color` | `#0c86ab` | Use only if creating a CRM-specific subbrand |
| Dev dark | `dev-green-dark` | `#037f4c` | Prefer `--color-grass_green` |
| Dev darker | `dev-darker-int-02` | `#025231` | Use only as deep rail/tint, not CTA |
| Projects dark orange | `projects-orange-dark` | `#f86700` | Prefer `--color-dark-orange` or `--color-working_orange` |
| Service dark | `service-dark-color` | `#980131` | Product-marketing only |
| Campaign/workforms red | `workforms-red`, `marketing-red-dark` | `#c21e71`, `#ca0c6b` | Prefer `--color-sofia_pink` or `--color-bazooka` |
| Mint green | `mint-green` | `#25dbc5` | Prefer `--color-aquamarine` |
| Bold blue | `bold-blue` | `#15bbe4` | Prefer `--color-chili-blue` or `--color-live_blue` |
| Royal marketing blue | `royal` | `#597bfc` | Prefer `--color-jeans` or `--color-bright-blue` |
| Brand red | `brand-primary-red` | `#fb275d` | Prefer `--color-like_red` only for social-like affordances |

Rule:
- These colors are page-marketing accents. They should not be used to build the core SocialRaven system unless we intentionally create a product-specific subbrand.

## How To Make Colors Subtle

Use saturated board colors only as a seed, then soften them.

Preferred pattern:

```css
--accent: var(--color-working_orange);
--accent-soft: color-mix(in srgb, var(--accent) 10%, var(--primary-background-color));
--accent-muted: color-mix(in srgb, var(--accent) 16%, var(--allgrey-background-color));
```

Recommended tint percentages:
- `6% - 8%`: section wash, page background detail.
- `10% - 14%`: icon tile background, small card header.
- `16% - 22%`: selected panel, pill background, chart background.
- `100%`: rails, dots, chart bars, status cells only.

Do not use full-strength colors for large decorative backgrounds.

## Public Page Recipes

Hero:
- Background: `--primary-background-color` to `--allgrey-background-color`.
- CTA: `--primary-color`.
- Optional accent: one or two tiny dots/rails from board colors.

Card section:
- Outer section: `--allgrey-background-color`.
- Card: `--primary-background-color`.
- Borders: `--layout-border-color` outside, `--ui-border-color` inside.
- Header strip: `--primary-background-color` or a `10% - 12%` color mix.

Board-like panel:
- Header row: `--allgrey-background-color`.
- Rows: `--primary-background-color`.
- Group rail: saturated board token.
- Status cell: selected token or `color-mix()` tint.
- Text: `--primary-text-color` and `--secondary-text-color`.

CTA footer:
- Keep one blue primary button.
- Use colored blocks, rails, or dots as supporting visual rhythm.
- Secondary button remains neutral.

## Pairing Recommendations

Safe subtle combinations:
- Blue + green + orange: `--primary-color`, `--color-done-green`, `--color-working_orange`.
- Blue + teal + steel: `--primary-color`, `--color-aquamarine`, `--color-steel`.
- Blue + indigo + sky: `--primary-color`, `--color-indigo`, `--color-sky`.
- Blue + bazooka + orange: `--primary-color`, `--color-bazooka`, `--color-working_orange`.

Avoid:
- Purple-heavy pages.
- Full rainbow sections with no data/status meaning.
- Multiple saturated CTA colors in one viewport.
- Gradients that compete with product UI structure.

## Dark Theme

Do not hand-map light hex values into dark mode. Use Vibe tokens and existing project theme variables.

Current Vibe dark/black themes shift:
- Selected blue from `#cce5ff` to deep blue values like `#133774`.
- Backgrounds from white/pale gray to dark surfaces.
- Selected status colors to darker variants.

Rule:
- If a color must work in both themes, use the CSS variable, not the hex.
- If a tint is needed, use `color-mix()` against `--primary-background-color` or `--allgrey-background-color`.

## Implementation Rules

- Prefer `@vibe/icons` with tokenized color tiles.
- Use `rem` units for sizing; use `1px` only for hairline borders.
- Use `--primary-color` for primary CTAs only.
- Use board colors for visual system language, not for brand actions.
- Keep color density low: most sections should be neutral with one accent family.
- When improving bland public pages, add structure first, then subtle color.
- If the result looks like a generic Tailwind card grid, add monday-like board cues: row dividers, group rails, status pills, small colored cells, and crisp panel headers.

## Quick Reference

Default page shell:

```tsx
<PublicPageShell mainClassName="bg-[var(--allgrey-background-color)]">
```

Subtle accent tile:

```tsx
<div className="bg-[color-mix(in_srgb,var(--color-done-green)_12%,var(--primary-background-color))] text-[var(--color-done-green)]" />
```

Board rail:

```tsx
<span className="h-8 w-1 rounded-full bg-[var(--color-working_orange)]" />
```

Status pill:

```tsx
<span className="rounded-full bg-[var(--primary-selected-color)] px-2.5 py-1 text-[var(--primary-color)]" />
```

