# UI/UX Design Guidelines — laijackylai.com

Visual design system for personal portfolio. Desktop-first, light-mode-first, minimal and professional.

This document reflects the **current live implementation**.

---

## 1. Design Principles

1. **Typographic hierarchy drives the layout** — font weight, size, and spacing do the work, not decoration
2. **Black and white foundation** — sapphire blue used sparingly for emphasis, never as background fill
3. **Photography-grade whitespace** — content breathes; dense layouts reserved for data-heavy sections only
4. **Motion with purpose** — animate to guide attention, never to decorate
5. **Sharp geometry** — 0px border-radius everywhere; no rounded corners

---

## 2. Typography

### Font Stack

| Role | Font | CSS Variable | Fallback | Usage |
|------|------|-------------|----------|-------|
| **Display** | Michroma (Google Fonts) | `--font-display` | `'Arial Black', sans-serif` | Page titles, hero text, section headers |
| **Body** | IBM Plex Sans (Google Fonts) | `--font-ibm-plex` | `'Helvetica Neue', Arial, sans-serif` | Paragraphs, descriptions, default text |
| **Mono** | OCR-A (local) | `--font-ocra` | `'Courier New', monospace` | Nav links, technical labels |

Font loading via `@next/font` in `components/font.tsx`. CSS variables applied at root in `_app.tsx`.

### Type Scale

| Token | Size | Line Height | Use |
|-------|------|-------------|-----|
| `display-xl` | 3.75rem (60px) | 1.0 | Hero headline (desktop) |
| `display-lg` | 2.75rem (44px) | 1.05 | Hero headline (mobile), journey year numbers |
| `heading-1` | 2rem (32px) | 1.1 | Section titles (Skills, My Journey) |
| `heading-2` | 1.5rem (24px) | 1.2 | Subsection titles, project headings |
| `heading-3` | 1.125rem (18px) | 1.3 | Card titles, job titles, photo type labels |
| `body-lg` | 1rem (16px) | 1.6 | Lead paragraphs, intro text |
| `body` | 1rem (16px) | 1.6 | Default body copy |
| `body-sm` | 0.875rem (14px) | 1.5 | Captions, metadata, nav links |
| `label` | 0.75rem (12px) | 1.4 | Tags, overlines |

### Typography Rules

- **Headings**: `font-display uppercase tracking-display` — applied globally via `@layer base` on `h1`, `h2`, `h3`
- **Body**: `font-body` — set as default on `body` element via `@layer base`
- **Nav links**: `font-mono text-body-sm uppercase tracking-nav`
- **No italic** in headings — use weight contrast instead
- **Letter spacing**: `tracking-display` = `0.05em`, `tracking-nav` = `0.08em`

### Global Base Styles (globals.css)

```css
@layer base {
    body {
        @apply font-body text-body text-black bg-white antialiased;
    }
    h1, h2, h3 {
        @apply font-display uppercase tracking-display;
    }
}
```

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
└─────────────────────────────────────────────────┘
```

### Color Usage Rules

- **Text on white bg**: `#000000` for headings, `text-gray-600` for body paragraphs
- **Sapphire blue used only for**:
  - Active nav indicator: `border-sapphire-500` (sidebar), `text-sapphire-500` (horizontal)
  - Link underlines on projects page: `decoration-sapphire-500`
  - Focus/hover accent moments
- **Never** use sapphire as full section background
- **Dark sections** (Skills): `bg-gray-900` background, white text
- **Ratio**: ~90% black/white/gray, ~10% sapphire across any given page

---

## 4. Layout

### Landing Page (`/`)

- Full viewport height hero section, content right-aligned
- Social icons top-right with grayscale treatment
- Contact button: ghost style (border, no fill), hover fills black with white text
- Skills section: full-width `bg-gray-900` contrast block
- Journey section: 2-column on desktop (content left, years right), border-b dividers between items

### Subpages

- **Desktop**: Fixed left sidebar nav (`drawer.tsx`), scroll-reactive logo sizing
- **Mobile**: Top bar with hamburger, full-screen slide-out drawer
- **Landing page**: Horizontal nav bar (`horizontalDrawer.tsx`)

### Breakpoints

| Breakpoint | Nav Style | Padding |
|------------|-----------|---------|
| Desktop (≥1024px) | Sidebar (subpages) / Horizontal (landing) | `p-16` / `px-32` |
| Tablet (768–1023px) | Horizontal top bar | `px-5` |
| Mobile (<768px) | Hamburger + slide-out drawer | `p-5` / `p-6` |

---

## 5. Navigation

### Sidebar (`drawer.tsx`)

- Fixed position, logo at top with scroll-reactive sizing (100px → 50px)
- Vertical link list with dynamic gap based on scroll
- Active state: `border-l-4 border-sapphire-500 pl-2`
- Link style: `.cover-underline` (animated underline on hover)
- Nav text: `font-mono text-body-sm uppercase tracking-nav`

### Horizontal Bar (`horizontalDrawer.tsx`)

- Logo left, links right, `40rem` max width
- Active state: `text-sapphire-500`
- Same link and text styles as sidebar

### Mobile Drawer

- Full-screen overlay, slide from left (`-translate-x-full` → `translate-x-0`)
- Semi-transparent black backdrop on right side for close
- Transition: `transform` with CSS transition

---

## 6. Components

### Contact Button (Ghost Style)

```
Background:  transparent
Text:        #000000 (font-mono uppercase text-label tracking-nav)
Padding:     px-6 py-3
Border:      1px solid #000000
Radius:      0px
Hover:       Background fills black via opacity overlay, text → white
Transition:  colors/opacity 200ms
```

### Scroll-to-Top Button

```
Background:  #000000
Text:        #FFFFFF (chevron icon)
Padding:     p-3
Radius:      0px
Position:    fixed bottom-5 right-5 (mobile), bottom-10 right-10 (desktop)
Visibility:  hidden when scrolled to top
```

### Animated Underline Links (`.link-underline`)

```css
background-image: linear-gradient(transparent, transparent), linear-gradient(#000, #000);
background-size: 0 1.5px;            /* collapsed */
background-position: 0 100%;
transition: background-size 0.2s ease-in-out;
/* on hover: background-size: 100% 1.5px */
```

`.cover-underline` wraps `.link-underline` with flex column layout and gap-1.

### Section Headers

```
Font:        font-display (Michroma)
Case:        Uppercase
Tracking:    tracking-display (0.05em)
Size:        text-heading-1 (2rem) for main sections
             text-heading-2 (1.5rem) for subsections
             text-heading-3 (1.125rem) for card/item titles
```

### Journey Items

- 2-column layout: content (2/3 width) left, year numbers right
- Divider: `border-b border-gray-200` between items (except last)
- Company logo links to external site
- Job title: `font-display text-heading-3 uppercase tracking-display`
- Description: `font-body text-body text-gray-600`
- Year: `font-display text-heading-1 lg:text-display-lg`

---

## 7. Animation & Motion

### Entrance Animations (keyframes in tailwind.config.js)

| Animation | Duration | Easing | Use |
|-----------|----------|--------|-----|
| `fade-in-left` | 1.5s | ease-out | Hero headline |
| `fade-in-right` | 2s (guarded by `motion-safe:`) | ease-out | Hero description |
| `fade-in-down` | 2s | ease-out | Available but unused |
| `fade-in-up` | 2s | ease-out | Available but unused |
| `text-reveal` | 1.5s | cubic-bezier(0.77, 0, 0.175, 1) | Text clip animation |

### Scroll Reveal (`RevealOnScroll`)

- Intersection Observer, fires once
- Transition: `opacity-0 translate-y-4` → `opacity-100 translate-y-0`
- Duration: 600ms, ease-out

### Skills Ticker

- Looping vertical slide animation
- `slide-3`: 6s linear infinite (3 items)
- `slide-4`: 8s linear infinite (4 items)
- Staggered via `[animation-delay]`

### Hover Transitions

- Link underlines: 200ms ease-in-out
- Contact button: 200ms for color/opacity
- Image scale on photography page: `hover:scale-105 ease-in duration-100`

### Rules

- Use `motion-safe:` prefix for entrance animations
- Skills ticker runs continuously (intentional)
- No animation longer than 2s

---

## 8. Image Treatment

### Photography Page

- No filters, no borders — photos stand alone
- Aspect ratio preserved, height derived from deterministic hash per photo ID
- Blurred base64 placeholder on load (`placeholder='blur'`)
- Alternating layout: odd items `flex-row-reverse` on desktop
- First 2 photos get `priority` loading, rest lazy-loaded
- Hover: `scale-105` with 100ms ease-in transition
- Background: `bg-gray-100` as loading fallback

### Social Icons

- Grayscale by default via `className="grayscale"`
- Fixed size: 25x25px

### Project Images

- Full-width within container, `bg-gray-100` loading background
- quality={75} for Takcarly screenshots

### General

- All images use `next/image` for optimization
- No rounded corners; 0px radius
- `sizes` attribute set appropriately (e.g., `(min-width: 1024px) 50vw, 100vw` on photography)

---

## 9. Dark Sections

Currently used for Skills section on landing page.

```
Background:     bg-gray-900 (#171717)
Text primary:   text-white
Text labels:    font-body font-bold (skill category names)
Padding:        py-24 lg:py-32
Layout:         Centered content, self-center
```

Projects page also uses `bg-gray-900 text-white` for alternating sections (Canadian Fires, Takcarly).

---

## 10. Anti-Patterns (Do Not)

- Do not use more than 3 font families
- Do not use sapphire blue as background fill for sections
- Do not use rounded corners on containers (keep 0px, sharp)
- Do not add drop shadows to cards or sections
- Do not use colored text for body copy (black/white/gray only)
- Do not mix icon sets (stick with Heroicons + react-icons where already used)
- Do not animate without `motion-safe` guard on entrance animations
- Do not use font sizes outside the type scale
- Do not add inline font-family overrides (e.g., `font-['SomeFont']`)

---

## 11. Tailwind Config Reference

Actual values from `tailwind.config.js`:

```js
colors: {
  sapphire: {
    50:  '#EEF2FF',
    100: '#D4DEFF',
    300: '#7B9AFF',
    500: '#0F52BA',
    700: '#0A3A82',
    900: '#061F4A',
  },
  gray: {
    100: '#F5F5F5',
    200: '#E5E5E5',
    400: '#A3A3A3',
    600: '#525252',
    900: '#171717',
  },
}

fontFamily: {
  display: ['var(--font-display)', 'Arial Black', 'sans-serif'],
  body:    ['var(--font-ibm-plex)', 'Helvetica Neue', 'Arial', 'sans-serif'],
  mono:    ['var(--font-ocra)', 'Courier New', 'monospace'],
  sans:    ['var(--font-ibm-plex)', 'Helvetica Neue', 'Arial', 'sans-serif'],
}

fontSize: {
  'display-xl': ['3.75rem',  { lineHeight: '1.0' }],
  'display-lg': ['2.75rem',  { lineHeight: '1.05' }],
  'heading-1':  ['2rem',     { lineHeight: '1.1' }],
  'heading-2':  ['1.5rem',   { lineHeight: '1.2' }],
  'heading-3':  ['1.125rem', { lineHeight: '1.3' }],
  'body-lg':    ['1rem',     { lineHeight: '1.6' }],
  'body':       ['1rem',     { lineHeight: '1.6' }],
  'body-sm':    ['0.875rem', { lineHeight: '1.5' }],
  'label':      ['0.75rem',  { lineHeight: '1.4' }],
}

letterSpacing: {
  display: '0.05em',
  nav:     '0.08em',
}
```

---

## 12. File Reference

| File | Role |
|------|------|
| `components/font.tsx` | Font definitions (OCR-A local, IBM Plex Sans + Michroma via Google) |
| `pages/_app.tsx` | Applies font CSS variables at root |
| `styles/globals.css` | Base typography layer, link underline animation |
| `tailwind.config.js` | Design tokens (colors, fonts, sizes, animations) |
| `components/drawer.tsx` | Sidebar nav (subpages) |
| `components/horizontalDrawer.tsx` | Horizontal nav (landing) + mobile drawer |
| `components/reviewOnScroll.tsx` | Intersection Observer reveal wrapper |
| `components/animatedText.tsx` | Character-by-character text animation |
