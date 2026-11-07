import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Icon } from '../../components/layout'

const IG = 'https://www.instagram.com/sing.sang.sunk/'
const COLS = 24, ROWS = 10

// Idle dot-matrix level meter: a slow breathing wave, static when reduced motion is on.
const levels = (t: number) => Array.from({ length: COLS }, (_, x) => Math.round((Math.sin(x * .45 + t) * .5 + .5) * 3 + 1))

const Meter = () => {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setT(v => v + .25), 120)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="vu" aria-hidden="true">
      {levels(t).map((lvl, x) => (
        <span key={x}>{Array.from({ length: ROWS }, (_, i) => ROWS - 1 - i).map(y => (
          <i key={y} className={y < lvl ? (y === lvl - 1 && x % 6 === 0 ? 'red' : 'on') : ''}></i>
        ))}</span>
      ))}
    </div>
  )
}

const Music: NextPage = () => (
  <main id="main">
    <Head><title>Music — HKLai</title></Head>
    <header className="page-head noise-bg">
      <div className="inner">
        <div>
          <p className="label" style={{ marginBottom: 16 }}>Recordings / @sing.sang.sunk</p>
          <h1>Music</h1>
          <p style={{ marginTop: 16 }}>Recordings, posted on Instagram.</p>
        </div>
        <span className="idx dot-num" aria-hidden="true">04</span>
      </div>
    </header>
    <section className="music snap" id="deck" data-pager="Deck">
      <div className="deck hw reveal">
        <i className="screw tl"></i><i className="screw tr"></i><i className="screw bl"></i><i className="screw br"></i>
        <div>
          <p className="part">Deck JL-04 · Instagram</p>
          <h2 style={{ fontSize: 'clamp(1.05rem, 4.6vw, 1.5rem)', marginTop: 12, overflowWrap: 'anywhere' }}>@sing.sang.sunk</h2>
          <p style={{ color: 'var(--muted-foreground)', marginTop: 12, maxWidth: '32rem' }}>Recordings live on Instagram for now. Open the profile to listen.</p>
          <div className="controls">
            <a className="round" href={IG} target="_blank" rel="noopener noreferrer" aria-label="Listen on Instagram (opens in a new tab)"><Icon name="play" /></a>
            <a className="btn btn-primary" href={IG} target="_blank" rel="noopener noreferrer">Open Instagram<Icon name="arrow-ur" className="icon-sm" /></a>
          </div>
        </div>
        <Meter />
      </div>
    </section>
  </main>
)

export default Music
