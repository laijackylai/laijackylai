// Shared behaviours for every page (ported from prototype v4 site.js). The chrome itself is JSX in components/layout.tsx;
// this wires it up after each route render and returns a cleanup for the next one.
import { rally } from './rally';

export const PAGES = [
  ['home', 'Home', '/'],
  ['projects', 'Projects', '/projects'],
  ['photography', 'Photography', '/photography'],
  ['music', 'Music', '/music'],
  ['gis', 'GIS', '/gis'],
];
export const SNAP_PAGES = ['/projects', '/photography', '/music', '/gis'];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ── Theme switch beams ─────────────────────────────────
// Light model (top-down, viewBox 400×200, lamps on the right edge pointing left):
// radial falloff from each lamp with a hot spot just ahead of it; a crisp core cone plus a wide, heavily
// blurred penumbra so edges soften with distance; long headlight throw, short wide fog fans; ground spill.
const svgUrl = (defs, body) => 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200" preserveAspectRatio="none"><defs>' + defs +
  '<filter id="n" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>' +
  '<filter id="w" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="15"/></filter>' +
  '<filter id="s" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="22"/></filter>' +
  '</defs>' + body + '</svg>');
const rg = (id, cx, cy, r, stops) => `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}" fx="${cx}" fy="${cy}">` +
  stops.map(([o, a, c]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('') + '</radialGradient>';
const HEAD_Y = [70, 130], FOG_Y = [38, 162]; // fog at screen ~10% / 90% (beam box spans -15%..115%)
const HEAD_STOPS = c => [[0, .8, c], [.05, 1, c], [.28, .82, c], [.55, .45, c], [.8, .15, c], [1, 0, c]];
const FOG_STOPS = (c, e) => [[0, .9, c], [.07, 1, c], [.35, .65, c], [.7, .22, e], [1, 0, e]];
const cone = (x0, y0, x1, half) => `M${x0} ${y0} L${x1} ${y0 - half} L${x1} ${y0 + half}Z`;
const headLayer = HEAD_Y.map((y, i) =>
  `<path filter="url(#w)" opacity=".38" fill="url(#hd${i})" d="${cone(394, y, 0, 66)}"/>` +   // penumbra
  `<path filter="url(#n)" fill="url(#hd${i})" d="${cone(394, y, 0, 38)}"/>`).join('');          // core
const fogLayer = FOG_Y.map((y, i) =>
  `<path filter="url(#w)" opacity=".5" fill="url(#fg${i})" d="${cone(390, y, 190, 78)}"/>` +
  `<path filter="url(#n)" fill="url(#fg${i})" d="${cone(390, y, 200, 50)}"/>`).join('');
const spill = '<ellipse filter="url(#s)" fill="url(#sp)" cx="396" cy="100" rx="70" ry="100"/>';
const BEAMS_SVG = svgUrl(
  HEAD_Y.map((y, i) => rg(`hd${i}`, 394, y, 400, HEAD_STOPS('#fff'))).join('') +
  FOG_Y.map((y, i) => rg(`fg${i}`, 390, y, 200, FOG_STOPS('#fff', '#fff'))).join('') +
  rg('sp', 396, 100, 100, [[0, .6, '#fff'], [1, 0, '#fff']]),
  spill + headLayer + fogLayer);
const FOG_SVG = svgUrl(FOG_Y.map((y, i) => rg(`fg${i}`, 390, y, 200, FOG_STOPS('#FFAA14', '#FFD27A'))).join(''), fogLayer);
// The blurred SVGs are slow to rasterise at full-screen size on every frame of the theme switch:
// bake them to bitmaps once, while idle, and use those instead.
const baked = { beams: `url("${BEAMS_SVG}")`, fog: `url("${FOG_SVG}")` };
let bakeStarted = false;
const bake = () => {
  if (bakeStarted) return;
  bakeStarted = true;
  [['beams', BEAMS_SVG], ['fog', FOG_SVG]].forEach(([k, src]) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 1024; c.height = 512;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      try { baked[k] = `url("${c.toDataURL('image/png')}")`; } catch { /* keep the SVG */ }
    };
    img.src = src;
  });
};

export function initSite({ page, push }) {
  const ac = new AbortController(), signal = ac.signal;
  const cleanups = [];
  const on = (t, ev, fn, o = {}) => t.addEventListener(ev, fn, { ...o, signal });
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(hover: none), (pointer: coarse)').matches;
  const cur = Math.max(0, PAGES.findIndex(p => p[0] === page));
  const later = (fn, ms) => { const t = setTimeout(fn, ms); cleanups.push(() => clearTimeout(t)); };
  ('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(bake);

  // Theme toggle: system default, persisted once the user chooses
  const syncThemeBtns = () => $$('[data-theme-toggle]').forEach(b => b.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'));
  const setTheme = next => {
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
    syncThemeBtns(); dispatchEvent(new Event('themechange'));
  };
  // Dark → light: top-down headlights, car driving right → left across the screen and braking to a stop.
  // Content never disappears: the light theme shows through the beams, a soft wash fills in behind,
  // yellow fog light rides inside the beams, and two red brake lights pulse as the car stops.
  let lightsBusy = false;
  const headlights = () => {
    lightsBusy = true;
    const W = innerWidth, H = innerHeight, DUR = 600;
    root.style.setProperty('--beams', baked.beams);
    root.classList.add('beams');
    const fx = document.createElement('div');
    fx.className = 'beam-fx'; fx.setAttribute('aria-hidden', 'true');
    // L-shaped wraparound tail lights at both rear corners: a bar down the rear (right edge) + a bar along the side
    fx.innerHTML = '<i class="fx-fog"></i><i class="fx-brake"><b class="tl v"></b><b class="tl h"></b><b class="bl v"></b><b class="bl h"></b></i>';
    const fog = fx.firstChild;
    fog.style.backgroundImage = baked.fog;
    const vt = document.startViewTransition(() => { setTheme('light'); document.body.append(fx); });
    const bw = W * 1.7, bh = H * 1.3, by = -H * .15;
    // The car drives through: the lamps (right end of the beam image) travel from off-screen right to the
    // left edge, so at the stop its nose is at the left edge and its tail at the right edge (brake lights).
    // A wash travels with the lamps (solid just ahead of them, soft further ahead) and fills the page at the stop.
    const lamp0 = W + bw, lamp1 = W * .04;
    const beamAt = lamp => `${lamp - bw}px ${by}px`;
    // wash: 3W image, solid from 1.02W in; keep its solid edge 12% ahead of the lamps so nothing dark lingers at the stop
    const washAt = lamp => `${lamp - W * .12 - W * 1.02}px 0px`;
    const drive = 'cubic-bezier(.3,.55,.25,1)'; // brisk entry, decelerating to a stop
    const timing = { duration: DUR, fill: 'both' };
    vt.ready.then(() => {
      root.animate([
        { maskSize: `${bw}px ${bh}px, ${W * 3}px ${H}px`, maskPosition: `${beamAt(lamp0)}, ${washAt(lamp0)}`, easing: drive },
        { maskSize: `${bw}px ${bh}px, ${W * 3}px ${H}px`, maskPosition: `${beamAt(lamp1)}, ${washAt(lamp1)}`, offset: .85, easing: 'ease-out' },
        { maskSize: `${bw}px ${bh}px, ${W * 3}px ${H}px`, maskPosition: `${beamAt(lamp1)}, ${-W * 2}px 0px` },
      ], { ...timing, pseudoElement: '::view-transition-new(root)' });
      // transform, not background-position: composited instead of repainting a full-screen layer each frame
      fog.animate([
        { transform: `translate(${beamAt(lamp0).replace(' ', ',')})`, opacity: 1, easing: drive },
        { transform: `translate(${beamAt(lamp1).replace(' ', ',')})`, opacity: .8, offset: .85 },
        { transform: `translate(${beamAt(lamp1).replace(' ', ',')})`, opacity: 0 },
      ], timing);
    }, () => {});
    Object.assign(fog.style, { inset: 'auto', left: 0, top: 0, width: `${bw}px`, height: `${bh}px`, backgroundSize: '100% 100%', willChange: 'transform, opacity' });
    vt.finished.finally(() => root.classList.remove('beams'));
    setTimeout(() => { fx.remove(); lightsBusy = false; }, DUR + 250);
  };
  // Light → dark: the car drives off. Brake release flash on the right edge, then it pulls away left
  // (accelerating) taking its beams off the left edge, dusk follows from the right, fog lamps linger and dim.
  // The old (light) view sits on top and is masked away, so the content never disappears.
  const taillights = () => {
    lightsBusy = true;
    const W = innerWidth, H = innerHeight, DUR = 380;
    const flash = document.createElement('div');
    flash.className = 'beam-fx release'; flash.setAttribute('aria-hidden', 'true');
    flash.innerHTML = '<i class="fx-brake"><b class="tl v"></b><b class="tl h"></b><b class="bl v"></b><b class="bl h"></b></i>';
    document.body.append(flash);
    setTimeout(() => {
      root.style.setProperty('--beams', baked.beams);
      root.classList.add('leave');
      const fog = document.createElement('div');
      fog.className = 'leave-fog'; fog.setAttribute('aria-hidden', 'true');
      const vt = document.startViewTransition(() => { flash.remove(); setTheme('dark'); document.body.append(fog); });
      const bw = W * 1.7, bh = H * 1.3, by = -H * .15;
      const beamAt = lamp => `${lamp - bw}px ${by}px`;
      vt.ready.then(() => root.animate([
        // layer 1: beams at the stopped position, driven off left; layer 2: light ahead of a soft dusk edge
        { maskSize: `${bw}px ${bh}px, ${W * 3}px ${H}px`, maskPosition: `${beamAt(W * .04)}, ${-W}px 0px` },
        { maskSize: `${bw}px ${bh}px, ${W * 3}px ${H}px`, maskPosition: `${beamAt(-W * .6)}, ${-W * 3}px 0px` },
      ], { duration: DUR, easing: 'cubic-bezier(.55,0,.6,1)', fill: 'both', pseudoElement: '::view-transition-old(root)' }), () => {});
      vt.finished.finally(() => root.classList.remove('leave'));
      setTimeout(() => { fog.remove(); lightsBusy = false; }, DUR + 250);
    }, 80);
  };
  const toggleTheme = () => {
    if (lightsBusy) return;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (reduce) return setTheme(next);
    if (document.startViewTransition) return next === 'light' ? headlights() : taillights();
    // no view transitions: a sheet of the old background dissolves off the new theme
    const veil = document.createElement('div');
    veil.className = 'theme-veil';
    veil.style.background = getComputedStyle(document.body).backgroundColor;
    document.body.append(veil);
    veil.addEventListener('animationend', () => veil.remove());
    setTheme(next);
  };
  $$('[data-theme-toggle]').forEach(b => on(b, 'click', toggleTheme));
  syncThemeBtns();

  // rbrmesh case study arrives by rally car (lib/rally.js); capture runs before next/link's own click handler
  on(document, 'click', ev => {
    const a = ev.target.closest?.('a[href="/projects/rbrmesh"]');
    if (!a || reduce || !document.startViewTransition || ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    ev.preventDefault(); ev.stopPropagation();
    rally(push, a.getAttribute('href'));
  }, { capture: true });

  // Segmented indicator: sits on the current page, ghost previews hover, slides to the target on click.
  const seg = $('.seg');
  if (seg) {
    const ind = $('.ind', seg), ghost = $('.ghost', seg), links = $$('a', seg);
    const place = (el, a) => { el.style.left = a.offsetLeft + 'px'; el.style.width = a.offsetWidth + 'px'; };
    const home = () => place(ind, links[cur]);
    ind.style.transition = 'none'; home(); requestAnimationFrame(() => ind.style.transition = '');
    on(window, 'resize', home);
    document.fonts && document.fonts.ready.then(() => !signal.aborted && home());
    links.forEach((a, i) => {
      on(a, 'pointerenter', () => { place(ghost, a); seg.classList.add('hovering'); });
      on(a, 'focus', () => place(ghost, a));
      // slide the indicator; <Link> does the navigation (a second, delayed push raced it and left the old page up)
      on(a, 'click', ev => { if (i !== cur && !ev.metaKey && !ev.ctrlKey && !ev.shiftKey) place(ind, a); });
    });
    on(seg, 'pointerleave', () => seg.classList.remove('hovering'));
  }

  const navbar = $('#navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', scrollY > 8);
  on(window, 'scroll', onScroll, { passive: true }); onScroll();

  // Mobile sheet
  const sheet = $('#sheet'), menuBtn = $('#menu-btn');
  const setSheet = open => {
    sheet.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    $('use', menuBtn).setAttribute('href', open ? '#i-x' : '#i-bars');
    if (open) $('a.item', sheet).focus();
  };
  setSheet(false);
  on(menuBtn, 'click', () => setSheet(!sheet.classList.contains('open')));
  on(document, 'keydown', ev => { if (ev.key === 'Escape' && sheet.classList.contains('open')) { setSheet(false); menuBtn.focus(); } });
  on(document, 'click', ev => { if (sheet.classList.contains('open') && !navbar.contains(ev.target)) setSheet(false); });

  // ── Interactive dot grid (canvas behind .noise-bg sections) ──
  if (!reduce && !coarse) {
    const RADIUS = 240, PUSH = 5, GAP = 18;
    let p = { x: -9999, y: -9999 }, e = { ...p }, raf = 0;
    const layers = $$('.noise-bg').map(el => {
      const c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true');
      el.classList.add('live'); el.prepend(c);
      const L = { el, c, ctx: c.getContext('2d'), w: 0, h: 0, ch: 0, key: '', rgb: getComputedStyle(el).getPropertyValue('--dot').trim() };
      // canvas is viewport-sized and slides with the scroll; a section-sized one was 100MB+ on tall pages
      L.size = () => { const r = el.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
        L.w = Math.ceil(r.width); L.h = Math.ceil(r.height); L.ch = Math.min(L.h, innerHeight); L.key = '';
        c.width = L.w * d; c.height = L.ch * d; c.style.width = L.w + 'px'; c.style.height = L.ch + 'px'; c.style.bottom = 'auto';
        L.ctx.setTransform(d, 0, 0, d, 0, 0); wake(); };
      const ro = new ResizeObserver(L.size); ro.observe(el);
      cleanups.push(() => { ro.disconnect(); c.remove(); el.classList.remove('live'); });
      return L;
    });
    // the loop sleeps once the eased pointer settles and nothing scrolled; any input wakes it
    const draw = () => {
      raf = 0;
      e.x += (p.x - e.x) * .12; e.y += (p.y - e.y) * .12;
      let moved = Math.abs(p.x - e.x) > .1 || Math.abs(p.y - e.y) > .1;
      for (const L of layers) {
        const r = L.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const off = Math.max(0, Math.min(-r.top, L.h - L.ch));
        const key = `${r.top}|${e.x.toFixed(1)}|${e.y.toFixed(1)}|${L.rgb}|${L.ch}`;
        if (key === L.key) continue; // nothing moved: skip the redraw
        L.key = key; moved = true;
        L.c.style.transform = `translateY(${off}px)`;
        const cx = e.x - r.left, cy = e.y - r.top - off, g = L.ctx;
        g.clearRect(0, 0, L.w, L.ch); g.fillStyle = `rgba(${L.rgb}, .2)`; g.beginPath();
        // first grid row at or above the visible top, so dots stay locked to the section
        for (let y = GAP / 2 + Math.max(0, Math.floor((off - GAP) / GAP)) * GAP - off; y < L.ch + GAP; y += GAP) {
          for (let x = GAP / 2; x < L.w; x += GAP) {
            const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy); let px = x, py = y;
            if (d < RADIUS && d > .001) { const f = (1 - d / RADIUS) ** 2 * PUSH; px += dx / d * f; py += dy / d * f; }
            g.moveTo(px + .55, py); g.arc(px, py, .55, 0, 6.2832);
          }
        }
        g.fill();
      }
      if (moved) wake();
    };
    function wake() { if (!raf && !signal.aborted) raf = requestAnimationFrame(draw); }
    cleanups.push(() => cancelAnimationFrame(raf));
    layers.forEach(L => L.size());
    on(window, 'resize', () => layers.forEach(L => L.size())); // viewport height changes the canvas height
    on(window, 'scroll', wake, { passive: true });
    on(window, 'themechange', () => layers.forEach(L => { L.rgb = getComputedStyle(L.el).getPropertyValue('--dot').trim(); L.key = ''; wake(); }));
    on(window, 'pointermove', ev => { p = { x: ev.clientX, y: ev.clientY }; wake(); });
    on(document, 'pointerleave', () => { p = { x: -9999, y: -9999 }; wake(); });
  }

  // Reveal on scroll (re-run when a page re-renders its panels)
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  const watchReveals = () => $$('.reveal:not(.in)').forEach(el => reduce ? el.classList.add('in') : io.observe(el));
  watchReveals();
  cleanups.push(() => io.disconnect());

  // City clocks ([data-tz]) + 12-LED glyph bar (lit by seconds, red at the head)
  const clocks = $$('[data-tz]'), glyph = $('#glyph');
  if (clocks.length) {
    if (glyph) glyph.innerHTML = '<i></i>'.repeat(12);
    const leds = glyph ? [...glyph.children] : [];
    const fmts = clocks.map(c => new Intl.DateTimeFormat('en-GB', { timeZone: c.dataset.tz, hour: '2-digit', minute: '2-digit', hour12: false }));
    // EST/EDT label follows daylight saving
    const abbrs = $$('[data-tz-abbr]').map(el => [el, new Intl.DateTimeFormat('en-US', { timeZone: el.dataset.tzAbbr, timeZoneName: 'short' })]);
    const tick = () => {
      const now = new Date();
      clocks.forEach((c, i) => {
        const [h, m] = fmts[i].format(now).split(':');
        if (c.dataset.hm !== h + m) { c.dataset.hm = h + m; c.innerHTML = `${h}<span class="colon">:</span>${m}`; }
      });
      abbrs.forEach(([el, f]) => el.textContent = f.formatToParts(now).find(p => p.type === 'timeZoneName').value);
      const lit = Math.floor(now.getSeconds() / 5);
      leds.forEach((l, i) => l.className = i < lit ? 'on' : i === lit ? 'red' : '');
    };
    tick(); const t = setInterval(tick, 1000); cleanups.push(() => clearInterval(t));
  }

  // Back/forward between #hash entries of this page: Next's manual scroll restoration (next.config) skips them, so
  // do what the browser would. Other pages' entries change the pathname and are Next's to restore.
  const ownPath = location.pathname;
  on(window, 'popstate', () => {
    if (location.pathname !== ownPath) return;
    const el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    el ? el.scrollIntoView({ behavior: 'instant' }) : scrollTo({ top: 0, behavior: 'instant' });
  });

  // Back-to-top button
  const toTop = $('.to-top');
  if (toTop) {
    on(window, 'scroll', () => toTop.classList.toggle('show', scrollY > innerHeight * .6), { passive: true });
    on(toTop, 'click', () => { scrollTo({ top: 0 }); $('.nav-brand').focus({ preventScroll: true }); });
  }

  // Copy email: factual feedback
  $$('footer.site [data-copy]').forEach(b => on(b, 'click', async () => {
    const st = $('#copy-status');
    try { await navigator.clipboard.writeText(b.dataset.copy); st.textContent = 'Address copied.'; }
    catch { st.textContent = `Could not copy. Address: ${b.dataset.copy}`; }
  }));

  // ── Section pager (full-page scroll pages) ─────────────
  // Panels: title screen + every .snap / .photo. Label from data-pager, else first dot-num, else "Index".
  // More than MAX_DOTS panels (photography): a tape scrubber, a fixed rail with a playhead and a frame counter.
  const isSnap = root.classList.contains('snap-page');
  const MAX_DOTS = 12;
  let panels = [];
  const pager = isSnap ? document.createElement('nav') : null;
  const pad2 = n => String(n).padStart(2, '0');
  let frameAt = 0; // the frame shown, or the one a key/drag just asked for (the observer lags a smooth scroll)
  const setCurrent = i => {
    frameAt = i;
    if (pager.classList.contains('scrub')) {
      const last = panels.length - 1;
      pager.style.setProperty('--at', i / last);
      $('.scrub-now', pager).textContent = pad2(i);
      const rail = $('.scrub-rail', pager);
      rail.setAttribute('aria-valuenow', i);
      rail.setAttribute('aria-valuetext', i ? `Frame ${pad2(i)} of ${pad2(last)}` : 'Index');
    } else $$('button', pager).forEach((b, j) => j === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'));
  };
  const pagerIO = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) setCurrent(panels.indexOf(en.target));
  }), { threshold: .55 });
  const go = (i, smooth) => {
    i = Math.max(0, Math.min(panels.length - 1, i));
    if (pager.classList.contains('scrub')) setCurrent(i);
    panels[i]?.scrollIntoView({ behavior: smooth && !reduce ? 'smooth' : 'auto' });
  };
  const buildPager = () => {
    watchReveals();
    if (!pager) return;
    pagerIO.disconnect();
    panels = $$('.page-head, .snap, .photo');
    const last = panels.length - 1;
    const scrub = panels.length > MAX_DOTS;
    pager.classList.toggle('scrub', scrub);
    const labelOf = el => el.dataset.pager || ($('.dot-num', el)?.textContent.trim().split('/')[0]) || 'Index';
    pager.innerHTML = scrub
      ? `<p class="scrub-count dot-num" aria-hidden="true"><span class="scrub-now">00</span><span>${pad2(last)}</span></p>`
        + `<div class="scrub-rail" role="slider" tabindex="0" aria-label="Photo frame" aria-orientation="vertical" aria-valuemin="0" aria-valuemax="${last}" aria-valuenow="0" aria-valuetext="Index" style="--ticks:${last / 10}"><i class="scrub-head"></i></div>`
      : panels.map((el, i) => {
        const label = el.matches('.page-head') ? 'Index' : labelOf(el);
        return `<button type="button" data-i="${i}" data-label="${label}" aria-label="Go to ${label}"><i></i></button>`;
      }).join('');
    if (scrub) setCurrent(0);
    panels.forEach(el => pagerIO.observe(el));
  };
  if (pager) {
    pager.className = 'pager';
    pager.setAttribute('aria-label', 'Sections on this page');
    document.body.append(pager);
    on(pager, 'click', ev => { const b = ev.target.closest('button'); if (b) go(+b.dataset.i, true); });
    // scrubber: press or drag anywhere on the rail jumps to that frame; arrows/PageUp/Home/End when focused
    const railIndex = ev => {
      const r = $('.scrub-rail', pager).getBoundingClientRect();
      return Math.round(Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height)) * (panels.length - 1));
    };
    let dragging = false;
    on(pager, 'pointerdown', ev => {
      if (!ev.target.closest('.scrub-rail')) return;
      dragging = true; ev.target.closest('.scrub-rail').setPointerCapture(ev.pointerId); ev.preventDefault();
      go(railIndex(ev));
    });
    on(pager, 'pointermove', ev => { if (dragging) go(railIndex(ev)); });
    on(pager, 'pointerup', () => { dragging = false; });
    on(pager, 'pointercancel', () => { dragging = false; });
    on(pager, 'keydown', ev => {
      if (!ev.target.closest('.scrub-rail')) return;
      const to = { ArrowDown: frameAt + 1, ArrowRight: frameAt + 1, ArrowUp: frameAt - 1, ArrowLeft: frameAt - 1, PageDown: frameAt + 10, PageUp: frameAt - 10, Home: 0, End: panels.length - 1 }[ev.key];
      if (to === undefined) return;
      ev.preventDefault(); go(to, true);
    });
    cleanups.push(() => pager.remove());
  }
  cleanups.push(() => pagerIO.disconnect());
  on(window, 'panelschange', buildPager);
  buildPager();

  // ── Keyboard shortcuts ─────────────────────────────────
  const keys = $('#keys');
  $$('[data-keys-open]').forEach(b => on(b, 'click', () => keys.showModal()));
  on($('[data-keys-close]', keys), 'click', () => keys.close());
  on(keys, 'click', ev => { if (ev.target === keys) keys.close(); });
  const step = dir => {
    if (isSnap && panels.length) {
      const i = panels.findIndex(p => p.getBoundingClientRect().top > -innerHeight / 2);
      const next = panels[Math.min(panels.length - 1, Math.max(0, (i < 0 ? panels.length - 1 : i) + dir))];
      next.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    } else scrollBy({ top: dir * innerHeight * .8, behavior: reduce ? 'auto' : 'smooth' });
  };
  on(document, 'keydown', ev => {
    if (ev.metaKey || ev.ctrlKey || ev.altKey || ev.defaultPrevented) return;
    if (ev.target.closest('input, textarea, select, [contenteditable]') || $('dialog[open]:not(#keys)')) return;
    const k = ev.key;
    if (k >= '1' && k <= '5') push(PAGES[+k - 1][2]);
    else if (k === 'j' || k === 'J') step(1);
    else if (k === 'k' || k === 'K') step(-1);
    else if (k === 't' || k === 'T') toggleTheme();
    else if (k === '?') keys.open ? keys.close() : keys.showModal();
    else return;
    ev.preventDefault();
  });

  // ── Title glitch: cyberpunk faces shown as fractured glass, then Michroma ──
  // 1st = Cyber Blast, chosen by Jacky. Faces without an @font-face (unlicensed demos) are skipped.
  // optional 4th field: stroke width to embolden a single-weight face
  let FLICKS = [['"Cyber Blast"', 400, 'normal', '.05em'], ['RaXOR', 400, 'normal'], ['"Street Wolfker"', 400, 'normal'], ['"Zerbydoo Screen"', 400, 'normal'], ['"Riot Funky"', 400, 'normal']];
  const FLICK_MS = 90;
  const POP = ['255,46,136', '0,240,255', '255,230,0', '57,255,20', '161,59,255']; // hot pink, cyan, acid yellow, lime, violet
  // Fractured glass: radial wedges from a random impact point, each split by a ring crack into an inner and an
  // outer shard. Returns [{ poly: 'x% y%, …', ang, ring }] covering the whole box (points may lie outside it).
  const fracture = n => {
    const cx = 25 + Math.random() * 50, cy = 25 + Math.random() * 50, R = 260, r = 22 + Math.random() * 20;
    const st = Math.PI * 2 / n, a0 = Math.random() * st;
    const angs = Array.from({ length: n }, (_, j) => a0 + st * j + (Math.random() - .5) * st * .6);
    const pt = (a, d) => `${(cx + Math.cos(a) * d).toFixed(1)}% ${(cy + Math.sin(a) * d * 2.4).toFixed(1)}%`; // wide box: stretch y
    return angs.flatMap((a, j) => {
      const b = j === n - 1 ? angs[0] + Math.PI * 2 : angs[j + 1], mid = (a + b) / 2;
      return [
        { poly: `${cx}% ${cy}%, ${pt(a, r)}, ${pt(b, r)}`, ang: mid, ring: 0 },
        { poly: `${pt(a, r)}, ${pt(a, R)}, ${pt(b, R)}, ${pt(b, r)}`, ang: mid, ring: 1 },
      ];
    });
  };
  // Draw the current face as shards: glass pieces nudged outward from the impact + pop-colour refractions
  // behind them. Strength k (1 → .2) dials shard count, spread and colour down face by face.
  const shatter = (el, k) => {
    let glass = el.querySelector('.glass');
    if (!glass) { glass = document.createElement('span'); glass.className = 'glass'; glass.setAttribute('aria-hidden', 'true'); el.append(glass); }
    const text = el.firstChild.textContent, n = 3 + Math.round(5 * k), spread = 1 + 9 * k ** 1.3, a = (.35 + .6 * k).toFixed(2);
    const layer = (poly, x, y, rot, color) =>
      `<span style="clip-path:polygon(${poly});transform:translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg);color:${color}">${text}</span>`;
    glass.innerHTML = fracture(n).map(({ poly, ang, ring }) => {
      const d = spread * (ring ? 1 : .35) * (.6 + Math.random() * .6), x = Math.cos(ang) * d, y = Math.sin(ang) * d * .5;
      const rot = (Math.random() - .5) * 2.4 * k * (ring ? 1 : .4), c = POP[Math.floor(Math.random() * POP.length)];
      return layer(poly, x * 2.2, y * 2.2, rot, `rgba(${c},${a})`) + layer(poly, x, y, rot, 'var(--foreground)');
    }).join('');
  };
  const RESET = ['fontFamily', 'fontWeight', 'fontStyle', 'fontSize', 'textIndent', 'webkitTextStroke', 'width', 'height', 'lineHeight', 'whiteSpace', 'textAlign', 'position', 'color'];
  const flick = el => {
    if (reduce || !FLICKS.length || el.dataset.flicking || el.dataset.cool) return;
    el.dataset.flicking = '1';
    // lock the box to its final (Michroma) size so nothing around the word shifts; faces render centred inside it
    const { width, height } = el.getBoundingClientRect();
    const size = parseFloat(getComputedStyle(el).fontSize) * 1.15; // flick faces sit slightly bigger than the resting word
    Object.assign(el.style, { width: `${width}px`, height: `${height}px`, lineHeight: `${height}px`, fontSize: `${size}px`, whiteSpace: 'nowrap', textAlign: 'center', webkitTextStroke: '0', position: 'relative', color: 'transparent' });
    let i = 0;
    (function next() {
      if (signal.aborted) return;
      if (i < FLICKS.length) {
        const [face, weight, style, bold] = FLICKS[i++];
        el.style.fontFamily = `${face}, var(--font-display)`; el.style.fontWeight = weight; el.style.fontStyle = style;
        el.style.webkitTextStroke = bold ? `${bold} transparent` : '0';
        el.style.setProperty('--shard-stroke', bold || '0');
        // very wide faces shrink just enough to stay inside the screen
        el.style.fontSize = `${size}px`;
        const range = document.createRange(); range.setStart(el.firstChild, 0); range.setEnd(el.firstChild, el.firstChild.length);
        const w = range.getBoundingClientRect().width, max = innerWidth * .94;
        const fw = w > max ? max : w;
        if (w > max) el.style.fontSize = `${size * max / w}px`;
        // text wider than the locked box overflows to the right only; pull it back so it stays centred
        el.style.textIndent = fw > width ? `${(width - fw) / 2}px` : '0';
        shatter(el, 1 - (i - 1) / FLICKS.length);
        later(next, FLICK_MS);
      } else {
        el.querySelector('.glass')?.remove();
        RESET.forEach(k => el.style[k] = '');
        el.style.removeProperty('--shard-stroke');
        delete el.dataset.flicking;
        el.dataset.cool = '1'; later(() => delete el.dataset.cool, 600); // one replay per hover
      }
    })();
  };
  const flickTargets = $$('.snap-page .page-head h1'); // only the centred title-screen word
  const flickIO = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { flick(en.target); flickIO.unobserve(en.target); } }), { threshold: .6 });
  cleanups.push(() => {
    flickIO.disconnect();
    flickTargets.forEach(el => { el.querySelector('.glass')?.remove(); RESET.forEach(k => el.style[k] = ''); delete el.dataset.flicking; delete el.dataset.cool; });
  });
  // webfonts only download when first used, so fetch every flick face before the first (on-load) flick
  const flickFonts = document.fonts && flickTargets.length
    ? Promise.all(FLICKS.map(([face, w, st]) => document.fonts.load(`${st} ${w} 80px ${face}`, flickTargets.map(el => el.textContent).join('')).then(f => f.length > 0, () => false)))
        .then(ok => { FLICKS = FLICKS.filter((_, i) => ok[i]); })
    : Promise.resolve();
  flickFonts.then(() => !signal.aborted && flickTargets.forEach(el => flickIO.observe(el)));
  flickTargets.forEach(el => on(el, 'pointerenter', () => flick(el)));

  root.dataset.siteReady = page; // behaviours are wired: e2e tests wait for this
  return () => { ac.abort(); cleanups.forEach(f => f()); delete root.dataset.siteReady; };
}
