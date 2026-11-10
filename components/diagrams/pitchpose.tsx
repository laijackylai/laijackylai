// Hand-drawn SVG diagrams for the PitchPose case study; colours come from CSS vars so they follow the theme.

import { Arrow, Box } from './svg'

// ── 1. Stage data flow ─────────────────────────────────────────
const W = 96, H = 56
const cx = (c: number) => 16 + c * 118
const NODES: [number, number, string, string][] = [ // [col, y, name, output]
  [0, 116, 'Source', 'hash, decode'], [1, 116, 'SAM2', 'player mask'], [2, 116, 'Body26', 'RTMPose-m'],
  [3, 196, 'RTMO', '2nd observer'], [4, 196, 'Sapiens2', 'dense pose'],
  [3, 36, 'Pixel parts', 'fwd-bwd checked'], [4, 36, 'Learned parts', 'CoTracker3'],
  [5, 116, 'Refinement', '26 joints + source'], [6, 116, 'Heading', 'travel · chest'], [6, 276, 'Parsing', 'optional'],
  [7, 116, 'Review', 'HTML desk'], [8, 116, 'Export', 'npz · json'],
]
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [4, 7], [6, 7], [7, 8], [8, 10], [10, 11]]
const pos = (i: number) => ({ x: cx(NODES[i][0]), y: NODES[i][1] })
const mid = (i: number) => cx(NODES[i][0]) + W / 2

export function PoseDag() {
  return (
    <svg className="diagram" viewBox="0 0 1080 340" role="img" aria-label="Data flow between the 12 PitchPose stages">
      <Arrow id="pp-a" />
      {EDGES.map(([a, b]) => {
        const p = pos(a), q = pos(b), x1 = p.x + W, y1 = p.y + H / 2, x2 = q.x, y2 = q.y + H / 2, m = (x1 + x2) / 2
        return <path key={`${a}-${b}`} className="edge" d={`M${x1},${y1} C${m},${y1} ${m},${y2} ${x2},${y2}`} markerEnd="url(#pp-a)" />
      })}
      {/* Body26 is the primary observation; the other branches are evidence */}
      <path className="edge hot" d={`M${pos(2).x + W},144 H${pos(7).x}`} markerEnd="url(#pp-a)" />
      <text x={pos(5).x + 20} y={138} className="hot-t">primary observation</text>
      {/* optional parser reads Body26 crops and only feeds review */}
      <path className="edge bus" d={`M${mid(2)},172 V304 H${pos(9).x}`} markerEnd="url(#pp-a)" />
      <path className="edge bus" d={`M${pos(9).x + W},304 H${mid(10)} V172`} markerEnd="url(#pp-a)" />
      {NODES.map(([, , name, out], i) => {
        const p = pos(i)
        return <Box key={name} x={p.x} y={p.y} w={W} h={H} n={String(i).padStart(2, '0')} name={name} sub={out} hot={i === 7} />
      })}
    </svg>
  )
}

// ── 2. Identity: cues → gates → state machine ─────────────────
const CUES = ['Appearance · OSNet', 'Trajectory · Kalman', 'Perspective scale', 'Limb proportions', 'Kit colour', 'Optical flow']
const STATES: [string, number, number, boolean][] = [['TRACKING', 470, 40, true], ['UNCERTAIN', 720, 40, false], ['LOST', 720, 190, false], ['REACQUIRED', 470, 190, false]]

export function IdentityGate() {
  return (
    <svg className="diagram" viewBox="0 0 900 300" role="img" aria-label="Six identity cues feed a weighted score and conjunctive gates, which drive a tracking, uncertain, lost, reacquired state machine">
      <Arrow id="id-a" />
      {CUES.map((c, i) => <g key={c}><Box x={10} y={20 + i * 40} w={150} h={30} name={c} /><path className="edge" d={`M160,${35 + i * 40} C185,${35 + i * 40} 185,140 210,140`} /></g>)}
      <path className="edge" d="M210,140 H230" markerEnd="url(#id-a)" />
      <Box x={230} y={96} w={170} h={88} name="Weighted score" sub="missing cues renormalised" />
      <text x={238} y={152} className="dim">gates: score floor ·</text>
      <text x={238} y={166} className="dim">motion · ambiguity margin</text>
      <path className="edge" d="M400,140 H430 V68 H470" markerEnd="url(#id-a)" />
      {STATES.map(([s, x, y, hot]) => <Box key={s} x={x} y={y} w={140} h={56} name={s} sub={hot || s === 'REACQUIRED' ? 'box + pose exported' : 'exported as null'} hot={hot} />)}
      <path className="edge" d="M610,58 H720" markerEnd="url(#id-a)" />
      <text x={628} y={52} className="dim">margin too small</text>
      <path className="edge" d="M720,82 H610" markerEnd="url(#id-a)" />
      <text x={640} y={96} className="dim">recovers</text>
      <path className="edge" d="M790,96 V190" markerEnd="url(#id-a)" />
      <text x={798} y={146} className="dim">no candidate</text>
      <path className="edge hot" d="M720,218 H610" markerEnd="url(#id-a)" />
      <text x={616} y={240} className="hot-t">re-anchor / checkpoint</text>
      <path className="edge" d="M540,190 V96" markerEnd="url(#id-a)" />
      <text x={470} y={290} className="dim">missing frames are acceptable · wrong-player frames are not</text>
    </svg>
  )
}

// ── 3. Refinement evidence ladder ──────────────────────────────
const SOURCES = ['Body26', 'RTMO', 'Sapiens2', 'Motion']
const PASSES: [string, string][] = [['Ownership', 'whose limb is it'], ['Part tracks', 'parts move alone'], ['Soft anatomy', 'projected lengths'], ['Momentum', 'short-gap motion'], ['Gait', 'only if cyclic'], ['Hidden legs', 'marked inferred']]

export function EvidenceLadder() {
  return (
    <svg className="diagram" viewBox="0 0 960 220" role="img" aria-label="Four pose sources pass through ownership, part tracks, soft anatomy, momentum, gait and hidden-leg inference in order">
      <Arrow id="ev-a" />
      {SOURCES.map((s, i) => <g key={s}><Box x={10} y={14 + i * 44} w={100} h={34} name={s} /><path className="edge" d={`M110,${31 + i * 44} C130,${31 + i * 44} 130,96 150,96`} /></g>)}
      {PASSES.map(([n, d], i) => {
        const x = 150 + i * 132
        return <g key={n}>
          <Box x={x} y={68} w={112} h={56} n={String.fromCharCode(97 + i)} name={n} sub={d} hot={i === 0} />
          {i < PASSES.length - 1 && <path className="edge" d={`M${x + 112},96 H${x + 132}`} markerEnd="url(#ev-a)" />}
        </g>
      })}
      <path className="edge dash" d="M150,150 H904" />
      <text x={150} y={170} className="dim">raw coordinates and scores kept untouched · each joint stores which source and pass set it</text>
      <text x={150} y={186} className="dim">a pass may only change a joint it has evidence for · unknown stays blank</text>
    </svg>
  )
}

// ── 4. Two headings: travel vs chest facing ────────────────────
const dial = (x: number, y: number, deg: number, r = 54) => [x + r * Math.sin(deg * Math.PI / 180), y - r * Math.cos(deg * Math.PI / 180)].map(v => Math.round(v * 10) / 10)

export function Headings() {
  const [tx, ty] = dial(470, 130, -33), [fx, fy] = dial(680, 130, 235)
  return (
    <svg className="diagram" viewBox="0 0 780 270" role="img" aria-label="Travel direction is screen motion minus camera pan; chest facing is a separate camera-relative estimate">
      <Arrow id="hd-a" />
      <path className="edge dash" d="M40,190 H200" markerEnd="url(#hd-a)" />
      <text x={70} y={210} className="dim">camera pan (background flow)</text>
      <path className="edge" d="M40,190 L120,70" markerEnd="url(#hd-a)" />
      <text x={20} y={64} className="dim">screen motion</text>
      <path className="edge hot" d="M200,190 L124,74" markerEnd="url(#hd-a)" />
      <text x={170} y={120} className="hot-t">travel = screen − pan</text>
      <circle cx={470} cy={130} r={54} className="box" />
      <path className="edge hot" d={`M470,130 L${tx},${ty}`} markerEnd="url(#hd-a)" />
      <text x={470} y={210} textAnchor="middle" className="name">Travel</text>
      <text x={470} y={224} textAnchor="middle" className="dim">image plane</text>
      <circle cx={680} cy={130} r={54} className="box" />
      <path className="edge" d={`M680,130 L${fx},${fy}`} markerEnd="url(#hd-a)" />
      <text x={680} y={68} textAnchor="middle" className="dim">away</text>
      <text x={680} y={200} textAnchor="middle" className="dim">toward camera</text>
      <text x={680} y={224} textAnchor="middle" className="name">Chest facing</text>
      <text x={20} y={258} className="dim">separate estimates · neither is a pitch bearing · no evidence = blank, not a guess</text>
    </svg>
  )
}
