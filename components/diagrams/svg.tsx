// Shared SVG parts for case-study diagrams; colours come from CSS vars so they follow the theme.

export const Arrow = ({ id }: { id: string }) => (
  <defs>
    <marker id={id} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L8,4 L0,8z" className="arrowhead" />
    </marker>
  </defs>
)

export const Box = ({ x, y, w, h, n, name, sub, hot }: { x: number, y: number, w: number, h: number, n?: string, name: string, sub?: string, hot?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={8} className={`box${hot ? ' hot' : ''}`} />
    {n && <text x={x + 8} y={y + 16} className="num">{n}</text>}
    <text x={x + 8} y={y + (n ? 32 : 20)} className="name">{name}</text>
    {sub && <text x={x + 8} y={y + (n ? 46 : 34)} className="dim">{sub}</text>}
  </g>
)
