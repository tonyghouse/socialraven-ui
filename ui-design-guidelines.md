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

Atlassian Sans is derived from Inter. Atlassian Mono is derived from JetBrains Mono.

SocialRaven's typography standard for this repo is:
- use **Inter** for sans-serif UI text
- use **JetBrains Mono** for monospace text

For this repo:
- keep **Inter** as the app UI font unless the user explicitly requests a sans-serif font migration
- keep **JetBrains Mono** as the app monospace font unless the user explicitly requests a monospace font migration
- follow Atlassian's density, hierarchy, readability, and scale principles
- do not introduce a second UI sans-serif family into the protected app
- do not introduce a second monospace family into the protected app

This is important for AI tools:
- use Atlassian as the design language reference
- do not silently switch the product font to Atlassian Sans or Atlassian Mono in implementation work

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

SocialRaven follows Atlassian's app typography model, adapted to this repo's fonts.

Use:
- **Inter** for headings and body text across app shell, forms, tables, cards, dashboards, and settings
- **JetBrains Mono** for code, code-like values, IDs, tokens, and technical strings only
- a single app-wide type scale grounded in rem values from a `16px` root size
- consistent heading, body, metric, and code roles instead of one-off text styling

Do not introduce:
- display fonts in the protected app
- multiple sans-serif families
- multiple monospace families
- marketing-style typography in operational screens
- arbitrary per-page font-size systems

### 7.2 Atlassian reference model

The typography guidance in this file is derived from Atlassian's:
- Applying Typography
- App Typefaces and Scale

For SocialRaven, treat those pages as the reference for:
- hierarchy logic
- size relationships
- line-height rhythm
- accessibility expectations
- metric and code usage

Treat this file as the repo-specific translation of that system.

Important repo rule:
- Atlassian's docs reference **Atlassian Sans** and **Atlassian Mono** as their product fonts
- SocialRaven does **not** adopt those font files by default
- keep Atlassian's typography behavior, hierarchy, and scale discipline
- keep SocialRaven's implementation fonts as **Inter** for UI text and **JetBrains Mono** for code-like text
- treat Atlassian Sans as a behavioral reference for how **Inter** should be applied in this repo
- treat Atlassian Mono as a behavioral reference for how **JetBrains Mono** should be applied in this repo
- do not swap in Atlassian Sans or Atlassian Mono unless the task explicitly includes a font migration

### 7.3 Canonical app scale

Use the Atlassian app scale as the canonical source of truth for size and line-height decisions.

Use `rem` as the primary unit for font sizes and line heights in implementation.
This preserves accessibility and respects browser or OS text scaling preferences.
`px` values below are included only as reference equivalents at a `16px` root size.

#### Heading scale

All heading styles use **bold** weight.

| Token role | Size | Line height | Product use |
|------|------|--------|--------|
| Heading XXL | `2rem` (`32px`) | `2.25rem` (`36px`) | brand and marketing content only |
| Heading XL | `1.75rem` (`28px`) | `2rem` (`32px`) | rare app page titles |
| Heading L | `1.5rem` (`24px`) | `1.75rem` (`28px`) | primary app page titles |
| Heading M | `1.25rem` (`20px`) | `1.5rem` (`24px`) | modal titles and major sections |
| Heading S | `1rem` (`16px`) | `1.25rem` (`20px`) | section headings |
| Heading XS | `0.875rem` (`14px`) | `1.25rem` (`20px`) | small component headings |
| Heading XXS | `0.75rem` (`12px`) | `1rem` (`16px`) | fine print headings, use sparingly |

#### Body scale

Body sizes are the default text styles for the product UI.

| Token role | Size | Line height | Primary use |
|------|------|--------|--------|
| Body L | `1rem` (`16px`) | `1.5rem` (`24px`) | long-form reading text |
| Body M | `0.875rem` (`14px`) | `1.25rem` (`20px`) | default app UI text |
| Body S | `0.75rem` (`12px`) | `1rem` (`16px`) | secondary metadata and fine print |

Paragraph spacing for written content should follow the Atlassian body rhythm:
- Body L paragraphs: `1rem` (`16px`)
- Body M paragraphs: `0.75rem` (`12px`)
- Body S paragraphs: `0.5rem` (`8px`)

#### Metric scale

Metric styles are only for emphasizing short numbers or numeric summaries.

| Token role | Size | Line height | Primary use |
|------|------|--------|--------|
| Metric L | `1.75rem` (`28px`) | `2rem` (`32px`) | large chart totals |
| Metric M | `1.5rem` (`24px`) | `1.75rem` (`28px`) | medium chart totals |
| Metric S | `1rem` (`16px`) | `1.25rem` (`20px`) | compact stat tiles |

#### Code scale

| Token role | Size | Line height | Primary use |
|------|------|--------|--------|
| Code | `0.75rem` (`12px`) | `1.25rem` (`20px`) | code blocks only |

Inline code should use **JetBrains Mono** and remain relative to its container rather than introducing a separate UI text scale.

### 7.4 Applying text styles

Use text styles by role, not by personal preference.

#### Headings

Use headings only to introduce content or establish structure.

Use:
- Heading L for primary app page titles
- Heading M for major section titles and dialog titles
- Heading S for card, panel, and subsection headings
- Heading XS or XXS only in genuinely constrained component spaces

Do not:
- use heading styles for button labels, tabs, menus, badges, or field labels
- use headings as a shortcut to make ordinary text louder
- use similar heading sizes for adjacent levels when the hierarchy should be obvious

Hierarchy rules:
- use one `h1` per page
- keep heading levels sequential and meaningful
- keep heading sizes equal to or smaller than twice the default body size
- keep `2` to `4` size steps between heading levels so the structure remains visible at a glance
- do not use heading sizes smaller than the body size they label

#### Body text

Use body styles for nearly all product UI copy.

Use:
- Body M as the default text style for components, controls, tables, menus, helper text, and short descriptions
- Body L for long-form reading areas such as policy pages or educational text blocks
- Body S for secondary metadata, timestamps, legal copy, semantic support text, and compact supporting labels

Do not:
- use Body S as the default paragraph size for operational screens
- use body text as a fake heading by only increasing weight
- use heading text inside standard controls

Paragraph spacing should follow the scale above and be handled with layout spacing rather than ad hoc margin values.

#### Metrics

Metric styles are for short, emphasized numeric content only.

Use metrics for:
- chart totals
- donut center values
- KPI tiles
- short number-first summaries such as `55% complete`

Do not use metrics for:
- chart titles
- axis labels
- legends
- billing line items or ordinary amounts in tables
- long statements or explanatory copy

When metric text includes supporting words, keep the phrase short.
If the value is not the focal point, use body text instead.

#### Code

Use code styles only when the content is actually code-like.

Valid uses:
- code blocks
- inline code
- IDs
- tokens
- API keys or fragments
- technical strings where character distinction matters

Invalid uses:
- generic metadata
- prices
- dates
- button labels
- navigation

### 7.5 Accessibility and structure

Typography choices must support both readability and assistive technology.

Mandatory rules:
- use semantic HTML headings that match the visual hierarchy
- keep font sizing responsive by using `rem`
- use tokenized text styles instead of one-off font declarations
- use accessible text color tokens that maintain contrast in both themes
- keep long-form reading text at `16px` equivalent minimum
- treat `12px` text as fine print only and use it sparingly
- design body copy to read comfortably at roughly `60` to `80` characters per line when the layout allows

Writing and readability rules:
- prefer succinct headings
- use sentence case by default
- avoid all caps except for acronyms or existing component behavior that already requires it
- never rely on truncation for important content
- if truncation is unavoidable for unknown user-generated content, provide a way to reveal the full value

### 7.6 Font weights and usage

Atlassian's system uses four named weights:
- regular
- medium
- semibold
- bold

For SocialRaven implementation with **Inter** and **JetBrains Mono**, map those weights as:
- regular = `400`
- medium = `500`
- semibold = `600`
- bold = `700`

Use these defaults:
- headings: bold
- paragraphs and descriptive copy: regular
- component text and text beside icons: medium
- stronger emphasis inside body text: bold, sparingly
- semibold: avoid by default; use only when an existing component pattern already depends on it

Do not:
- use regular or bold text beside line icons when medium is the correct match
- simulate hierarchy by randomly mixing many weights in one viewport
- use bold as a substitute for a proper heading level

### 7.7 Product-specific typography mapping

Use these mappings by default in SocialRaven screens:

| UI element | Recommended style |
|------|------|
| protected app page title | Heading L |
| dialog title | Heading M |
| card or panel heading | Heading S |
| standard component text | Body M medium |
| paragraph or descriptive message | Body M regular |
| long-form text block | Body L regular |
| helper text and metadata | Body S regular |
| text beside icons | Body M medium |
| chart title | Heading S or Body M bold, depending on density |
| chart legend, axes, and keys | Body S |
| KPI number | Metric S, M, or L depending on container |
| inline code or technical identifiers | Code / JetBrains Mono |

These mappings are defaults, not excuses to improvise.
Depart from them only when a component clearly needs a different level of emphasis.

### 7.8 Typography anti-patterns

Do not:
- create a custom type scale for a single page
- mix too many weights in one viewport
- use oversized headings to compensate for weak layout structure
- use metric styles as decorative large text
- use code font to make data feel technical
- use `12px` text as the default size in dense product screens
- stack several text sizes that are visually too close together
- make headings verbose enough to wrap awkwardly across common desktop widths
- force visual hierarchy with color alone when size and weight should do the work

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
