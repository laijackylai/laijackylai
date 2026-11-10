import Image from 'next/image'
import { useState, type CSSProperties } from 'react'

type Img = { src: string, alt: string, width: number, height: number }

export default function Compare({ before, after, label }: { before: Img, after: Img, label: string }) {
  const [pos, setPos] = useState(50)
  return (
    <div className="compare" style={{ '--pos': `${pos}%` } as CSSProperties}>
      <Image {...before} alt={before.alt} sizes="(min-width: 1024px) 1100px, 100vw" />
      <Image {...after} alt={after.alt} className="after" sizes="(min-width: 1024px) 1100px, 100vw" />
      <input type="range" min={0} max={100} value={pos} onChange={e => setPos(+e.target.value)} aria-label={label} />
    </div>
  )
}
