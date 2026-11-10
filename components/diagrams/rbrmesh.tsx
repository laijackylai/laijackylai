// Hand-drawn SVG diagrams for the rbrmesh case study; colours come from CSS vars so they follow the theme.

import { Arrow, Box } from './svg'

// ── 1. Stage data flow ─────────────────────────────────────────
const W = 96, H = 56
const cx = (c: number) => 16 + c * 118
const ROW = [40, 130, 220]
const NODES: [number, number, string, string][] = [ // [col, row, name, output]
  [0, 1, 'Preprocess', '.jpg + EXIF'], [1, 1, 'Cubemap', 'L/C/R .png'],
  [2, 0, 'MASt3R', 'poses, sparse'], [2, 1, 'Depth', 'inv. depth'], [2, 2, 'SegFormer', 'P(road)'],
  [3, 1, 'Geom. mask', 'mask + flags'], [4, 1, 'Fusion', 'metric slabs'], [5, 1, 'Assembly', 'road_cloud'],
  [6, 1, 'Mesh', 'height field'], [7, 1, 'Refine', 'or no_change'], [8, 1, 'Texture', 'OBJ + DXT1'], [9, 1, 'RSF export', 'RBR package'],
]
const EDGES = [[0, 1], [1, 2], [1, 3], [1, 4], [2, 5], [3, 5], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11]]
const pos = (i: number) => ({ x: cx(NODES[i][0]), y: ROW[NODES[i][1]] })
const mid = (i: number) => cx(NODES[i][0]) + W / 2

export function StageDag() {
  return (
    <svg className="diagram" viewBox="0 0 1190 330" role="img" aria-label="Data flow between the 12 rbrmesh stages">
      <Arrow id="dag-a" />
      {EDGES.map(([a, b]) => {
        const p = pos(a), q = pos(b), x1 = p.x + W, y1 = p.y + H / 2, x2 = q.x, y2 = q.y + H / 2, m = (x1 + x2) / 2
        return <path key={`${a}-${b}`} className="edge" d={`M${x1},${y1} C${m},${y1} ${m},${y2} ${x2},${y2}`} markerEnd="url(#dag-a)" />
      })}
      {/* MASt3R poses and Depth skip the mask stage straight into Fusion */}
      <path className="edge" d={`M${cx(2) + W},68 H${mid(6) - 16} Q${mid(6)},68 ${mid(6)},84 V130`} markerEnd="url(#dag-a)" />
      <path className="edge" d={`M${mid(3)},186 V200 H${mid(6) - 32} Q${mid(6) - 16},200 ${mid(6) - 16},186`} markerEnd="url(#dag-a)" />
      {/* raw RGB bus (bottom) and eligibility-mask bus (top) */}
      <path className="edge bus" d={`M${mid(1)},186 V300 H${mid(10)}`} />
      {[5, 6, 9, 10].map(i => <path key={i} className="edge" d={`M${mid(i) + (i === 6 ? 16 : 0)},300 V186`} markerEnd="url(#dag-a)" />)}
      <path className="edge bus hot" d={`M${mid(5)},130 V20 H${mid(10)}`} />
      {[9, 10].map(i => <path key={i} className="edge hot" d={`M${mid(i)},20 V130`} markerEnd="url(#dag-a)" />)}
      <text x={mid(7) - 60} y={318} className="dim">raw RGB · Stage 1 faces</text>
      <text x={mid(7) - 60} y={14} className="dim">Stage 5 eligibility masks</text>
      {NODES.map(([, , name, out], i) => {
        const p = pos(i)
        return <g key={name}><Box x={p.x} y={p.y} w={W} h={H} n={String(i).padStart(2, '0')} name={name} sub={out} hot={i === 5 || i === 6} /><circle cx={p.x + W - 9} cy={p.y + 10} r={3.5} className="qa" /></g>
      })}
      <circle cx={22} cy={10} r={3.5} className="qa" /><text x={32} y={14} className="dim">QA gate after every stage</text>
    </svg>
  )
}

// ── 2. Camera rig, top-down ────────────────────────────────────
const RX = 200, RY = 236, RR = 176
const pt = (deg: number, r = RR) => [RX + r * Math.sin(deg * Math.PI / 180), RY - r * Math.cos(deg * Math.PI / 180)].map(v => Math.round(v * 10) / 10)
const wedge = (yaw: number) => { const [x1, y1] = pt(yaw - 45), [x2, y2] = pt(yaw + 45); return `M${RX},${RY} L${x1},${y1} A${RR},${RR} 0 0 1 ${x2},${y2} Z` }

export function CameraRig() {
  return (
    <svg className="diagram" viewBox="0 0 400 320" role="img" aria-label="Top-down view of the three 90 degree camera faces at minus 45, 0 and plus 45 degrees">
      {[-45, 45].map(y => <path key={y} d={wedge(y)} className="wedge hot" />)}
      <path d={wedge(0)} className="wedge" />
      {([[-45, 'front_l −45°'], [0, 'front_c 0°'], [45, 'front_r +45°']] as const).map(([y, t]) => {
        const [x2, y2] = pt(y), [tx, ty] = pt(y, RR - 30)
        return <g key={y}><path d={`M${RX},${RY} L${x2},${y2}`} className="edge dash" /><text x={tx} y={ty} textAnchor="middle" className="name">{t}</text></g>
      })}
      <rect x={RX - 20} y={RY - 12} width={40} height={74} rx={10} className="box" />
      <circle cx={RX} cy={RY} r={5} className="qa" />
      <text x={RX + 30} y={RY + 40} className="dim">360° camera · 1.70 m</text>
      <text x={12} y={312} className="dim">red = MASt3R L/R chains · grey = centre face</text>
    </svg>
  )
}

// ── 3. Stage 8 trajectory-local height field ───────────────────
const ST = 26, LAT = [-48, -24, 0, 24, 48], GAP = [17, 18, 19], HOLE = 6
const centre = (t: number) => [40 + 640 * t, 160 - 80 * Math.sin(Math.PI * t * 1.3)]
const at = (s: number, l: number) => {
  const t = s / (ST - 1), [x, y] = centre(t), [x2, y2] = centre(t + 1e-3)
  const dx = x2 - x, dy = y2 - y, n = Math.hypot(dx, dy)
  return [x - (dy / n) * l, y + (dx / n) * l].map(v => Math.round(v * 10) / 10)  // rounded so SSR and client markup match
}
const ok = (s: number) => !GAP.includes(s)

export function HeightField() {
  const lines = LAT.map(l => {
    let d = ''
    for (let s = 0; s < ST; s++) { if (!ok(s)) continue; const [x, y] = at(s, l); d += `${d && ok(s - 1) ? 'L' : 'M'}${x},${y} ` }
    return d
  })
  const quad = (s: number, a: number, b: number) => [at(s, a), at(s, b), at(s + 1, b), at(s + 1, a)].map(p => p.join(',')).join(' ')
  const [gx, gy] = at(GAP[1], 70), [hx, hy] = at(HOLE, -70), [ex, ey] = at(ST - 1, 0)
  return (
    <svg className="diagram" viewBox="0 0 760 290" role="img" aria-label="Road resampled into a station by lateral grid along the route, with a small inferred hole and a full-width gap that stops publication">
      <Arrow id="hf-a" />
      <defs><pattern id="hf-h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0,0 V6" className="hatch" /></pattern></defs>
      <polygon points={[...LAT.map(l => at(GAP[0] - 1, l)), ...LAT.slice().reverse().map(l => at(GAP[GAP.length - 1] + 1, l))].map(p => p.join(',')).join(' ')} fill="url(#hf-h)" className="gap" />
      <polygon points={quad(HOLE, 0, 24)} className="hole" />
      {Array.from({ length: ST }, (_, s) => ok(s) && <path key={s} className="grid" d={`M${at(s, -48).join(',')} L${at(s, 48).join(',')}`} />)}
      {lines.map((d, i) => <path key={i} d={d} className={LAT[i] === 0 ? 'edge dash' : 'grid'} />)}
      <path d={`M${ex},${ey} L${ex + 40},${ey - 18}`} className="edge" markerEnd="url(#hf-a)" />
      <text x={ex - 4} y={ey - 30} className="name">s · station</text>
      <path d={`M${at(2, -48).join(',')} L${at(2, -70).join(',')}`} className="edge" markerEnd="url(#hf-a)" />
      <text x={at(2, -84)[0] - 20} y={at(2, -84)[1]} className="name">l · lateral</text>
      <path d={`M${at(HOLE, -60).join(',')} L${at(HOLE, 6).join(',')}`} className="edge" markerEnd="url(#hf-a)" />
      <text x={hx - 60} y={hy - 4} className="dim">small hole · inferred</text>
      <text x={gx - 70} y={gy + 14} className="hot-t">full-width gap · stop</text>
      <text x={16} y={280} className="dim">0.05 m cells · robust fit radius 0.25 m · one shared indexed mesh</text>
    </svg>
  )
}

// ── 4. Config snapshot → stage → QA gate ───────────────────────
export function QaGate() {
  const layers = ['defaults.toml', 'profile.toml', 'pipeline.toml', 'CLI flags']
  return (
    <svg className="diagram" viewBox="0 0 900 220" role="img" aria-label="Config layers merge into a hashed snapshot; each stage output passes a QA gate before it is published or the run stops">
      <Arrow id="qa-a" />
      {layers.map((t, i) => <g key={t}><Box x={10 + i * 140} y={30} w={116} h={44} name={t} sub={i ? 'overrides' : 'committed'} />{i > 0 && <path className="edge" d={`M${i * 140},52 H${10 + i * 140}`} markerEnd="url(#qa-a)" />}</g>)}
      <path className="edge" d="M560,52 H580" markerEnd="url(#qa-a)" />
      <Box x={580} y={30} w={170} h={44} name="immutable snapshot" sub="JSON · sha256" hot />
      <path className="edge" d="M665,74 V96 H310 V120" markerEnd="url(#qa-a)" />
      <Box x={250} y={120} w={120} h={44} name="Stage N" sub="reads snapshot" />
      <path className="edge" d="M370,142 H420" markerEnd="url(#qa-a)" />
      <Box x={420} y={120} w={250} h={44} name="QA gate" sub="format · schema · bounds · hashes · drift" hot />
      <path className="edge" d="M670,135 C690,135 690,124 710,124" markerEnd="url(#qa-a)" />
      <path className="edge" d="M670,150 C690,150 690,174 710,174" markerEnd="url(#qa-a)" />
      <Box x={710} y={104} w={180} h={36} name="publish output/NN" />
      <Box x={710} y={160} w={180} h={36} name="stop run" />
      <text x={10} y={150} className="dim">next stage binds</text>
      <text x={10} y={166} className="dim">this run ID + hashes</text>
    </svg>
  )
}
