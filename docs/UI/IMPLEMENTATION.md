# Design Guidelines Implementation Plan

Step-by-step implementation of `docs/UI/DESIGN_GUIDELINES.md` into this Next.js 13 Pages Router project.
Each step is self-contained and can be verified independently. Execute in order.

Reference: `docs/UI/DESIGN_GUIDELINES.md` for full color codes, type scale, and spacing values.

---

## Step 1: Install Fonts

### 1a. Install IBM Plex Sans via `@next/font`

In `components/font.tsx`, add IBM Plex Sans alongside existing OCR-A:

```tsx
import localFont from "@next/font/local";
import { IBM_Plex_Sans } from "@next/font/google";

const ocra = localFont({
  src: [
    {
      path: '../public/ocr-a/ocr-aregular.ttf',
      weight: '400'
    },
  ],
  variable: '--font-ocra'
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex',
})

export default ocra
export { ibmPlexSans }
```

### 1b. Add Eurostile Extended

Eurostile is a commercial font. Two options:

**Option A — Self-host (if licensed):**
Download Eurostile Extended Bold `.woff2` files, place in `public/fonts/`, and add to `components/font.tsx`:

```tsx
const eurostile = localFont({
  src: [
    {
      path: '../public/fonts/eurostile-extended-bold.woff2',
      weight: '700',
    },
  ],
  variable: '--font-display',
})

export { eurostile }
```

**Option B — Use free alternative (Michroma from Google Fonts):**
Michroma is the closest free geometric extended sans-serif to Eurostile. If licensing Eurostile is not feasible:

```tsx
import { Michroma } from "@next/font/google";

const michroma = Michroma({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
})

export { michroma as eurostile }
```

### 1c. Verify

After this step, `components/font.tsx` exports three font objects: `ocra` (default), `ibmPlexSans`, `eurostile`.

---

## Step 2: Update Tailwind Config

Replace `tailwind.config.js` theme.extend with design system values:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
      },
      fontFamily: {
        display: ['var(--font-display)', 'Arial Black', 'sans-serif'],
        body:    ['var(--font-ibm-plex)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono:    ['var(--font-ocra)', 'Courier New', 'monospace'],
      },
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
      },
      letterSpacing: {
        display: '0.05em',
        nav: '0.08em',
      },
      maxWidth: {
        content: '1200px',
      },
      keyframes: {
        "text-reveal": {
          "0%": { transform: "translate(0, 100%)" },
          "100%": { transform: "translate(0, 0)" },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slide: {
          "0%": { transform: "translateY(100%)", opacity: 0.1 },
          "15%": { transform: "translateY(0)", opacity: 1 },
          "30%": { transform: "translateY(0)", opacity: 1 },
          "45%": { transform: "translateY(-100%)", opacity: 1 },
          "100%": { transform: "translateY(-100%)", opacity: 0.1 },
        },
      },
      animation: {
        "text-reveal": "text-reveal 1.5s cubic-bezier(0.77, 0, 0.175, 1) 0.5s",
        'fade-in-down': 'fade-in-down 2s ease-out',
        'fade-in-up': 'fade-in-up 2s ease-out',
        'fade-in-left': 'fade-in-left 1.5s ease-out',
        'fade-in-right': 'fade-in-right 1.5s ease-out',
        "slide-3": "slide 6s linear infinite",
        "slide-4": "slide 8s linear infinite",
      },
      variants: {
        animation: ["motion-safe"],
      },
    },
  },
  plugins: [],
}
```

### Verify

Run `npm run dev` — no errors. Tailwind classes like `text-sapphire-500`, `font-display`, `font-body`, `text-heading-1` available.

---

## Step 3: Update Global CSS

Replace `styles/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-body text-body text-black bg-white antialiased;
  }

  h1, h2, h3 {
    @apply font-display uppercase tracking-display;
  }
}

.link-underline {
  border-bottom-width: 0;
  background-image: linear-gradient(transparent, transparent), linear-gradient(#000, #000);
  background-size: 0 1.5px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size 0.2s ease-in-out;
}

.link-underline:hover {
  background-size: 100% 1.5px;
  background-position: 0 100%;
}

.cover-underline {
  @apply flex flex-col w-fit link-underline text-black gap-1;
}
```

**Changes from current:**
- Remove `.global-font` class (replaced by `@layer base` body rule)
- Remove `.link-underline-black` (merged into `.link-underline` — only black variant used)
- Remove `.card` utility (unused in actual components, only in `Home.module.css`)
- Add base layer for heading font treatment
- Set body to `font-body` (IBM Plex Sans)

---

## Step 4: Update `_app.tsx` — Apply Font CSS Variables

```tsx
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import ocra from '../components/font'
import { ibmPlexSans, eurostile } from '../components/font'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={`${ocra.variable} ${ibmPlexSans.variable} ${eurostile.variable}`}>
      <Script id="ms-clarity" strategy="afterInteractive">
        {`(function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "hkl116cujk");`}
      </Script>
      <Component {...pageProps} />
    </div>
  )
}
```

**Key change:** Font CSS variables applied at root wrapper. All three fonts available via Tailwind `font-display`, `font-body`, `font-mono`.

---

## Step 5: Update Landing Page (`pages/index.tsx`)

### 5a. Remove inline font-family declarations

Find and replace all instances of `font-['Sabon']` and `font-['Gluten']`. These inline font references must go.

**Before → After mappings:**

| Location | Before | After |
|----------|--------|-------|
| Hero titles (`Data Engineer`, `Software Engineer`) | `font-['Sabon']` + `text-5xl`/`text-8xl` | `font-display text-display-lg lg:text-display-xl uppercase tracking-display` |
| Hero subtitle (`&`) | `text-2xl lg:text-4xl font-normal` | `font-body text-heading-2 lg:text-heading-1 font-normal normal-case tracking-normal` |
| Bio paragraph | `text-lg` + `font-['Sabon']` | `font-body text-body-lg text-gray-600` |
| Skills section title | `text-4xl font-extrabold` + `font-['Sabon']` | `font-display text-heading-1 uppercase tracking-display` |
| Skills labels (`Data Engineering:`, etc.) | `text-lg lg:text-2xl font-medium` + `font-['Sabon']` | `font-body text-body lg:text-heading-3 font-semibold` |
| Skills ticker items | `font-['Gluten']` | `font-body` (remove Gluten entirely) |
| Journey section title | `text-2xl font-bold font-['Sabon']` | `font-display text-heading-1 uppercase tracking-display` |
| Journey job titles | `font-['Sabon'] text-2xl` | `font-display text-heading-3 uppercase tracking-display` |
| Journey descriptions | `font-['Sabon']` | `font-body text-body text-gray-600` |
| Journey years | `text-4xl lg:text-8xl` + `font-['Sabon']` | `font-display text-heading-1 lg:text-display-xl` |

### 5b. Remove `global-font` class from root div

**Before:**
```tsx
<div className={`global-font ${ocra.variable} font-sans w-full`}>
```

**After:**
```tsx
<div className="w-full">
```

Font variables now applied in `_app.tsx`. The `global-font` class is removed (body styles in CSS base layer).

### 5c. Update Skills section background

**Before:**
```tsx
<div className="py-20 flex flex-col gap-3 lg:gap-14 w-full bg-slate-800 text-white font-['Sabon']">
```

**After:**
```tsx
<div className="py-20 flex flex-col gap-3 lg:gap-14 w-full bg-gray-900 text-white">
```

### 5d. Update contact button

**Before:**
```tsx
<a href="mailto:laijackylai@gmail.com" className="border border-black p-2 rounded-full relative overflow-hidden group w-fit">
  <span className="text-black relative group-hover:text-white">contact</span>
  <span className="absolute inset-0 bg-gradient-to-t from-black to-black opacity-0 group-hover:opacity-100"></span>
</a>
```

**After (sharp corners, design system button style):**
```tsx
<a href="mailto:laijackylai@gmail.com" className="border border-black px-6 py-3 relative overflow-hidden group w-fit font-mono uppercase text-label tracking-nav">
  <span className="text-black relative group-hover:text-white transition-colors duration-200">contact</span>
  <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
</a>
```

Changes: `rounded-full` → removed (sharp corners). `p-2` → `px-6 py-3`. Added `font-mono uppercase text-label tracking-nav`. Simplified gradient to solid black.

### 5e. Update Journey section dividers

**Before:**
```tsx
<div className={`... ${index < journeyItems.length - 1 ? 'border-b' : ''} ...`}>
```

**After:**
```tsx
<div className={`... ${index < journeyItems.length - 1 ? 'border-b border-gray-200' : ''} ...`}>
```

### Verify

Run `npm run dev`. Landing page should show:
- Eurostile Extended for "Data Engineer & Software Engineer", section titles, job titles
- IBM Plex Sans for body text, descriptions, bio
- OCR-A only in nav links
- No Sabon or Gluten anywhere
- Skills section bg is `#171717` not `slate-800`
- Contact button has sharp corners

---

## Step 6: Update Navigation Components

### 6a. `components/drawer.tsx` (Sidebar — subpages)

**Nav links — change font class:**

**Before:**
```tsx
<div className='cover-underline'>
  <div className='global-font'>Projects</div>
  <div />
</div>
```

**After:**
```tsx
<div className='cover-underline'>
  <div className='font-mono text-label uppercase tracking-nav'>Projects</div>
</div>
```

Apply to all four nav links (Projects, Photography, Music, GIS). Remove empty `<div />` after each.

**Add active page indicator:**

Import `useRouter` from `next/router`. Add sapphire left border for active page:

```tsx
import { useRouter } from 'next/router';

// Inside component:
const router = useRouter();

// Each nav link:
<li>
  <Link href="/projects">
    <div className={`cover-underline ${router.pathname === '/projects' ? 'border-l-4 border-sapphire-500 pl-2' : ''}`}>
      <div className='font-mono text-label uppercase tracking-nav'>Projects</div>
    </div>
  </Link>
</li>
```

**Remove `global-font` class** from all nav items.

**Gradient background — change colors to design system:**

**Before:**
```tsx
bg-gradient-to-t from-transparent to-white via-white
```

This stays the same (white gradient is correct for light mode).

### 6b. `components/horizontalDrawer.tsx` (Landing page nav)

Same changes as drawer:
- Replace `<div className='global-font'>` with `<div className='font-mono text-label uppercase tracking-nav'>`
- Remove `global-font` class from all 4 nav links
- Add active state using `useRouter` with sapphire underline instead of left border:

```tsx
<div className={`cover-underline ${router.pathname === '/projects' ? 'text-sapphire-500' : ''}`}>
```

**Mobile drawer overlay — update close button:**

**Before:**
```tsx
<button type="button" aria-label="Close navigation menu" className='w-52 bg-gray-400 opacity-30' onClick={toggleDrawer} />
```

**After:**
```tsx
<button type="button" aria-label="Close navigation menu" className='w-52 bg-black opacity-20' onClick={toggleDrawer} />
```

### Verify

Navigation shows OCR-A font, uppercase, with proper tracking. Active page has sapphire indicator.

---

## Step 7: Update Photography Page (`pages/photography/index.tsx`)

### 7a. Remove root font classes

**Before:**
```tsx
<div className={`global-font ${ocra.variable} font-sans`}>
```

**After:**
```tsx
<div>
```

### 7b. Update scroll-to-top button

**Before:**
```tsx
<button ... className='fixed bottom-5 right-5 lg:bottom-10 lg:right-10 p-2 bg-gray-200 rounded-full z-100' ...>
  <svg className="w-6 h-6 text-gray-500" ...>
```

**After:**
```tsx
<button ... className='fixed bottom-5 right-5 lg:bottom-10 lg:right-10 p-3 bg-black text-white z-100' ...>
  <svg className="w-5 h-5" ...>
```

Sharp corners (no `rounded-full`), black bg, white icon. Consistent with button design.

### 7c. Update photo metadata text

**Before:**
```tsx
<div className={`flex flex-col text-xs text-right ...`}>
  <div className='font-bold text-lg'>{p.type}</div>
  <div>{p.id}</div>
  <div>{p.s3key}</div>
  <div>{p.createdAt}</div>
</div>
```

**After:**
```tsx
<div className={`flex flex-col text-right ...`}>
  <div className='font-display text-heading-3 uppercase tracking-display'>{p.type}</div>
  <div className='font-mono text-body-sm text-gray-400'>{p.id}</div>
  <div className='font-mono text-body-sm text-gray-400'>{p.s3key}</div>
  <div className='font-body text-body-sm text-gray-400'>{p.createdAt}</div>
</div>
```

### 7d. Photo hover effect — keep but remove bg color

**Before:**
```tsx
className='object-cover hover:scale-105 transform ease-in duration-100 bg-gray-500'
```

**After:**
```tsx
className='object-cover hover:scale-105 transform ease-in duration-100 bg-gray-100'
```

Lighter placeholder bg while loading.

### Verify

Photography page uses body font by default. Photo type label in display font. Metadata in mono. No serif anywhere.

---

## Step 8: Update Projects Page (`pages/projects/index.tsx`)

### 8a. Remove root font classes

Same as photography:
```tsx
<div className={`global-font ${ocra.variable} font-sans`}>
```
→
```tsx
<div>
```

### 8b. Update section headers

**All project titles — before:**
```tsx
<div className='font-extrabold text-2xl'>Open Source Contribution</div>
```

**After:**
```tsx
<div className='font-display text-heading-2 uppercase tracking-display'>Open Source Contribution</div>
```

Apply to all project section headers: "Open Source Contribution", "Canadian Fires", "NUXT Google Maps", "Takcarly", "Senior Design Project".

### 8c. Update colored section backgrounds

**Canadian Fires — before:**
```tsx
<div className='py-7 lg:py-20 px-5 lg:px-20 bg-amber-700 text-white'>
```

**After:**
```tsx
<div className='py-7 lg:py-20 px-5 lg:px-20 bg-gray-900 text-white'>
```

**Takcarly — before:**
```tsx
<div className='py-7 lg:py-20 px-5 lg:px-20 bg-sky-950 text-white'>
```

**After:**
```tsx
<div className='py-7 lg:py-20 px-5 lg:px-20 bg-gray-900 text-white'>
```

Use `gray-900` for all dark sections. No colored backgrounds — design guideline says no colored section fills.

### 8d. Update subsection labels

**Before:**
```tsx
<div className='font-bold text-xl'>The Tech Stack</div>
```

**After:**
```tsx
<div className='font-display text-heading-3 uppercase tracking-display'>The Tech Stack</div>
```

### 8e. Update scroll-to-top button

Same as photography step 7b — sharp corners, black bg, white icon.

### 8f. Update image containers

**Before:**
```tsx
<Image className='bg-white rounded-md w-full' .../>
```

**After:**
```tsx
<Image className='bg-gray-100 w-full' .../>
```

Remove `rounded-md` (sharp corners per guidelines). Use `gray-100` as loading placeholder.

### 8g. Update link styles

**Before:**
```tsx
<a className='underline' href="...">
```

**After:**
```tsx
<a className='underline decoration-sapphire-500 underline-offset-2 hover:text-sapphire-500 transition-colors duration-200' href="...">
```

Sapphire-colored underline for inline links.

### Verify

Projects page: all headings in Eurostile, body in IBM Plex Sans, dark sections use `#171717`, no colored backgrounds, sharp corners on all images.

---

## Step 9: Update Music Page (`pages/music/index.tsx`)

### 9a. Remove root font classes

```tsx
<div className={`global-font ${ocra.variable} font-sans`}>
```
→
```tsx
<div>
```

### 9b. Update placeholder text

**Before:**
```tsx
<div>Music Page</div>
```

**After:**
```tsx
<div className='font-display text-heading-1 uppercase tracking-display'>Music</div>
```

### Verify

Music page inherits body font. Title in display font.

---

## Step 10: Update GIS Page (`pages/gis/index.tsx`)

### 10a. Remove root font classes

```tsx
<div className={`global-font ${ocra.variable} font-sans lg:px-10`}>
```
→
```tsx
<div className="lg:px-10">
```

### 10b. Update floating label

**Before:**
```tsx
<div className='font-extrabold text-4xl fixed top-5 right-5 opacity-25 -z-50'>GIS</div>
```

**After:**
```tsx
<div className='font-display text-heading-1 uppercase tracking-display fixed top-5 right-5 opacity-10 -z-50'>GIS</div>
```

Lower opacity (0.10 → more subtle). Use display font + heading scale.

### 10c. Update image borders

**Before:**
```tsx
<Image className='bg-white border border-black' .../>
```

**After:**
```tsx
<Image className='bg-gray-100 border border-gray-200' .../>
```

Softer border per design system.

### Verify

GIS page uses body font by default, display font for labels, softer image borders.

---

## Step 11: Delete Unused CSS

### 11a. Delete `styles/Home.module.css`

This file contains leftover Next.js starter styles (`.container`, `.main`, `.footer`, `.title`, `.description`, `.code`, `.grid`, `.card`). None are used in any component or page.

```bash
rm styles/Home.module.css
```

### 11b. Verify no imports reference it

Search codebase for `Home.module.css` — should return zero results.

---

## Step 12: Update `RevealOnScroll` Component

### 12a. Add transform animation (not just opacity)

**Before** (`components/reviewOnScroll.tsx`):
```tsx
const classes = `transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`;

return (
  <div ref={ref} className={classes}>
    {children}
  </div>
);
```

**After:**
```tsx
const classes = `transition-all duration-[600ms] ease-out ${
  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
}`;

return (
  <div ref={ref} className={classes}>
    {children}
  </div>
);
```

Changes: `duration-1000` → `duration-[600ms]` (guideline max 800ms). Added `translate-y` for subtle upward reveal. Added `ease-out`.

---

## Step 13: Final Verification Checklist

After all steps, verify:

- [ ] `npm run build` — no errors
- [ ] `npm run lint` — no errors
- [ ] `npm test` — all tests pass
- [ ] Landing page hero: Eurostile for "Data Engineer & Software Engineer"
- [ ] Landing page bio: IBM Plex Sans
- [ ] Nav links on all pages: OCR-A, uppercase, tracking-nav
- [ ] Active nav state: sapphire indicator visible
- [ ] Skills section: `#171717` background, no Gluten font
- [ ] Journey titles: Eurostile, uppercase
- [ ] Journey descriptions: IBM Plex Sans, `gray-600` text
- [ ] Contact button: sharp corners, black fill on hover
- [ ] Photography metadata: mono font for IDs, display font for type
- [ ] Projects headings: Eurostile, uppercase
- [ ] Projects dark sections: `gray-900` (not amber/sky)
- [ ] All images: no border-radius, `gray-100` loading bg
- [ ] Scroll-to-top buttons: sharp corners, black bg
- [ ] No `font-['Sabon']` anywhere in codebase
- [ ] No `font-['Gluten']` anywhere in codebase
- [ ] No `global-font` class used in components (only in CSS if needed)
- [ ] No `Home.module.css` file exists
- [ ] Inline links: sapphire underline

---

## Files Modified (Summary)

| File | Action |
|------|--------|
| `components/font.tsx` | Add IBM Plex Sans + Eurostile exports |
| `tailwind.config.js` | Add colors, fontFamily, fontSize, letterSpacing |
| `styles/globals.css` | Rewrite with base layer, remove old classes |
| `styles/Home.module.css` | Delete |
| `pages/_app.tsx` | Apply font CSS variables at root |
| `pages/index.tsx` | Replace all inline fonts, update colors, button styles |
| `pages/photography/index.tsx` | Remove font classes, update metadata styles |
| `pages/projects/index.tsx` | Remove font classes, update headers, normalize dark sections |
| `pages/music/index.tsx` | Remove font classes, add display heading |
| `pages/gis/index.tsx` | Remove font classes, soften borders |
| `components/drawer.tsx` | Update nav font, add active state |
| `components/horizontalDrawer.tsx` | Update nav font, add active state |
| `components/reviewOnScroll.tsx` | Update animation duration + add translate |
