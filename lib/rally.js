// rbrmesh page transition: a top-down rally car does a handbrake hairpin about the bottom-left corner.
// The car body sweeps the old page away (the new page is revealed in a wedge that trails the car),
// leaves four tyre marks and kicks gravel, then powers out off the bottom edge.

// Yaw follows a real handbrake turn: yank (yaw accel 600°/s²) up to 150°/s, hold the slide,
// countersteer catch (500°/s²) to stop at 92°. A real 180° hairpin at these rates takes ~2 s.
const OMEGA = 150, T1 = .25, T3 = .3, TH = 92;
const T2 = (TH - OMEGA * (T1 + T3) / 2) / OMEGA;
export const SWING = T1 + T2 + T3;
export const yaw = t => t <= 0 ? 0
  : t < T1 ? OMEGA / T1 * t * t / 2
  : t < T1 + T2 ? OMEGA * T1 / 2 + OMEGA * (t - T1)
  : t < SWING ? TH - OMEGA / T3 * (SWING - t) ** 2 / 2
  : TH;
// Power out: throttle on during the catch, 1.5 m/s rolling + 0.7 g. Returns metres along the car's nose.
const T_GAS = SWING - .12, V0 = 1.5, ACC = 7;
export const drive = t => t <= T_GAS ? 0 : V0 * (t - T_GAS) + ACC * (t - T_GAS) ** 2 / 2;

// Top-down GC8 coupe (traced from a blueprint top view) with a 22B wing, nose left, 4.34 m × 1.77 m → ~1 cm units. No badges.
const CAR = `<svg class="rally-car" viewBox="0 0 440 200">
<rect class="t" x="62" y="6" width="56" height="20" rx="5" transform="rotate(10 90 16)"/><rect class="t" x="62" y="174" width="56" height="20" rx="5" transform="rotate(-10 90 184)"/>
<rect class="t" x="314" y="7" width="56" height="20" rx="5"/><rect class="t" x="314" y="173" width="56" height="20" rx="5"/>
<path d="M1,100 C1,62 4,40 14,30 C22,20 38,16 58,15 C70,10 112,9 126,13 C160,16 270,16 306,13 C318,8 368,7 382,11 C404,13 424,14 432,22 C439,30 440,56 440,100 C440,144 439,170 432,178 C424,186 404,187 382,189 C368,193 318,192 306,187 C270,184 160,184 126,187 C112,191 70,190 58,185 C38,184 22,180 14,170 C4,160 1,138 1,100 Z"/>
<path d="M150,16 L156,2 Q162,-1 167,3 L163,16 Z"/><path d="M 150 184 L 156 198 Q 162 201 167 197 L 163 184 Z"/>
<path class="g" d="M9,42 Q12,29 27,24 L31,35 Q18,38 9,50 Z"/><path class="g" d="M 9 158 Q 12 171 27 176 L 31 165 Q 18 162 9 150 Z"/>
<path class="a" d="M431,32 Q437,40 438,54 L431,52 Q430,42 425,33 Z"/><path class="a" d="M 431 168 Q 437 160 438 146 L 431 148 Q 430 158 425 167 Z"/>
<path class="g" d="M44,46 Q47,37 60,38 Q68,42 65,52 Q59,61 48,58 Q41,54 44,46 Z"/><path class="g" d="M 44 154 Q 47 163 60 162 Q 68 158 65 148 Q 59 139 48 142 Q 41 146 44 154 Z"/>
<path class="n" d="M48,46 L62,44 M47,52 L62,50"/><path class="n" d="M 48 154 L 62 156 M 47 148 L 62 150"/>
<path class="n" d="M18,35 C48,27 92,26 124,30 M132,22 C200,17 300,17 346,24 M381,29 C392,30 404,30 412,28"/><path class="n" d="M 18 165 C 48 173 92 174 124 170 M 132 178 C 200 183 300 183 346 176 M 381 171 C 392 170 404 170 412 172"/>
<path class="g" d="M128,28 C175,22 290,22 336,29 L314,42 L206,40 Z"/><path class="g" d="M 128 172 C 175 178 290 178 336 171 L 314 158 L 206 160 Z"/>
<path class="n" d="M262,23 L263,41"/><path class="n" d="M 262 177 L 263 159"/>
<path class="n" d="M12,34 Q5,100 12,166 M381,30 Q393,100 381,170"/>
<path class="g" d="M124,30 Q111,100 124,170 L206,160 Q192,100 206,40 Z"/>
<path d="M206,40 Q192,100 206,160 L314,158 Q327,100 314,42 Z"/>
<rect x="214" y="91" width="14" height="18" rx="3"/>
<path class="g" d="M314,42 Q327,100 314,158 L372,148 Q383,100 372,52 Z"/>
<rect x="64" y="70" width="32" height="60" rx="11"/><rect class="g" x="70" y="77" width="20" height="46" rx="7"/>
<rect x="398" y="17" width="26" height="166" rx="4"/><path class="n" d="M403,24 V176"/>
<rect x="395" y="11" width="32" height="7" rx="2"/><rect x="395" y="182" width="32" height="7" rx="2"/>
<rect class="a" x="0" y="94" width="5" height="12"/>
</svg>`;
const TYRES = [[90, 16], [90, 184], [342, 17], [342, 183]]; // [u, v] centres; last two are the rears

export function rally(push, href) {
  const root = document.documentElement, W = innerWidth, H = innerHeight;
  const L = W * .78, s = L / 440, left = W * .015, top = H - 100 * s, px = L / 4.34; // px per metre
  const P = [-10, H + 10]; // pivot just off the bottom-left corner
  const T_END = T_GAS + (-V0 + Math.sqrt(V0 * V0 + 2 * ACC * (L + 60) / px)) / ACC; // tail clears the bottom
  const DT = 1 / 60, N = Math.ceil(T_END / DT);
  const ms = 750, scale = ms / T_END; // real-time hairpin is ~1.7 s; played back at the same shape, squeezed to 0.75 s
  // pose of a car-local point (viewBox units) at time t: rotate CCW about P, then drive along the nose
  const at = (u, v, t) => {
    const a = yaw(t) * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a), d = drive(t) * px;
    const x = left + u * s - d, y = top + v * s, dx = x - P[0], dy = y - P[1];
    return [P[0] + dx * c + dy * sn, P[1] - dx * sn + dy * c];
  };
  const times = Array.from({ length: N + 1 }, (_, k) => Math.min(k * DT, T_END));

  const fx = document.createElement('div');
  fx.className = 'rally'; fx.setAttribute('aria-hidden', 'true');
  const ns = 'http://www.w3.org/2000/svg';
  const marks = document.createElementNS(ns, 'svg');
  marks.setAttribute('class', 'rally-fx'); marks.setAttribute('viewBox', `0 0 ${W} ${H}`);
  fx.append(marks); fx.insertAdjacentHTML('beforeend', CAR);
  const car = fx.lastElementChild;
  Object.assign(car.style, { left: `${left}px`, top: `${top}px`, width: `${L}px`, height: `${200 * s}px`, transformOrigin: `${P[0] - left}px ${P[1] - top}px` });
  const go = []; // every animation starts together once the transition is ready, so marks stay under the tyres

  // tyre marks: each tyre's simulated track, drawn on at the car's pace
  const tracks = TYRES.map(([u, v]) => times.map(t => at(u, v, t)));
  tracks.forEach(pts => {
    const len = [0];
    for (let k = 1; k < pts.length; k++) len.push(len[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', 'M' + pts.map(q => q.map(n => n.toFixed(1)).join(',')).join('L'));
    p.setAttribute('stroke-width', (22 * s).toFixed(1));
    p.style.strokeDasharray = p.style.strokeDashoffset = `${len.at(-1)}`;
    marks.append(p);
    go.push(() => p.animate(len.map((l, k) => ({ strokeDashoffset: len.at(-1) - l, offset: times[k] / T_END })), { duration: ms, fill: 'both' }));
  });
  // gravel from the rear tyres: bulldozed ahead of the sliding tyre, then roosted back once on the power
  let rnd = 7; const r = () => (rnd = rnd * 16807 % 2147483647) / 2147483647; // seeded, same spray every time
  for (let i = 2; i < N; i += 2) for (const pts of tracks.slice(2)) {
    const [x, y] = pts[i], vx = (x - pts[i - 1][0]) / DT, vy = (y - pts[i - 1][1]) / DT, sp = Math.hypot(vx, vy);
    if (sp < 120 || r() < .35) continue;
    const back = times[i] > T_GAS ? -1 : 1, a = Math.atan2(vy, vx) + (r() - .5) * 1.1, f = (.25 + r() * .35) * Math.min(sp, 2400) * back;
    const g = document.createElementNS(ns, 'circle');
    g.setAttribute('cx', x.toFixed(1)); g.setAttribute('cy', y.toFixed(1)); g.setAttribute('r', (1.5 + r() * 2.5).toFixed(1));
    marks.append(g);
    go.push(() => g.animate([{ transform: 'none', opacity: 0 }, { transform: 'none', opacity: .8, offset: .01 }, { transform: `translate(${(Math.cos(a) * f * .35).toFixed(1)}px,${(Math.sin(a) * f * .35).toFixed(1)}px)`, opacity: 0 }],
      { duration: 270 + r() * 240, delay: times[i] * scale, easing: 'cubic-bezier(.15,.7,.3,1)', fill: 'both' }));
  }

  root.classList.add('rally-vt');
  const vt = document.startViewTransition(async () => {
    await push(href);
    document.body.append(fx); // no rAF wait here: rendering is paused until this callback resolves
  });
  vt.ready.then(() => {
    const R = Math.hypot(W, H) * 2.2, pt = deg => { const a = deg * Math.PI / 180; return `${(P[0] + R * Math.cos(a)).toFixed(1)}px ${(P[1] - R * Math.sin(a)).toFixed(1)}px`; };
    const sw = [...times.filter(t => t < SWING), SWING];
    // new page = wedge from the pivot, from just under the bottom edge up to the car's centreline
    root.animate(sw.map(t => ({ clipPath: `polygon(${P[0]}px ${P[1]}px, ${pt(-10)}, ${pt((yaw(t) - 10) / 2)}, ${pt(yaw(t))})`, offset: t / SWING })),
      { duration: SWING * scale, fill: 'both', pseudoElement: '::view-transition-new(root)' });
    const run = car.animate(times.map(t => ({ transform: `rotate(${-yaw(t)}deg) translateX(${-drive(t) * px}px)`, offset: t / T_END })), { duration: ms, fill: 'both' });
    go.forEach(fn => fn());
    // marks and gravel outlive the transition, then fade off the new page
    run.finished.then(() => fx.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: 100, easing: 'ease-in' }).finished).then(() => fx.remove());
  }, () => fx.remove());
  vt.finished.finally(() => root.classList.remove('rally-vt'));
}
