# SocialRaven UI Design Guidelines (Geist)

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
- clean
- developer-grade
- trustworthy
- operational
- enterprise-ready

The reference direction is the **Geist Design System by Vercel**:
- token-first using `--ds-*` CSS custom properties
- calm, structured surfaces with high information density
- strong information hierarchy
- obvious actions
- restrained color use
- accessible by default
- equally at home in light and dark mode

SocialRaven is **Geist-inspired**, not a Vercel clone.

That means:
- copy the discipline, not Vercel's branding literally
- use Geist interaction patterns, color roles, and component APIs as the mental model
- keep SocialRaven-specific implementation grounded in this repo's tokens and Geist components

The UI must not look like:
- a glossy startup landing page
- a neon dark-only power tool
- a heavy template-admin dashboard
- a playful consumer app
- a one-off visual experiment

---

## 2. Component Sourcing — Priority Order

This is the mandatory component hierarchy for every UI element in `socialraven-ui`.

### 2.1 Priority order

1. **Geist components first** — import from `geist/components`. This is the primary component library for SocialRaven UI.
2. **shadcn/ui as a fallback** — only when a Geist component does not exist for the use case. Restyle to align with Geist visual language.
3. **Custom component as last resort** — only when neither Geist nor shadcn covers the use case. Must follow Geist token and design rules.

### 2.2 What this means in practice

Do:
```tsx
import { Button, Badge, Input, Modal, Tabs, Menu, Tooltip, Toggle, Checkbox } from 'geist/components';
```

Do not:
- use shadcn Button when Geist Button is available
- use shadcn Badge when Geist Badge is available
- mix Geist and shadcn components side-by-side for the same UI element type
- use Atlassian Atlaskit components — they are not part of this stack

### 2.3 Atlassian components

Atlassian / Atlaskit components are **not used in this repo**. Do not install or import from `@atlaskit/*`. The previous guideline referenced Atlassian as a design language reference — this guideline replaces that with Geist.

---

## 3. Icons — Geist Icons Only

### 3.1 Icon library
1. Prefer Geist Icons by default
2. If an icon is missing:
   - Use Lucide icons as fallback
3. Ensure visual consistency:
   - Stroke width
   - Size
   - Color inheritance (currentColor)
Geist Icons are part of the Geist Design System and include 500+ icons. They use SVG with `currentColor` so they inherit the surrounding text color automatically.

### 3.2 Icon usage rules

- Default icon color inherits surrounding text — do not hard-code fill colors.
- Pair icons with labels unless the meaning is universally understood.
- Icon-only buttons require `aria-label` and should use the `svgOnly` prop on `<Button>`.
- Use `*-small` size suffixed icon variants (e.g., `check-small`, `bell-small`) in compact UI contexts.
- Do not mix icon styles on the same screen.
- Use platform logo icons only for representing external social networks (Instagram, Twitter/X, LinkedIn, Facebook, YouTube).

---

## 4. Product Principles

### 4.1 Clarity first

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

### 4.2 System over improvisation

The product should feel assembled from a consistent system.

Do not:
- invent one-off radii, shadows, or control heights
- change spacing rhythm between similar screens
- mix unrelated visual styles in one flow
- solve hierarchy problems with novelty

### 4.3 Trustworthy, not flashy

Prefer:
- neutral surfaces using `--ds-background-*` and `--ds-gray-*` tokens
- crisp borders using `--ds-gray-400`
- measured emphasis
- conservative semantic color use
- layouts that hold up under real data

Avoid:
- glassmorphism
- loud gradients across product surfaces
- heavy shadows on standard cards
- playful treatment in analytics, billing, settings, or operational views

### 4.4 Accessibility is part of the design

Readable contrast, visible focus, and non-color cues are mandatory.

Prefer:
- visible focus rings (Geist handles these by default)
- sentence-case labels
- 14px minimum for standard UI text (Body M / `text-label-14`)
- icons or labels that reinforce color-coded meaning

Do not:
- rely on color alone for state
- place critical text on low-contrast fills
- hide interaction states

---

## 5. Theme System

### 5.1 Theme strategy

Theme is controlled via `next-themes` using the `class` strategy on `<html>`.

Current facts:
- default theme is `light`
- `dark` theme is supported and must remain production-ready
- product colors are defined in `socialraven-ui/src/app/globals.css`

Geist color tokens (`--ds-*`) automatically adapt to both light and dark mode — do not conditionally apply dark mode overrides manually unless bridging a gap in local tokens.

### 5.2 Theme rules

- Do not hard-code light-only or dark-only product colors in component classes.
- If a color must work in both themes, it must come from a `--ds-*` token or a local token backed by `--ds-*`.
- Do not rely on third-party default colors without checking both themes.
- Verify every meaningful UI change in both light and dark mode.

---

## 6. Color System

### 6.1 Token convention

Geist uses CSS custom properties prefixed with `--ds-`.

This repo uses a mix of:
- **Geist tokens** (`--ds-*`) — for new work and Geist component integration
- **Local tokens** (`--background`, `--surface`, `--foreground`, etc.) — existing tokens in `globals.css`

When building new UI, prefer `--ds-*` tokens directly. When editing existing components, use whichever token system is already in use in that file, and migrate to `--ds-*` when the task explicitly includes a token refactor.

### 6.2 Geist gray scale

The gray scale is the primary neutral system. Use it for surfaces, text, borders, and chrome.

| Token | Role |
|---|---|
| `--ds-background-100` | Default app canvas background |
| `--ds-background-200` | Secondary background (subtle differentiation) |
| `--ds-gray-100` | Default component background |
| `--ds-gray-200` | Hover background |
| `--ds-gray-300` | Active background |
| `--ds-gray-400` | Default border |
| `--ds-gray-500` | Hover border |
| `--ds-gray-600` | Active border |
| `--ds-gray-700` | High-contrast background |
| `--ds-gray-800` | Hover high-contrast background |
| `--ds-gray-900` | Secondary text and icons |
| `--ds-gray-1000` | Primary text and icons |

Alpha variants: `--ds-gray-alpha-*` — transparent grays for overlays and layered surfaces.

### 6.3 Semantic color scales

Each semantic color has a 10-step scale (e.g., `--ds-blue-100` through `--ds-blue-1000`).

| Color | Use |
|---|---|
| Blue | Primary accent, informational, links, selected states |
| Red | Errors, destructive actions |
| Amber | Warnings, caution states |
| Green | Success, healthy status |
| Teal | Secondary accent |
| Purple | Feature/premium indicators |
| Pink | Marketing, brand moments |

**Component-level semantic tokens:**
- `var(--geist-success)` — success green
- `var(--geist-error)` — error red
- `var(--geist-warning)` — warning amber

### 6.4 Color roles

Think in this order when choosing color:

1. **Neutral** — standard surfaces, text, borders, chrome (`--ds-gray-*`)
2. **Brand** — primary product identity and main action emphasis (SocialRaven blue)
3. **Semantic status** — real meaning: success, warning, error, info
4. **Accent** — non-semantic categorical or decorative use only

### 6.5 Brand color usage

Use SocialRaven blue for:
- primary buttons (`type="default"` on Geist Button)
- selected navigation states
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

### 6.6 Semantic colors

Use semantic colors only for real meaning:
- `--geist-success` / `--ds-green-*` for success and healthy status
- `--geist-warning` / `--ds-amber-*` for caution, limits, or degraded state
- `--geist-error` / `--ds-red-*` for destructive action, severe error, or failed state
- `--ds-blue-*` for informational states when blue emphasis is appropriate

Do not use brand blue as a replacement for semantic meaning.

### 6.7 Mandatory color rules

- Neutral surfaces stay neutral.
- Brand blue marks interaction and selected emphasis, not decoration.
- Semantic colors are reserved for true status meaning.
- Platform brand colors appear only when representing external social networks.
- Never tint entire product sections blue just because the logo is blue.
- Never hard-code hex values — use `--ds-*` tokens so colors adapt to both themes.

---

## 7. Typography

### 7.1 Fonts

| Family | Role |
|---|---|
| **Geist Sans** | Primary UI font for all headings, body, labels, and component text |
| **Geist Mono** | Monospace — code, technical values, IDs, tokens, API keys |

Do not introduce:
- Inter or any other sans-serif family into the protected app
- JetBrains Mono or any other monospace family into the protected app
- Display fonts in the protected app
- Marketing-style typography in operational screens

### 7.2 Type scale

Geist uses three text role categories: **Heading**, **Label**, and **Copy**.

#### Heading scale (bold weight)

| Class | Size | Use |
|---|---|---|
| `text-heading-32` | 32px | Dashboard page headings, major view titles |
| `text-heading-24` | 24px | Primary app page titles |
| `text-heading-20` | 20px | Modal titles, major section headings |
| `text-heading-16` | 16px | Card and panel headings |
| `text-heading-14` | 14px | Small component headings |

Do not use heading classes larger than `text-heading-32` in the protected app — larger sizes (`text-heading-48` and up) are for marketing surfaces only.

Apply `<strong>` as a descendant of a heading class for the "Subtle" heading modifier when you want a de-emphasized variant of the same size.

#### Label scale (single-line text)

| Class | Size | Use |
|---|---|---|
| `text-label-16` | 16px | Section differentiators, prominent labels |
| `text-label-14` | 14px | **Default UI label — menus, nav, form labels** |
| `text-label-14-mono` | 14px | Mono variant for pairing with label-14 contexts |
| `text-label-13` | 13px | Secondary text, tabular data |
| `text-label-13-mono` | 13px | Mono secondary text |
| `text-label-12` | 12px | Tertiary text in dense views |
| `text-label-12-mono` | 12px | Fine-print mono text |

Apply `<strong>` as a descendant for the Strong modifier where additional emphasis is needed inside a label.

#### Copy scale (multi-line text, higher line-height)

| Class | Size | Use |
|---|---|---|
| `text-copy-16` | 16px | Longer descriptions in modals or simpler views |
| `text-copy-14` | 14px | **Most common — standard body copy** |
| `text-copy-13` | 13px | Secondary body text in dense contexts |
| `text-copy-13-mono` | 13px | Inline code references within body copy |

#### Product-specific mapping

| UI element | Style |
|---|---|
| App page title | `text-heading-24` |
| Dialog / modal title | `text-heading-20` |
| Card or panel heading | `text-heading-16` |
| Standard component text / labels | `text-label-14` |
| Body copy / descriptive message | `text-copy-14` |
| Long-form reading text | `text-copy-16` |
| Secondary metadata, timestamps | `text-label-12` or `text-copy-13` |
| Text beside icons | `text-label-14` |
| Chart title | `text-heading-16` or `text-label-14` bold |
| Chart legend, axes, keys | `text-label-12` |
| KPI number | `text-heading-24` or `text-heading-32` |
| Inline code or technical identifiers | `text-copy-13-mono` or `text-label-14-mono` |

### 7.3 Font weights

| Name | Value |
|---|---|
| Regular | `400` |
| Medium | `500` |
| Semibold | `600` |
| Bold | `700` |

Defaults:
- Headings: bold
- Body copy / paragraphs: regular
- Component labels, nav items, text beside icons: medium
- Emphasis within body: bold, sparingly

### 7.4 Accessibility and structure

- Use semantic HTML headings that match the visual hierarchy.
- Use `rem` or Geist's scale classes — do not hard-code px font sizes in one-off styles.
- Keep long-form reading text at 16px equivalent minimum.
- Treat 12px text (`text-label-12`) as fine print — use sparingly.
- Use sentence case by default.
- Avoid all caps except for acronyms or existing component behavior that already requires it.
- Never rely on truncation for important content.
- Use one `h1` per page; keep heading levels sequential.

### 7.5 Typography anti-patterns

Do not:
- create a custom type scale for a single page
- mix too many weights in one viewport
- use oversized headings to compensate for weak layout structure
- use `text-heading-*` styles as decorative large text in operational screens
- use code font to make data feel more technical
- use `text-label-12` as the default size in dense product screens
- stack several text sizes that are visually too close together
- use Geist Mono for prices, dates, table data, or button labels

---

## 8. Analytics and Chart Color Rules

This section is mandatory for dashboards, reports, charts, and KPI views.

### 8.1 Chart UI versus chart data

Use:
- `--ds-gray-1000` / `--ds-gray-900` for chart titles, legend text, and axis labels
- `--ds-gray-900` / `--ds-gray-800` for secondary labels and tick marks
- `--ds-gray-400` for gridlines and chart frames
- Chart color tokens for bars, lines, areas, points, thresholds, and segments

### 8.2 Chart token model

Use these tokens for chart marks. Map to `--ds-*` scale colors:

| Token role | Mapped color |
|---|---|
| `--chart-brand` | SocialRaven blue (primary series) |
| `--chart-neutral` | `--ds-gray-700` (de-emphasized comparisons) |
| `--chart-categorical-1` | `--ds-blue-600` |
| `--chart-categorical-2` | `--ds-teal-600` |
| `--chart-categorical-3` | `--ds-purple-600` |
| `--chart-categorical-4` | `--ds-pink-600` |
| `--chart-categorical-5` | `--ds-amber-600` |
| `--chart-categorical-6` | `--ds-green-600` |
| `--chart-success` | `var(--geist-success)` |
| `--chart-warning` | `var(--geist-warning)` |
| `--chart-danger` | `var(--geist-error)` |

Do not build chart palettes from random Tailwind color classes.

### 8.3 Single-series charts

Use `--chart-brand` as the default. Use `--chart-neutral` for de-emphasized comparisons or historical context.

### 8.4 Multi-series charts

- Use the categorical chart palette with a stable series-to-color mapping.
- Do not repeat brand blue across every series.
- Do not use semantic colors unless the series itself carries semantic meaning.

### 8.5 Status and severity charts

If the chart encodes meaning like health or severity:
- use `--chart-success`, `--chart-warning`, `--chart-danger` appropriately
- do not use categorical hues when the color is supposed to communicate status

### 8.6 Accessibility rules for charts

- Do not rely on color alone to distinguish series.
- Use labels, legends, tooltips, patterns, markers, or direct annotations.
- Do not place text directly on chart colors without verifying contrast.
- Add separation between adjacent segments in stacked bars and pie/donut charts.

### 8.7 Analytics screen visual tone

Analytics views should feel analytical, not decorative.

Prefer:
- clear section titles using `text-heading-16`
- compact legends using `text-label-12`
- small supporting notes in `text-copy-13`
- visible time-range controls
- restrained highlight usage

Avoid:
- glowing charts
- multiple saturated backgrounds
- oversized metric cards fighting with the chart
- decorative gradients in data regions

---

## 9. Spacing, Radius, and Elevation

### 9.1 Spacing

Use a stable spacing rhythm based on Tailwind scale, consistent with Geist component internal rhythm.

Common defaults:
- tight inline spacing: `gap-1.5` or `gap-2`
- control groups: `gap-2` or `gap-3`
- card sections: `gap-4`
- major page sections: `gap-6` or `gap-8`
- card padding: `p-4` or `p-5`
- dialog padding: `p-6`

### 9.2 Radius

Use disciplined rounding consistent with Geist component defaults.

| Element | Radius |
|---|---|
| Buttons and inputs | `8px` |
| Menus and popovers | `8px` |
| Cards and panels | `12px` |
| Dialogs / Modals | `12px` |
| Badges and pills | `full` for pill shape; `4px` for rectangular |

Do not jump between arbitrary radii on the same screen.

### 9.3 Elevation

Prefer borders and surface contrast before shadows.

Use:
- no shadow or very light shadow for standard cards
- moderate shadow for popovers and modals
- `shadow` prop on Geist Button only in marketing contexts paired with `shape="rounded"`

Avoid:
- layered shadows
- ambient glows
- dramatic floating-card treatment on standard content surfaces

---

## 10. Component Guidance

### 10.1 Sourcing

When choosing or building components:
- **use Geist components first** — they are the visual and behavioral source of truth
- **use shadcn/ui only as a fallback** — restyle to align with Geist visual language when used
- do not ship stock shadcn styling unmodified in operational screens
- do not use Atlaskit

### 10.2 Button

```tsx
import { Button, ButtonLink } from 'geist/components';
```

| Variant (`type` prop) | Use |
|---|---|
| `default` | Primary action (uses brand blue) |
| `secondary` | Supporting actions |
| `tertiary` | Low-emphasis actions |
| `error` | Destructive outcomes only |
| `warning` | Cautionary actions |

Rules:
- Standard size: `size="medium"` (default) or `size="large"` for prominent CTAs
- One primary (`type="default"`) action per major section
- Labels should be direct and action-oriented
- Icon-only buttons: use `svgOnly` prop and provide `aria-label`
- Do not use `shape="rounded"` or `shadow` in the protected app — those are for marketing surfaces

### 10.3 Input and Textarea

```tsx
import { Input, Textarea } from 'geist/components';
```

- Keep labels outside the field (label element above, linked via `aria-labelledby`)
- Use `prefix` / `suffix` props for icons or domain prefixes — do not build custom wrappers
- Use `size="small"` for compact/dense contexts
- Validation messages appear below the field via `error` prop on Textarea
- Do not simulate a prefix by nesting elements inside the input

### 10.4 Select

```tsx
import { Select } from 'geist/components';
```

- Use native `<option>` children
- Use `prefix` prop for icon decoration
- Apply `disabled` via prop, not CSS
- For multi-select use cases, use the `MultiSelect` Geist component if available

### 10.5 Badges

```tsx
import { Badge } from 'geist/components';
```

Available variants: `gray`, `gray-subtle`, `blue`, `blue-subtle`, `green`, `green-subtle`, `amber`, `amber-subtle`, `red`, `red-subtle`, `purple`, `purple-subtle`, `teal`, `teal-subtle`, `pink`, `pink-subtle`, `inverted`.

Rules:
- Use semantic variants for real meaning: `green` for success, `amber` for warning, `red` for error
- Use `gray` or `gray-subtle` for neutral/inactive states
- Use `blue` or `blue-subtle` for informational states, not generic decoration
- Keep badges compact — use `size="small"` in dense tables or lists

Use `Pill` (linked badge variant) when the badge needs to be interactive but not as prominent as a button.

### 10.6 Modal / Dialog

```tsx
import { Modal } from 'geist/components';

<Modal.Modal active={open} onClickOutside={() => setOpen(false)} sticky>
  <Modal.Body>
    <Modal.Header>
      <Modal.Title>Title</Modal.Title>
      <Modal.Subtitle>Subtitle</Modal.Subtitle>
    </Modal.Header>
    {/* content */}
  </Modal.Body>
  <Modal.Actions>
    <Modal.Action type="primary" onClick={...}>Confirm</Modal.Action>
    <Modal.Action onClick={...}>Cancel</Modal.Action>
  </Modal.Actions>
</Modal.Modal>
```

Rules:
- Keep titles explicit — use `text-heading-20` equivalent
- Keep confirmation copy short
- Destructive `Modal.Action` should be unmistakably styled (`type="primary"` with `error` or `warning` Button inside, or a clearly labeled action)
- Use `sticky` when modal content scrolls

### 10.7 Tabs

```tsx
import { Tabs } from 'geist/components';

<Tabs
  selected={tab}
  setSelected={setTab}
  tabs={[
    { title: 'Posts', value: 'posts' },
    { title: 'Analytics', value: 'analytics', disabled: true, tooltip: 'Available on Pro' },
  ]}
/>
```

Rules:
- Add `tooltip` to explain disabled tabs — never disable without explanation
- Use `variant="secondary"` for nested tab contexts
- Do not use icon-only tabs without labels in important workflows

### 10.8 Menu (Dropdown)

```tsx
import { MenuContainer, MenuButton, Menu, MenuItem } from 'geist/components';

<MenuContainer>
  <MenuButton type="secondary" showChevron>Actions</MenuButton>
  <Menu width={200}>
    <MenuItem onClick={...}>Edit</MenuItem>
    <MenuItem href="/path">View</MenuItem>
    <MenuItem type="error" onClick={...}>Delete</MenuItem>
  </Menu>
</MenuContainer>
```

Rules:
- Menu supports keyboard navigation and typeahead — do not replicate this manually
- Use `type="error"` for destructive menu items
- Use `MenuItemLocked` for permission-gated actions, not conditional rendering that hides items

### 10.9 Tooltip

```tsx
import { Tooltip } from 'geist/components';

<Tooltip text="Help text" position="top">
  <span>Hover target</span>
</Tooltip>
```

- Always provide tooltips for icon-only actions
- Use `delay={false}` for tooltips on disabled elements
- Tooltips must explain the disabled state when a control is disabled

### 10.10 Toggle

```tsx
import { Toggle } from 'geist/components';

<Toggle checked={on} onChange={() => setOn(b => !b)} aria-label="Enable notifications" />
```

- `aria-label` is required — never omit it
- Use Toggle for boolean on/off states only
- Use `Switch` (segmented control) for multi-option selections, not Toggle

### 10.11 Tabs vs Switch

- `Tabs` — for navigating between distinct content views (URL-driven or state-driven sections)
- `Switch` (segmented control) — for choosing between display modes or filter options without navigating

### 10.12 Checkbox and Radio

```tsx
import { Checkbox, RadioGroup } from 'geist/components';
```

- Use `indeterminate` state on Checkbox for partial selection in tables
- Use `RadioGroup` with `required` for form validation
- Use `Choicebox` / `ChoiceboxGroup` when options need a title and description (e.g., plan selection)

### 10.13 Note (Inline Notification)

```tsx
import { Note } from 'geist/components';

<Note type="warning" size="small" fill>
  This action cannot be undone.
</Note>
```

Variants: `default`, `success`, `error`, `warning`, `secondary`.

Rules:
- Use `Note` for inline contextual messages — not full-page alerts
- Use `fill` for more prominent messages
- Use `action` prop to include a single CTA inside the note (small Button)

### 10.14 Toast (Ephemeral Feedback)

```tsx
const toasts = useToasts();
toasts.message({ text: 'Post scheduled.', preserve: false });
```

- Use Toast for user-action feedback that resolves quickly
- Use `preserve: true` only when the user must actively dismiss
- Toast types: default, success, warning, error

### 10.15 Spinner vs Loading Dots

| Component | Use case |
|---|---|
| `Spinner` | User-triggered loading: button states, pagination, form submission |
| `LoadingDots` | Background process indicators, passive loading states |

### 10.16 Empty State

```tsx
import { EmptyState } from 'geist/components';
```

Always use structured empty states — never leave a blank space without guidance.

Design types to apply by context:
- **Blank Slate** — first-run zero-state with clear CTA
- **Informational** — filtered or search results returned empty
- **Educational** — onboarding moments that explain the feature
- **Guide** — starter content that enables the user to take action

### 10.17 Entity (Resource List Rows)

```tsx
import { Entity } from 'geist/components';
```

Use `Entity` for resource list rows, session/device management, account connection lists, and multi-select list items. Do not build custom list rows when Entity fits.

### 10.18 Skeleton (Loading Placeholder)

```tsx
import { Skeleton } from 'geist/components';
```

Use `Skeleton` to show loading placeholders for content that is being fetched. Prefer wrapping children so reveal is automatic when `show={false}`.

### 10.19 Status Dot

```tsx
import { StatusDot } from 'geist/components';
<StatusDot state="READY" label />
```

States: `QUEUED`, `BUILDING`, `ERROR`, `READY`, `CANCELED`.
Use for connection health, publish status, and account state indicators.

### 10.20 Snippet (CLI / Code Copy)

```tsx
import { Snippet } from 'geist/components';
<Snippet text="npx create-next-app" prompt={false} />
```

Use for copy-to-clipboard code or command values. Prefer over custom copy-button implementations.

### 10.21 Tables and Dense Data

```tsx
import { Table } from 'geist/components';
```

Prefer:
- `Table.Body striped` for alternating row colors in long lists
- `Table.Row` with row hover states
- clear `Table.Head` headers
- compact density for operational screens

Avoid:
- cardifying everything when a table is the correct tool
- hiding critical row actions
- using color alone to convey row state

### 10.22 Progress

```tsx
import { Progress } from 'geist/components';
<Progress value={75} max={100} colors={{ 0: 'var(--ds-gray-1000)', 75: 'var(--geist-success)' }} />
```

Use the `colors` prop with `--ds-*` or `--geist-*` tokens — do not hard-code hex values.

### 10.23 Collapse / Accordion

```tsx
import { Collapse, CollapseGroup } from 'geist/components';
```

Use for FAQ-style content, settings sections with optional detail, and secondary content that can be deferred.

### 10.24 Drawer

```tsx
import { Drawer } from 'geist/components';
```

**Only use Drawer on small/mobile viewports.** On desktop, use Modal or a slide-in panel pattern.

### 10.25 Command Menu

```tsx
import { CommandMenu } from 'geist/components';
```

Use for global search, quick navigation, and power-user keyboard-driven workflows. Trigger with ⌘K.

---

## 11. Navigation

- Active state should be clear and brand-led (SocialRaven blue background or indicator)
- Inactive items should still be easy to scan — use `--ds-gray-900` text
- Structure should prioritize orientation over ornament
- Use `text-label-14` medium weight for nav items
- Active nav items use brand blue text or background; do not use bold weight alone to indicate active state

---

## 12. Cards and Panels

- Use neutral surfaces: `--ds-background-100` or `--ds-gray-100`
- Use `--ds-gray-400` border for card outlines
- Use clear section headings (`text-heading-16`) when content mixes multiple concerns
- Solve grouping with spacing first, dividers second
- Use nested sunken surfaces sparingly
- Prefer border + subtle background over saturated fills for grouped content
- Radius: `12px` for cards and panels

---

## 13. Forms

- Labels above fields always (not floating, not placeholder-as-label)
- Help text below the field using `text-copy-13` or `text-label-12`
- Validation adjacent to the field using semantic red (`--geist-error`)
- Align related controls when viewport width allows
- Group related fields with spacing (`gap-4`) not decorative boxes
- Use Geist `Input`, `Select`, `Textarea`, `Checkbox`, `Radio`, `Toggle` — not custom-built equivalents

---

## 14. What AI Tools Must Not Do

Do not:
- use Lucide icons — use Geist Icons
- use Atlaskit or any `@atlaskit/*` component
- use shadcn when a Geist component exists for the same use case
- ship stock shadcn styling unmodified in operational screens
- treat brand blue as a generic decoration color
- use brand blue as a substitute for semantic warning, success, or danger
- build chart colors from random Tailwind palette classes
- put chart labels, legends, and axes on arbitrary chart colors
- use decorative gradients in protected app workflows
- apply heavy shadows to standard cards
- introduce a second UI font family (Geist Sans is the only UI font)
- introduce a second monospace family (Geist Mono is the only monospace)
- hard-code hex values — use `--ds-*` tokens
- rely on color alone for meaning

---

## 15. Workflow for UI Changes

Whenever redesigning or creating a page:

1. Read this file first.
2. Inspect the local page and nearby components.
3. Preserve business logic and permissions behavior unless behavior changes are requested.
4. Normalize spacing, hierarchy, and state treatment before inventing new visuals.
5. Use Geist components from `geist/components` — shadcn only as a fallback.
6. Use Geist Icons — not Lucide.
7. Use neutral surfaces first and brand emphasis second.
8. Use semantic colors only when the meaning is semantic.
9. For analytics, separate chart-mark colors from chart-interface colors.
10. Verify both light and dark themes.
11. Keep the result production-ready, not exploratory.

---

## 16. Definition of Done

A UI task is not complete unless the result is:
- cleaner than before
- easier to scan
- aligned with this guideline
- consistent with nearby screens
- correct in both light and dark themes
- responsive
- accessible in common states
- using Geist components where available
- using Geist Icons (not Lucide)
- using brand and semantic color correctly
- using analytics colors intentionally and consistently
- using `--ds-*` tokens for color, not hard-coded values
- appropriate for a mature B2B product
