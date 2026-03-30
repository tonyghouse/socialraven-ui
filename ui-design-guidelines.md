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
- Clear
- Confident
- Structured
- Trustworthy
- Operationally mature for US and EU customers

The visual tone is **Atlassian design system inspired**: practical, collaborative, legible, and enterprise-ready. The product should feel like software teams can rely on every day, not a trendy dashboard experiment.

The interface should not look like:
- a glossy startup landing page
- a dark-only power-tool aesthetic
- a template-heavy admin dashboard
- a playful consumer app
- a Linear clone

The reference direction is Atlassian products and patterns: calm surfaces, strong hierarchy, obvious actions, generous readability, and disciplined use of blue.

Component direction:
- Prefer Atlassian components and Atlassian-style interaction patterns when available and appropriate
- Use shadcn/ui as a fallback implementation layer, not as the visual source of truth
- If a shadcn primitive conflicts with Atlassian behavior, spacing, or hierarchy, adapt it to the Atlassian system

---

## 2. Non-Negotiable Principles

### 2.1 Clarity over personality

Every screen must make the primary action obvious.

Prefer:
- plain language
- stable layouts
- visible labels
- predictable controls
- obvious state changes

Avoid:
- decorative UI that competes with the task
- clever but unclear interaction patterns
- hiding important actions behind icon-only affordances
- over-styled empty states in serious workflow areas

### 2.2 Systematic, not dramatic

Atlassian-style UI works because it is consistent. The product should feel assembled from a system, not individually art-directed screen by screen.

Do not:
- mix multiple visual styles in one flow
- change spacing rhythm between similar screens
- invent one-off radii, colors, or control heights
- use visual novelty to solve hierarchy problems

### 2.3 Enterprise trust matters

The UI should signal reliability and operational maturity.

Prefer:
- clear separators
- readable forms
- modest emphasis
- conservative semantic color use
- layouts that stay stable as data changes

Do not:
- rely on heavy gradients or glass effects
- overuse shadows
- create loud, saturated surfaces
- make serious settings pages feel playful

### 2.4 Accessibility is part of the look

Readable contrast, focus treatment, and large enough targets are part of the design quality bar.

Prefer:
- visible focus rings
- sentence-case labels
- 14px minimum for standard UI text
- states that do not depend on color alone

---

## 3. Themes

SocialRaven ships **both light and dark themes**. Both must feel intentional, but the Atlassian-inspired baseline should be designed in light mode first, then translated carefully to dark.

Theme is controlled via the `class` strategy on `<html>` via `next-themes`.

### 3.1 Light theme — primary

Light mode should be the flagship experience.

Character:
- soft neutral page background
- white or near-white content surfaces
- crisp borders
- restrained blue accents
- strong readability without looking stark

### 3.2 Dark theme — secondary but polished

Dark mode should keep the same information architecture, not become a different visual language.

Character:
- deep navy-charcoal backgrounds, not pure black
- clearly separated layers
- slightly brighter borders than a typical dark SaaS UI
- the same blue accent family, tuned for contrast

---

## 4. Color System

### 4.1 Canonical brand palette

The canonical brand palette for SocialRaven's Atlassian-aligned UI is:

- **Squid Ink — `#172B4D`**
- **White — `#FFFFFF`**
- **Pacific Bridge — `#0052CC`**

These values should be treated as the brand-reference colors for logo work, key product theming, and any design-system decisions that need a canonical Atlassian base.

### 4.2 Primary accent

**Pacific Bridge — `#0052CC`**

This is the primary product accent for SocialRaven and should also drive the logo direction by default.

Use this blue for:
- primary actions
- active navigation state
- links
- focus rings
- selected states
- important progress or attention moments that are not semantic alerts

Do not use this blue for:
- large background washes
- decorative gradients across product surfaces
- multiple competing highlights in the same viewport

### 4.3 Supporting palette

Use the rest of the Atlassian palette intentionally:

- `#172B4D` Squid Ink for high-emphasis text, strong headers, and dark-surface grounding
- `#FFFFFF` White for primary surfaces and text on dark brand fills
- `#0052CC` Pacific Bridge for the main accent and CTA color

Do not replace semantic tokens with brand colors. Squid Ink is not a status color; Pacific Bridge is not a warning or success color.

### 4.4 Supporting blues

Use a restrained blue ramp around the primary brand color.

Recommended supporting values:
- `#0C66E4` for brighter interactive emphasis
- `#85B8FF` for softer emphasis on dark surfaces
- `#0055CC` for pressed or stronger active states

Do not build a rainbow system around the product. Blue is the product identity; semantic colors are separate.

### 4.5 Light theme tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `220 16% 96%` | app background |
| `--surface` | `0 0% 100%` | cards, panels, dialogs |
| `--surface-raised` | `220 14% 93%` | secondary inner containers |
| `--surface-sunken` | `228 14% 93%` | page sections, table headers |
| `--border` | `223 12% 89%` | default borders |
| `--border-subtle` | `228 14% 93%` | dividers |
| `--foreground` | `218 54% 20%` | primary text, Squid Ink family |
| `--foreground-muted` | `218 25% 35%` | secondary text |
| `--foreground-subtle` | `218 13% 48%` | tertiary text |
| `--accent` | `216 100% 40%` | Pacific Bridge |
| `--accent-hover` | `215 90% 47%` | hover |
| `--accent-active` | `216 100% 34%` | pressed |
| `--accent-foreground` | `0 0% 100%` | text on accent |
| `--destructive` | `12 91% 46%` | destructive states |
| `--warning` | `40 100% 50%` | warning states |
| `--success` | `155 54% 46%` | success states |
| `--info` | `216 100% 40%` | informational states |

### 4.6 Dark theme tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `218 47% 12%` | app background |
| `--surface` | `218 45% 15%` | cards, panels, dialogs |
| `--surface-raised` | `218 38% 18%` | elevated inner containers |
| `--surface-sunken` | `218 52% 10%` | recessed sections |
| `--border` | `218 25% 35%` | default borders |
| `--border-subtle` | `218 32% 24%` | dividers |
| `--foreground` | `0 0% 100%` | primary text |
| `--foreground-muted` | `215 18% 72%` | secondary text |
| `--foreground-subtle` | `216 14% 79%` | tertiary text |
| `--accent` | `215 90% 47%` | brightened Pacific Bridge family |
| `--accent-hover` | `215 100% 76%` | hover |
| `--accent-active` | `216 100% 40%` | pressed |
| `--accent-foreground` | `0 0% 100%` | text on accent |
| `--destructive` | `12 91% 56%` | destructive states |
| `--warning` | `40 100% 50%` | warning states |
| `--success` | `155 54% 46%` | success states |
| `--info` | `215 90% 47%` | informational states |

### 4.7 Color rules

- Neutral surfaces stay neutral
- Pacific Bridge blue marks interaction and selection, not decoration
- Squid Ink should anchor text hierarchy and dark-surface grounding
- Semantic colors are reserved for status and feedback
- Platform brand colors should appear only when representing external networks
- Do not tint whole product areas blue just because the logo is blue

---

## 5. Typography

### 5.1 Typeface

**Inter** remains the product typeface for UI.

Use:
- Inter for all UI, tables, forms, nav, and dashboards
- `font-mono` only where code-like or token-like content genuinely needs it

Do not introduce:
- display fonts in the app shell
- Apple-style system font references as a design direction
- multiple sans-serif families in core product UI

### 5.2 Scale

Use a practical, product-first scale.

| Role | Size | Weight | Tracking |
|------|------|--------|----------|
| Page title | `text-2xl` (24px) | 600 | `-0.01em` |
| Section heading | `text-lg` (18px) | 600 | `-0.005em` |
| Subsection heading | `text-base` (16px) | 600 | `0` |
| UI text / labels | `text-sm` (14px) | 400–500 | `0` |
| Body copy | `text-sm` (14px) | 400 | `0` |
| Caption / metadata | `text-xs` (12px) | 400–500 | `0` |
| Table dense text | `text-xs` to `text-sm` | 400–500 | `0` |

### 5.3 Rules

- Page titles can use `text-2xl font-semibold` in product UI
- Use sentence case everywhere unless a real data label requires otherwise
- Reserve bold for headings, selected values, and important actions
- Secondary text should still be comfortably readable
- Avoid oversized hero-style typography inside the protected app

---

## 6. Iconography

### 6.1 Preferred library

**Atlassian icons via Atlaskit** should be the target icon system.

Preferred pack:
- `@atlaskit/icon`

Rationale:
- it is the closest match to the Atlassian visual language
- it keeps product chrome aligned with the intended brand direction
- it will sit naturally beside an Atlassian-blue logo

Do not mix icon libraries inside the same screen. If migration is partial, new product-facing work should still bias toward the Atlassian icon style.

### 6.2 Style rules

- Use simple, functional icons
- Default icon color should inherit surrounding text color
- Avoid decorative icon backgrounds unless the icon represents a status or object type
- Prefer outline or neutral product icons over playful metaphors

### 6.3 Sizes

| Context | Size |
|---------|------|
| Dense inline UI | `14–16` |
| Standard buttons / inputs / nav | `16` |
| Sidebar / toolbar / tabs | `16–18` |
| Section summaries / cards | `20` |
| Empty states | `24–32` |

### 6.4 Rules

- Pair icons with labels unless the meaning is already standard
- Icon-only actions need clear tooltip text
- Keep icon usage disciplined; not every label needs an icon
- Use platform logos only when representing connected social networks, never as generic decoration

---

## 7. Spacing and Layout

### 7.1 Spacing scale

Stick to the Tailwind default spacing scale.

Common rhythms:
- Tight inline spacing: `gap-1.5` or `gap-2`
- Control groups: `gap-2` or `gap-3`
- Section blocks inside cards: `gap-4`
- Larger page sections: `gap-6` or `gap-8`
- Card padding: `p-4` or `p-5`
- Dialog padding: `p-6`
- Page content padding: `px-6 py-6` or `px-8 py-6`

### 7.2 Border radius

Atlassian-style product UI is slightly softer than the previous Linear direction, but still disciplined.

| Element | Radius | Tailwind class | Notes |
|---------|--------|----------------|-------|
| Layout shell sections | `0–8px` | none or `rounded-lg` only when clearly containerized | Do not over-round page structure |
| Buttons | `8px` | `rounded-lg` | Standard control feel |
| Inputs, selects, textareas | `8px` | `rounded-lg` | Match button language |
| Menus, popovers, tooltips | `8px` | `rounded-lg` | |
| Cards, panels | `12px` | `rounded-xl` | Primary content container |
| Modals, dialogs | `12px` | `rounded-xl` | |
| Pills, tags, avatars | full | `rounded-full` | Only where shape semantics call for it |

Rules:
- Use the same radius for controls across a screen
- Cards can be slightly softer than controls
- Do not jump between `rounded`, `rounded-lg`, `rounded-xl`, and arbitrary values without a system reason
- Avoid extra-soft `rounded-2xl` and above in the protected app

### 7.3 Layout width

Protected pages should use the available horizontal space intelligently.

Prefer:
- full-width app layouts with strong internal grouping
- responsive grids for dashboards
- stable columns for settings and details

Avoid:
- narrow centered layouts for operational screens
- giant empty gutters with compressed content
- overly dense full-width tables without visual grouping

---

## 8. Elevation and Surfaces

### 8.1 Borders and surfaces first

Depth should come primarily from surface contrast and clean borders.

Use:
- `border border-[--border]`
- subtle surface changes between page, card, and nested container
- light shadows only when a component truly floats

### 8.2 Shadow use cases

| Component | Shadow |
|-----------|--------|
| Standard cards | none or `shadow-sm` |
| Hoverable cards | `shadow-sm` |
| Dropdowns / popovers | `shadow-md` |
| Modals / dialogs | `shadow-lg` |
| Sticky toolbars | minimal or none |

Rules:
- Do not stack multiple shadows
- Avoid dramatic blur or soft ambient glows
- Prefer borders over shadow when structure alone can solve the separation

### 8.3 Background effects

Use blur and translucency sparingly.

Allowed:
- mobile sheets
- command-style overlays
- lightweight sticky headers when needed

Not allowed:
- glassmorphism on standard product cards
- decorative blur behind dashboard content

---

## 9. Component Guidance

### 9.0 Component sourcing

When choosing or building a component:

- Prefer Atlassian components, Atlaskit components, or Atlassian interaction patterns when they cleanly fit the use case
- Use shadcn/ui primitives when they are acting as a low-level implementation detail
- Do not let shadcn default styling dictate the product look
- If a component exists in both ecosystems, choose the Atlassian-style version for behavior, layout, spacing, naming, and state treatment
- Wrap or restyle shadcn components as needed so the result reads like Atlassian product UI, not stock shadcn

shadcn is acceptable for:
- low-level primitives
- Radix-backed accessibility scaffolding
- small internal wrappers that will be fully themed to this system

shadcn is not the visual source of truth for:
- page composition
- data-heavy patterns
- settings forms
- navigation
- tables
- banners, notices, or lozenges

### 9.1 Buttons

Hierarchy:
- `primary` for the main action
- `secondary` for supporting actions
- `subtle` or `ghost` for low-emphasis actions
- `destructive` only when the result is destructive

Rules:
- Standard height: `h-9` or `h-10`
- Font: `text-sm font-medium`
- One primary action per major section
- Labels should be direct and short
- Leading icons are preferred over trailing icons when an icon helps recognition

Avoid:
- multiple primary buttons competing in one area
- oversized CTA styling in workspace settings
- ambiguous labels like `Continue` when the action can be explicit

### 9.2 Inputs and selects

- Height: `h-9` or `h-10`
- Labels stay outside the field
- Help text should sit below the field, not replace the label
- Validation text should be specific and adjacent
- Related controls should align in rows when the viewport allows it

### 9.3 Cards and panels

- `bg-[--surface] border border-[--border] rounded-xl`
- Use clear headers when the card contains more than one type of information
- Separate sections with spacing first, dividers second
- Use nested sunken surfaces sparingly for grouped secondary information

### 9.4 Navigation and sidebar

- Navigation should feel structured, not ornamental
- Active item should use a blue-selected state with strong contrast
- Inactive items should remain easy to scan
- Group labels should be subtle but readable
- Sidebar structure should prioritize fast orientation over visual flair

### 9.5 Tables and data views

Data-heavy screens should feel especially Atlassian-like: calm, readable, and operational.

Prefer:
- clear column labels
- sticky headers where useful
- row hover states
- compact density options for large datasets
- filters above the table, not buried elsewhere

Do not:
- rely on color alone to convey state
- add oversized cards when a table is the right tool
- bury row actions behind unpredictable affordances

### 9.6 Badges and lozenges

Atlassian-style status chips should be compact and semantic.

- Use `text-xs font-medium`
- Keep padding tight
- Use semantic fills or subtle outlined treatments
- Reserve blue lozenges for informational or selected states, not decoration

### 9.7 Tabs and segmented controls

- Tabs should be quiet and easy to scan
- Active state can use blue text, underline, or selected container treatment
- Do not turn tabs into loud pills unless the pattern is clearly segmented control behavior

### 9.8 Banners, flags, and notices

- Keep copy concise
- Lead with the status, then the action or explanation
- Use semantic color lightly
- Avoid large marketing-style announcement bars inside the app shell

### 9.9 Modals and dialogs

- Standard widths: `max-w-sm`, `max-w-md`, `max-w-lg`
- Title, body, and footer should be visually separated through spacing
- Confirmation dialogs should be short and explicit
- Dangerous actions must be unambiguous

---

## 10. Motion and Interaction

Animations should support comprehension.

Rules:
- Use short durations: `120–220ms` for most UI transitions
- Favor `ease-out` for enter states
- Keep hover and press states immediate
- Use motion to clarify hierarchy changes, not to entertain

Avoid:
- springy or playful transitions in serious product areas
- long page transitions
- stagger animations on every dashboard render
- loading choreography where a skeleton or direct state update is enough

---

## 11. Audience Fit: US and EU Customers

The product should feel credible to agencies, operators, and teams in both markets.

That means:
- polished but restrained
- secure and administratively trustworthy
- readable under real work conditions
- suitable for collaborative, role-based workflows
- mature enough for procurement-sensitive buyers

The UI should signal:
- reliability
- accountability
- clarity
- teamwork
- business readiness

---

## 12. What to Avoid

Do not introduce:
- Linear-style violet as the system accent
- stock shadcn look-and-feel when an Atlassian-style pattern should be used
- large decorative gradients in the protected app
- multiple competing accent colors in one workflow
- heavy shadows on standard cards
- over-rounded consumer-style components
- playful illustrations in workspace, billing, analytics, or settings flows
- icon-only navigation for non-standard features
- tiny metadata text that weakens readability
- dense data screens without grouping, filters, or hierarchy
- one-off token values that break system consistency

---

## 13. Redesign Workflow

Whenever redesigning an existing page:

1. Read this file first.
2. Inspect the local page and nearby components before making changes.
3. Preserve information architecture unless there is a clear usability issue.
4. Preserve business logic and permissions behavior unless behavior changes are explicitly requested.
5. Improve hierarchy and task clarity before changing style details.
6. Normalize spacing and control patterns before inventing new UI.
7. Use Atlassian blue intentionally, not everywhere.
8. Keep forms, tables, and settings pages especially calm and legible.
9. Verify both light and dark themes after any visual change.
10. Prefer system consistency over a one-screen flourish.

---

## 14. Implementation Notes for CLI Agents

When a user asks for UI work in `socialraven-ui`, the agent should:

1. Read this file first.
2. Inspect the local page and nearby components before redesigning.
3. Use Inter for all product typography.
4. Prefer Atlassian components and Atlassian-style patterns over stock shadcn patterns whenever the component choice matters.
5. Use the canonical palette from this file: Squid Ink `#172B4D`, White `#FFFFFF`, Pacific Bridge `#0052CC`.
6. Prefer Atlaskit iconography (`@atlaskit/icon`) as the intended icon system and avoid mixing icon packs in new UI work.
7. Apply colors through CSS variables, not scattered hardcoded values.
8. Keep the result production-ready, not exploratory.
9. Verify the result in both `light` and `dark` theme classes.
10. Keep interaction patterns obvious and enterprise-appropriate.

When in doubt:
- simplify
- clarify the primary action
- reduce decorative treatment
- strengthen hierarchy
- keep the UI calm, structured, and blue-led

---

## 15. Definition of Done for UI Changes

A UI task is not complete unless the result is:
- visually cleaner than before
- easier to scan
- aligned with this guideline
- consistent with nearby app pages
- correct in both light and dark themes
- responsive
- accessible in common states
- using accent blue intentionally rather than excessively
- appropriate for a premium B2B or prosumer SaaS audience
