# UI/UX Design Guidelines — laijackylai.com

Visual design system for personal portfolio. Desktop-first, light-mode-first, minimal and professional.

---

## 1. Design Principles

1. **Typographic hierarchy drives the layout** — let font weight, size, and spacing do the work, not decoration
2. **Black and white foundation** — sapphire blue used sparingly for emphasis, never as background fill
3. **Consistent rhythm** — use the spacing scale religiously; no magic numbers
4. **Photography-grade whitespace** — content breathes; dense layouts reserved for data-heavy sections only
5. **Motion with purpose** — animate to guide attention, never to decorate

---

## 2. Typography

### Font Stack

| Role | Font | Fallback | Usage |
|------|------|----------|-------|
| **Display** | Eurostile Extended | `'Arial Black', sans-serif` | Page titles, hero text, section headers |
| **Body** | IBM Plex Sans | `'Helvetica Neue', Arial, sans-serif` | Paragraphs, descriptions, UI labels |
| **Mono** | OCR-A | `'Courier New', monospace` | Code snippets, technical labels, nav links |

### Type Scale

Based on a **1.333 (perfect fourth)** ratio, root `16px`.

| Token | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| `display-xl` | 72px / 4.5rem | 700 | 1.0 | Hero headline (desktop) |
| `display-lg` | 54px / 3.375rem | 700 | 1.05 | Hero headline (mobile) |
| `heading-1` | 40px / 2.5rem | 700 | 1.1 | Section titles |
| `heading-2` | 30px / 1.875rem | 600 | 1.2 | Subsection titles |
| `heading-3` | 22px / 1.375rem | 600 | 1.3 | Card titles, job titles |
| `body-lg` | 18px / 1.125rem | 400 | 1.6 | Lead paragraphs, intro text |
| `body` | 16px / 1rem | 400 | 1.6 | Default body copy |
| `body-sm` | 14px / 0.875rem | 400 | 1.5 | Captions, metadata |
| `label` | 12px / 0.75rem | 500 | 1.4 | Tags, overlines, nav items |
| `mono` | 14px / 0.875rem | 400 | 1.5 | Code, technical labels |

### Typography Rules

- **Headings**: Eurostile Extended, uppercase, letter-spacing `0.05em`
- **Body**: IBM Plex Sans, sentence case, letter-spacing `0`
- **Nav links**: OCR-A, uppercase, letter-spacing `0.08em`, `label` size
- **No italic** in headings — use weight contrast instead
- **Max body line length**: 65ch (approximately 600px at 16px)
- **Paragraph spacing**: `1.5em` between paragraphs

---

## 3. Color System

### Core Palette

```
┌─────────────────────────────────────────────────┐
│  FOUNDATION                                      │
│                                                   │
│  Black         #000000   — Primary text, borders  │
│  White         #FFFFFF   — Primary background     │
│  Gray 100      #F5F5F5   — Subtle background      │
│  Gray 200      #E5E5E5   — Dividers, borders      │
│  Gray 400      #A3A3A3   — Secondary text          │
│  Gray 600      #525252   — Body text alternative   │
│  Gray 900      #171717   — Dark sections bg        │
│                                                   │
├─────────────────────────────────────────────────┤
│  ACCENT — Sapphire Blue                           │
│                                                   │
│  Sapphire 50   #EEF2FF   — Tinted backgrounds     │
│  Sapphire 100  #D4DEFF   — Hover states            │
│  Sapphire 300  #7B9AFF   — Secondary accent        │
│  Sapphire 500  #0F52BA   — Primary accent          │
│  Sapphire 700  #0A3A82   — Hover/active on accent  │
│  Sapphire 900  #061F4A   — Dark accent text         │
│                                                   │
├─────────────────────────────────────────────────┤
│  SEMANTIC                                         │
│                                                   │
│  Success       #16A34A                             │
│  Error         #DC2626                             │
│  Warning       #D97706                             │
└─────────────────────────────────────────────────┘
```

### Color Usage Rules

- **Text on white bg**: `#000000` for headings, `#525252` for body
- **Sapphire blue used only for**:
  - Interactive elements (links, buttons, hover states)
  - Accent borders or underlines
  - Small highlight moments (tags, active nav indicator, focus rings)
- **Never** use sapphire as full section background — keep sections white or `Gray 900` for contrast blocks
- **Dark sections** (like current Skills section): `Gray 900` background, white text, sapphire for interactive elements
- **Ratio**: ~85% black/white/gray, ~15% sapphire blue across any given page

---

## 4. Spacing System

8px base unit. Use only these values:

| Token | Value | Common Use |
|-------|-------|------------|
| `space-1` | 4px | Inline icon gaps |
| `space-2` | 8px | Tight element padding |
| `space-3` | 12px | Button padding, small gaps |
| `space-4` | 16px | Default gap between related items |
| `space-6` | 24px | Card padding, group spacing |
| `space-8` | 32px | Section inner padding |
| `space-12` | 48px | Between content groups |
| `space-16` | 64px | Section padding (mobile) |
| `space-20` | 80px | Section padding (desktop) |
| `space-24` | 96px | Major section breaks |
| `space-32` | 128px | Hero section padding |

### Spacing Rules

- Vertical rhythm between sections: `space-20` minimum on desktop, `space-16` on mobile
- Content within a section uses `space-8` to `space-12` between groups
- Related elements (label + value, icon + text) use `space-2` to `space-4`
- Page horizontal padding: `space-16` desktop, `space-6` mobile

---

## 5. Layout & Grid

### Desktop (≥1024px)

- **Max content width**: 1200px, centered
- **Grid**: 12-column, 24px gutter
- **Sidebar nav (drawer)**: fixed, 200px wide on subpages
- **Hero section**: full viewport height, content right-aligned

### Tablet (768–1023px)

- **Max content width**: 100%, padded 32px sides
- **Grid**: 8-column
- **Nav**: horizontal top bar

### Mobile (<768px)

- **Max content width**: 100%, padded 20px sides
- **Grid**: 4-column
- **Nav**: hamburger → slide-out drawer

### Layout Rules

- Sections alternate between full-width (edge-to-edge for dark bg sections) and contained (max-width for content)
- Journey timeline: 2-column on desktop (content left, years right), stacked on mobile
- Photography grid: maintain current masonry/gallery layout — no changes needed
- Project cards: 2-column grid on desktop, single column mobile

---

## 6. Components

### Buttons

**Primary (CTA)**
```
Background:  #000000
Text:        #FFFFFF (IBM Plex Sans, 500 weight, uppercase, tracking 0.05em)
Padding:     12px 24px
Border:      none
Radius:      0px (sharp corners)
Hover:       Background → Sapphire 500 (#0F52BA)
Transition:  background-color 200ms ease
```

**Secondary (Ghost)**
```
Background:  transparent
Text:        #000000
Padding:     12px 24px
Border:      1px solid #000000
Radius:      0px
Hover:       Background → #000000, Text → #FFFFFF
Transition:  all 200ms ease
```

**Tertiary (Link-style)**
```
Background:  none
Text:        #000000
Decoration:  animated underline (current link-underline style — keep)
Hover:       Underline expands, color stays black
```

### Navigation

- **Desktop subpages**: Fixed left sidebar, logo top, vertical link list
- **Landing page**: Horizontal bar, logo left, links right
- **Active page indicator**: Sapphire 500 left border (4px) on sidebar, sapphire underline on horizontal
- **Font**: OCR-A, uppercase, `label` size, `0.08em` tracking
- **Link hover**: Animated underline (keep current behavior)

### Cards (Journey Items, Projects)

```
Background:  #FFFFFF
Border:      1px solid Gray 200 (#E5E5E5)
Padding:     space-8 (32px)
Shadow:      none (flat design, border-defined)
Hover:       Border → #000000
Transition:  border-color 200ms ease
```

### Section Headers

```
Font:        Eurostile Extended
Weight:      700
Size:        heading-1 (40px)
Case:        Uppercase
Tracking:    0.05em
Decoration:  None (no underlines, no icons)
Alignment:   Left on desktop, center on mobile
```

### Dividers

```
Color:       Gray 200 (#E5E5E5)
Thickness:   1px
Style:       Solid
Margin:      space-12 top and bottom
```

---

## 7. Iconography

- **Style**: Outline/stroke only, 1.5px stroke weight (matches current heroicons usage)
- **Size**: 24px default, 20px for inline, 16px for compact
- **Color**: Inherit from parent text color
- **Source**: Heroicons (already in use) — keep consistent, don't mix icon sets

---

## 8. Animation & Motion

### Principles

- All animations respect `prefers-reduced-motion` (already implemented via `motion-safe:`)
- Entrance animations: fade + translate, 400–600ms, `ease-out`
- Hover transitions: 200ms, `ease`
- No looping animations except the skills ticker (keep current slide animation)

### Standard Transitions

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Links/buttons hover | `background-color`, `color`, `border-color` | 200ms | ease |
| Reveal on scroll | `opacity`, `transform` | 600ms | ease-out |
| Nav drawer (mobile) | `transform` | 300ms | ease-in-out |
| Page transitions | `opacity` | 300ms | ease |

### Rules

- Max 2 animated elements visible simultaneously
- Stagger delay between sequential reveals: 100ms
- No animation longer than 800ms
- Skills ticker: keep current behavior, it works

---

## 9. Image Treatment

### Photography Pages

- No filters, no borders — let photos speak
- Aspect ratio preserved always
- Blurred placeholder on load (already implemented)
- Gallery: consistent gutter spacing using `space-4`

### Logos & Icons

- Grayscale by default (already implemented for social icons)
- Hover: transition to full color, 200ms
- Company logos in journey: contained within consistent height (80px max)

### General

- All images use `next/image` for optimization
- Lazy loading for below-fold content
- No rounded corners on photos; `0px` radius

---

## 10. Dark Sections

For contrast blocks (Skills section, potential future sections):

```
Background:     Gray 900 (#171717)
Text primary:   #FFFFFF
Text secondary: Gray 400 (#A3A3A3)
Accent:         Sapphire 300 (#7B9AFF) — lighter shade for dark bg readability
Borders:        Gray 600 (#525252)
```

---

## 11. Anti-Patterns (Do Not)

- ❌ Use more than 3 font families on a single page
- ❌ Use sapphire blue as background fill for sections
- ❌ Use rounded corners on containers (keep 0px, sharp)
- ❌ Add drop shadows to cards or sections
- ❌ Use colored text for body copy (black/white/gray only)
- ❌ Mix icon sets
- ❌ Use decorative elements (borders, ornaments, gradients) that don't serve function
- ❌ Animate without `motion-safe` guard
- ❌ Use font sizes outside the type scale
- ❌ Use spacing values outside the spacing system

---

## 12. Tailwind Config Mapping

Reference for implementing these guidelines in tailwind.config.js:

```js
// Colors
sapphire: {
  50:  '#EEF2FF',
  100: '#D4DEFF',
  300: '#7B9AFF',
  500: '#0F52BA',
  700: '#0A3A82',
  900: '#061F4A',
}

// Font families
fontFamily: {
  display: ['Eurostile Extended', 'Arial Black', 'sans-serif'],
  body:    ['IBM Plex Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
  mono:    ['OCR-A', 'Courier New', 'monospace'],
}

// Font sizes (with line-height)
fontSize: {
  'display-xl': ['4.5rem',   { lineHeight: '1.0' }],
  'display-lg': ['3.375rem', { lineHeight: '1.05' }],
  'heading-1':  ['2.5rem',   { lineHeight: '1.1' }],
  'heading-2':  ['1.875rem', { lineHeight: '1.2' }],
  'heading-3':  ['1.375rem', { lineHeight: '1.3' }],
  'body-lg':    ['1.125rem', { lineHeight: '1.6' }],
  'body':       ['1rem',     { lineHeight: '1.6' }],
  'body-sm':    ['0.875rem', { lineHeight: '1.5' }],
  'label':      ['0.75rem',  { lineHeight: '1.4' }],
}
```

---

## 13. Summary: Current → Target Changes

| Aspect | Current | Target |
|--------|---------|--------|
| Display font | None (using OCR-A for everything) | Eurostile Extended for headings |
| Body font | Sabon (serif) + global-font class | IBM Plex Sans |
| Mono font | OCR-A (overloaded as primary) | OCR-A (scoped to nav + code only) |
| Accent color | None | Sapphire blue, used sparingly |
| Button style | Mixed (rounded-full, varied) | Sharp corners, consistent states |
| Section headers | Inconsistent (`text-4xl font-extrabold`) | Standardized `heading-1` + Eurostile |
| Spacing | Ad-hoc (`gap-3`, `gap-10`, `gap-14`, `gap-20`) | 8px-based scale |
| Dark section bg | `slate-800` | `Gray 900 (#171717)` |
| Card borders | None / `border-b` only | Consistent `1px solid Gray 200` |
| Font mixing | 3 fonts used inconsistently inline | 3 fonts with clear roles |
| Active nav state | None visible | Sapphire accent indicator |
