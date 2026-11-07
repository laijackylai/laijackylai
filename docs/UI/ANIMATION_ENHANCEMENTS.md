# UI Animation Enhancements — laijackylai.com

Implementation plan for adding life, texture, and interactivity to the portfolio.
All enhancements follow `docs/UI/DESIGN_GUIDELINES.md` — black/white foundation, sapphire accent, sharp geometry, motion with purpose.

Reference existing files: `tailwind.config.js`, `styles/globals.css`, `pages/index.tsx`, `components/horizontalDrawer.tsx`, `components/drawer.tsx`, `components/reviewOnScroll.tsx`, `pages/_app.tsx`.

---

## Priority Order

| # | Enhancement | Impact | Effort |
|---|-------------|--------|--------|
| 1 | Nav link blob interaction | High — new interaction pattern | Medium |
| 2 | Noise texture background | High — removes flat white feel | Low |
| 3 | Journey divider line-draw animation | Medium — replaces static borders | Low |
| 4 | Social icon hover polish | Medium — micro-interaction | Low |
| 5 | Year counter animation | Medium — memorable detail | Medium |
| 6 | Scroll arrow pulse | Low — subtle attention guide | Low |

---

## Enhancement 1: Nav Link Blob Interaction

### What

Replace current `.link-underline` hover on nav links with a sapphire blur blob that tracks cursor, then expands to fill container on click.

### Design Specs

- **Container shape**: Rectangular with border, matching contact button — `border border-black px-6 py-3 relative overflow-hidden`
- **No rounded corners** (per design guidelines: sharp geometry, 0px border-radius)
- **Blob**: 50px circular, `#0F52BA` (sapphire-500) at 15% opacity, `blur-xl` (24px blur radius)
- **Hover behavior**: Blob appears and tracks mouse position within link bounds
- **Click behavior**: Blob scales up to fill entire container, opacity goes to 100%, text color inverts to white. Duration: 250ms, ease-out
- **On navigation/mouse leave**: Hard cut (blob disappears immediately) — no reverse animation needed since page navigates away
- **Text**: Stays `font-mono text-body-sm uppercase tracking-nav` — unchanged
- **Active page state**: Container filled solid sapphire-500, white text (no blob needed, static fill)

### Implementation

#### 1a. Create `components/navLinkBlob.tsx`

New component wrapping each nav link. Uses `onMouseMove` for blob tracking, `onClick` for expand.

```tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useRef, useState, useCallback } from 'react';

type Props = {
  href: string;
  label: string;
};

const NavLinkBlob: React.FC<Props> = ({ href, label }) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [blobPos, setBlobPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const isActive = router.pathname === href;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setBlobPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleClick = useCallback(() => {
    setIsClicked(true);
  }, []);

  return (
    <Link href={href}>
      <div
        ref={containerRef}
        className={`relative overflow-hidden border border-black px-6 py-3 cursor-pointer transition-colors duration-200
          ${isActive ? 'bg-sapphire-500 border-sapphire-500' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsClicked(false); }}
        onClick={handleClick}
      >
        {/* Blob element */}
        {!isActive && (
          <div
            className="absolute pointer-events-none transition-all duration-250 ease-out"
            style={{
              left: isClicked ? '50%' : blobPos.x,
              top: isClicked ? '50%' : blobPos.y,
              width: isClicked ? '400%' : '50px',
              height: isClicked ? '400%' : '50px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              backgroundColor: '#0F52BA',
              opacity: isClicked ? 1 : isHovered ? 0.15 : 0,
              filter: isClicked ? 'none' : 'blur(24px)',
            }}
          />
        )}
        {/* Text */}
        <span className={`relative z-10 font-mono text-body-sm uppercase tracking-nav transition-colors duration-200
          ${isActive || isClicked ? 'text-white' : 'text-black'}`}>
          {label}
        </span>
      </div>
    </Link>
  );
};

export default NavLinkBlob;
```

#### 1b. Update `components/horizontalDrawer.tsx`

Replace current nav link markup in desktop view with `NavLinkBlob`:

**Before:**
```tsx
<Link href='/projects'>
  <div className={navLinkClass('/projects')}>
    <div className={navTextClass}>Projects</div>
  </div>
</Link>
```

**After:**
```tsx
<NavLinkBlob href="/projects" label="Projects" />
```

Apply to all four nav links: Projects, Photography, Music, GIS.

Remove `navLinkClass` and `navTextClass` constants if no longer used elsewhere.
Keep mobile drawer links as-is (blob interaction is desktop-only).

#### 1c. Update `components/drawer.tsx` (sidebar on subpages)

Same replacement — use `NavLinkBlob` for each sidebar link.

Sidebar-specific: links are stacked vertically, so container should be `w-full` instead of inline. Add a prop or variant:

```tsx
<NavLinkBlob href="/projects" label="Projects" />
```

The component already uses `px-6 py-3` which works for both horizontal and vertical layouts.

#### 1d. Update `styles/globals.css`

Remove `.cover-underline` class — no longer needed once all nav links use `NavLinkBlob`.

Keep `.link-underline` only if used elsewhere (check: journey section links, project page links). If only used by nav, remove it too.

#### 1e. Update contact button to match

Contact button already has similar pattern (`border border-black px-6 py-3`). Keep its current hover (solid black fill) — it should NOT get the blob effect. The blob is nav-only. This maintains visual hierarchy: nav links = sapphire blob, contact = black fill.

### Verify

- Hover over nav link → sapphire blob follows cursor behind text
- Click nav link → blob expands to fill container, text turns white, then navigates
- Active page link → solid sapphire fill, white text, no blob
- Mobile nav → unchanged (no blob, standard links)
- Contact button → unchanged (black fill hover)

---

## Enhancement 2: Noise Texture Background

### What

Add subtle procedural noise grain to all white background sections. Removes flat digital feel, adds warmth.

### Design Specs

- **Opacity**: 0.03–0.05 (barely visible, subconscious effect)
- **Coverage**: All white (`bg-white`) sections — hero, journey section, subpage content areas
- **NOT on**: Dark sections (`bg-gray-900`), they keep solid color
- **Method**: CSS SVG filter using `feTurbulence` — no external assets
- **Performance**: Fixed position, `pointer-events: none`, no repaints on scroll
- **Z-index**: 1 (above background, below all content)
- **`motion-safe` guard**: Not needed — this is static texture, not motion

### Implementation

#### 2a. Add SVG filter to `pages/_app.tsx`

Add hidden SVG with noise filter definition inside root wrapper:

```tsx
export default function MyApp({ Component, pageProps }: AppProps) {
    const fontVariables = `${ocra.variable} ${ibmPlexSans.variable} ${eurostile.variable} font-body`

    return (
        <>
            <Script id="ms-clarity" strategy="afterInteractive">
                {/* ... existing clarity script ... */}
            </Script>
            {/* Noise filter definition */}
            <svg className="hidden" aria-hidden="true">
                <filter id="noise-filter">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.65"
                        numOctaves="3"
                        stitchTiles="stitch"
                    />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
            </svg>
            <div className={fontVariables}>
                <Component {...pageProps} />
            </div>
        </>
    )
}
```

#### 2b. Add noise overlay CSS to `styles/globals.css`

```css
.noise-bg::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    opacity: 0.04;
    filter: url(#noise-filter);
}
```

#### 2c. Apply `noise-bg` class to white sections

In `pages/index.tsx`, add to hero section and journey section wrappers:

```tsx
{/* Hero */}
<div className="noise-bg relative h-screen p-5 lg:p-16 pt-0 lg:pt-0 flex flex-col justify-between bg-white z-20">

{/* Journey */}
<div className="noise-bg flex flex-col items-center gap-24 lg:py-24 lg:px-16 p-6">
```

On subpages, add `noise-bg` to main content wrapper (not sidebar).

**Important**: Content inside these sections needs `position: relative; z-index: 2` or higher to sit above the noise layer. Add to globals:

```css
.noise-bg > * {
    position: relative;
    z-index: 2;
}
```

### Verify

- White sections have faint grain texture visible on close inspection
- Text remains fully readable — grain is behind content
- Dark sections (Skills) have no grain
- No performance impact — fixed overlay, no scroll repaints
- Grain does not interfere with click/hover events (`pointer-events: none`)

---

## Enhancement 3: Journey Divider Line-Draw Animation

### What

Replace static `border-b border-gray-200` dividers between journey items with animated lines that draw from left to right when scrolled into view.

### Design Specs

- **Line**: 1px height, `gray-200` color (same as current)
- **Animation**: `scaleX(0)` → `scaleX(1)`, origin left, 800ms ease-out
- **Trigger**: Intersection Observer (reuse `RevealOnScroll` pattern), fires once
- **Width**: Full width of journey item container

### Implementation

#### 3a. Create `components/animatedDivider.tsx`

```tsx
import React, { useEffect, useRef, useState } from 'react';

const AnimatedDivider: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        });

        observer.observe(element);
        return () => { if (element) observer.unobserve(element); };
    }, []);

    return (
        <div
            ref={ref}
            className={`h-px bg-gray-200 origin-left motion-safe:transition-transform motion-safe:duration-[800ms] motion-safe:ease-out ${
                isVisible ? 'scale-x-100' : 'scale-x-0'
            }`}
        />
    );
};

export default AnimatedDivider;
```

#### 3b. Update `pages/index.tsx` journey section

**Before:**
```tsx
<div className={`... ${index < journeyItems.length - 1 ? 'border-b border-gray-200' : ''} ...`}>
```

**After:**
Remove `border-b border-gray-200` from journey item div. Add `AnimatedDivider` between items:

```tsx
{journeyItems.map((item, index) => (
    <React.Fragment key={item.href}>
        <RevealOnScroll>
            <div className="w-full lg:px-32 px-5 pb-10 flex flex-row justify-between items-center">
                {/* ... existing journey item content ... */}
            </div>
        </RevealOnScroll>
        {index < journeyItems.length - 1 && (
            <div className="w-full lg:px-32 px-5">
                <AnimatedDivider />
            </div>
        )}
    </React.Fragment>
))}
```

### Verify

- Scroll to journey section — divider lines draw left-to-right as they enter viewport
- Each line animates independently when it becomes visible
- `prefers-reduced-motion` respected via `motion-safe:` prefix
- Line appearance matches previous static border (same color, same width)

---

## Enhancement 4: Social Icon Hover Polish

### What

Add grayscale-to-color transition and subtle scale on hover for social icons (LinkedIn, GitHub, Instagram).

### Design Specs

- **Default**: `grayscale` (current)
- **Hover**: `grayscale-0 scale-110`, 200ms ease-out
- **No color tinting** — just remove grayscale filter to show original icon colors

### Implementation

#### 4a. Update `pages/index.tsx` social icon images

**Before:**
```tsx
<Image className="grayscale" alt={"linkedin_logo"} src={LinkedinLogo} height={25} width={25} />
```

**After:**
```tsx
<Image className="grayscale hover:grayscale-0 hover:scale-110 transition-all duration-200 ease-out" alt={"linkedin_logo"} src={LinkedinLogo} height={25} width={25} />
```

Apply to all three icons: LinkedIn, GitHub, Instagram.

**Staggered timing** (optional, subtle): Add slight transition-delay to each icon:
- LinkedIn: no delay
- GitHub: `[transition-delay:50ms]`
- Instagram: `[transition-delay:100ms]`

This creates a wave effect when hovering across the icon row quickly.

### Verify

- Hover individual icon → goes from gray to color, scales up slightly
- Hover away → returns to grayscale, normal size
- Transition is smooth, 200ms

---

## Enhancement 5: Year Counter Animation

### What

Journey year numbers animate counting up when scrolled into view. Creates memorable micro-interaction.

### Design Specs

- **Target elements**: Start year and end year in journey items
- **Animation**: Count from 2000 up to target year (e.g., 2000 → 2023), 800ms total
- **Easing**: ease-out (fast start, slow finish — numbers settle into place)
- **"Current" text**: No counter — just fade in
- **Trigger**: Intersection Observer, fires once
- **Font**: Unchanged — `font-display text-heading-1 lg:text-display-lg`

### Implementation

#### 5a. Create `components/animatedYear.tsx`

```tsx
import React, { useEffect, useRef, useState } from 'react';

type Props = {
    target: number;
    className?: string;
};

const AnimatedYear: React.FC<Props> = ({ target, className = '' }) => {
    const [display, setDisplay] = useState(2000);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasAnimated) {
                setHasAnimated(true);
                observer.unobserve(entry.target);

                const start = 2000;
                const duration = 800;
                const startTime = performance.now();

                const animate = (now: number) => {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(start + (target - start) * eased);
                    setDisplay(current);

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                };

                requestAnimationFrame(animate);
            }
        });

        observer.observe(element);
        return () => { if (element) observer.unobserve(element); };
    }, [target, hasAnimated]);

    return (
        <div ref={ref} className={className}>
            {hasAnimated ? display : target}
        </div>
    );
};

export default AnimatedYear;
```

#### 5b. Update `pages/index.tsx` journey year display

**Before:**
```tsx
<div className="font-display text-heading-1 lg:text-display-lg">{item.startYear}</div>
<div className={item.endYear === 'Current' ? 'font-bold' : ''}>- {item.endYear}</div>
```

**After:**
```tsx
<AnimatedYear target={parseInt(item.startYear)} className="font-display text-heading-1 lg:text-display-lg" />
<div className={item.endYear === 'Current' ? 'font-bold' : ''}>
    - {item.endYear === 'Current' ? item.endYear : <AnimatedYear target={parseInt(item.endYear)} className="inline" />}
</div>
```

### Verify

- Scroll to journey item → year numbers count up from 2000 to target
- "Current" text appears without counter
- Animation runs once per item, does not replay
- Numbers use same font styling as before

---

## Enhancement 6: Scroll Arrow Pulse

### What

Add faint radial pulse behind bounce arrow to draw eye toward scroll action.

### Design Specs

- **Pulse**: Expanding ring, sapphire-500 at 5% opacity, 2s infinite
- **Size**: Starts at 24px, expands to 60px, fades out
- **Position**: Behind existing bounce arrow, centered
- **Guard**: `motion-safe:` prefix

### Implementation

#### 6a. Add keyframe to `tailwind.config.js`

```js
keyframes: {
    // ... existing keyframes ...
    'pulse-ring': {
        '0%': { transform: 'scale(1)', opacity: '0.05' },
        '100%': { transform: 'scale(2.5)', opacity: '0' },
    },
},
animation: {
    // ... existing animations ...
    'pulse-ring': 'pulse-ring 2s ease-out infinite',
},
```

#### 6b. Update scroll arrow in `pages/index.tsx`

**Before:**
```tsx
<button type="button" aria-label="Scroll down" onClick={scrollDown}>
    <svg className="w-6 h-6 motion-safe:animate-bounce" ...>
```

**After:**
```tsx
<button type="button" aria-label="Scroll down" onClick={scrollDown} className="relative">
    <span className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-sapphire-500 motion-safe:animate-pulse-ring" />
    <svg className="relative w-6 h-6 motion-safe:animate-bounce" ...>
```

Apply same pattern to scroll-up arrow.

### Verify

- Faint sapphire ring pulses outward behind bouncing arrow
- Pulse is subtle (5% opacity max)
- Respects `prefers-reduced-motion`

---

## Files Modified (Summary)

| File | Action |
|------|--------|
| `components/navLinkBlob.tsx` | **New** — blob hover/click interaction component |
| `components/animatedDivider.tsx` | **New** — line-draw divider component |
| `components/animatedYear.tsx` | **New** — counter animation component |
| `components/horizontalDrawer.tsx` | Replace nav links with `NavLinkBlob` |
| `components/drawer.tsx` | Replace nav links with `NavLinkBlob` |
| `pages/_app.tsx` | Add SVG noise filter definition |
| `pages/index.tsx` | Apply noise-bg, animated dividers, year counters, social hover, arrow pulse |
| `styles/globals.css` | Add `.noise-bg` styles, optionally remove `.cover-underline` |
| `tailwind.config.js` | Add `pulse-ring` keyframe/animation |

---

## Design Constraints Checklist

Before implementing, verify each enhancement against `DESIGN_GUIDELINES.md`:

- [ ] No rounded corners added (sharp geometry rule)
- [ ] Sapphire used only for accent moments, never as section background fill
- [ ] All entrance animations use `motion-safe:` prefix
- [ ] JavaScript-driven animations respect `prefers-reduced-motion`
- [ ] Nav links remain semantic links (`<Link className="...">`) rather than clickable nested divs
- [ ] No animation longer than 2s (pulse-ring is 2s — at limit, acceptable for ambient)
- [ ] No new font families introduced
- [ ] No drop shadows added
- [ ] Color usage stays within defined palette
- [ ] Mobile behavior degraded gracefully (blob → standard hover)

---

## Implementation Review Notes

Reference notes to apply before implementation:

- Use `Link` directly as the interactive element for `NavLinkBlob` instead of wrapping a clickable `div`. This preserves keyboard/focus semantics and avoids nested interactive behavior.
- Replace `duration-250` with `duration-[250ms]`; `duration-250` is not part of the default Tailwind scale in this project.
- Clarify nav scope: desktop links and the subpage/sidebar drawer can use `NavLinkBlob`; the mobile overlay links in `HorizontalDrawer` should stay unchanged unless separately redesigned.
- Prefer a section-scoped noise overlay: `.noise-bg { position: relative; isolation: isolate; }` with `.noise-bg::before { position: absolute; inset: 0; z-index: 0; }`. Avoid `position: fixed` per section unless the goal is one viewport-wide global texture.
- Avoid broad `.noise-bg > * { position: relative; z-index: 2; }` if possible. It can affect nested layout and stacking behavior. Prefer placing the pseudo-element behind content or wrapping content in an explicit `.noise-content` only where needed.
- `AnimatedYear` should check `prefers-reduced-motion` and render the final target immediately when reduced motion is enabled.
- `AnimatedYear` should render a `span` by default, or support an `as` prop, because one planned usage places it inline inside another text container.
- Add `pointer-events-none` and `aria-hidden="true"` to the pulse-ring span behind scroll arrows.
- Treat Enhancement 2 (Noise Texture Background) and Enhancement 5 (Year Counter Animation) as optional after visual QA. They have the highest chance of feeling heavy or introducing stacking/layout issues.

---

## Dependencies

- No new npm packages required
- All implementations use native browser APIs: Intersection Observer, requestAnimationFrame, CSS filters
- SVG filters supported in all modern browsers (Can I Use: 97%+ global support)
