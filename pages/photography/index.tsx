import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/layout'
import { fetchPhotos, PhotoData, shouldFailStaticBuild } from '../../lib/storage'

export type { PhotoData }

type Props = {
  photosData: PhotoData[],
}

const shuffle = (photos: PhotoData[]) => {
  const out = [...photos];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const FILTERS = ['all', 'film', 'digital'] as const
type Filter = typeof FILTERS[number]

const photoName = (photo: PhotoData) => photo.s3key.split('/').pop() ?? photo.id
const photoAlt = (photo: PhotoData) => `${photo.type} photograph ${photoName(photo)}`
const pad = (n: number) => String(n).padStart(2, '0')
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

const Photography: NextPage<Props> = ({ photosData }) => {
  const [photos, setPhotos] = useState(photosData)
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState<number | null>(null)
  const [docked, setDocked] = useState(false)
  const headRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const emptyRef = useRef<HTMLParagraphElement>(null)
  const lbRef = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const swipeX = useRef<number | null>(null)
  const jump = useRef(false)

  const shown = filter === 'all' ? photos : photos.filter(p => p.type === filter)
  const count = (f: Filter) => (f === 'all' ? photos.length : photos.filter(p => p.type === f).length)

  useEffect(() => { setPhotos(shuffle(photosData)) }, [photosData])

  // re-index the section pager after every list change, and jump to the first frame after a filter click
  useEffect(() => {
    dispatchEvent(new Event('panelschange'))
    if (!jump.current) return
    jump.current = false;
    (listRef.current?.querySelector('.photo') ?? emptyRef.current)?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' })
  }, [shown.length, filter, photos])

  // docked copy of the filters, shown once the title screen leaves view
  useEffect(() => {
    const io = new IntersectionObserver(([en]) => setDocked(!en.isIntersecting), { threshold: .15 })
    if (headRef.current) io.observe(headRef.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const lb = lbRef.current
    if (!lb) return
    if (open !== null && !lb.open) lb.showModal?.()
    if (open === null && lb.open) lb.close()
  }, [open])

  const pick = (f: Filter) => { jump.current = true; setFilter(f) }
  const go = (i: number) => setOpen((i + shown.length) % shown.length)
  const cur = open !== null ? shown[open] : null

  const chips = FILTERS.map(f => (
    <button key={f} className="chip" type="button" aria-pressed={filter === f} onClick={() => pick(f)}>
      {f[0].toUpperCase() + f.slice(1)} <span className="count">{pad(count(f))}</span>
    </button>
  ))

  return (
    <main id="main">
      <Head><title>Photography — HKLai</title></Head>
      <header className="page-head noise-bg" ref={headRef}>
        <div className="inner">
          <div>
            <p className="label" style={{ marginBottom: 16 }}>Roll / shuffled each visit</p>
            <h1>Photography</h1>
            <div className="filters" role="group" aria-label="Filter photos by format" style={{ marginTop: 28 }}>{chips}</div>
          </div>
          <span className="idx dot-num" aria-hidden="true">03</span>
        </div>
      </header>
      <section className="wrap noise-bg" aria-label="Photos">
        <div className="inner">
          <p className="sr-only" role="status">{shown.length} photo{shown.length === 1 ? '' : 's'} shown.</p>
          <ol className="photos" ref={listRef}>
            {shown.map((p, i) => {
              const ratio = parseFloat(p.aspectRatio) || 1
              const h = ratio < 1 ? 560 : 420
              return (
                <li key={p.id} className="photo reveal in" data-pager={`Frame ${pad(i + 1)}`}>
                  <button className="ph" type="button" aria-label={`Open ${photoAlt(p)}`} style={{ ['--h' as string]: `${h}px` }}
                    onClick={e => { opener.current = e.currentTarget; setOpen(i) }}>
                    <Image src={p.url} alt={photoAlt(p)} width={Math.round(h * ratio)} height={h} quality={65} priority={i < 2}
                      sizes="(min-width: 1024px) 60vw, 100vw" placeholder={p.blurredBase64 ? 'blur' : 'empty'} blurDataURL={p.blurredBase64 ?? undefined} />
                  </button>
                  <div className="pmeta">
                    <span className="frame dot-num">{pad(i + 1)}<span style={{ color: 'var(--num-dim)' }}>/{pad(shown.length)}</span></span>
                    <h2>{p.type}</h2>
                    <span className="label">{p.id}</span>
                    <span className="part">{p.s3key}</span>
                  </div>
                </li>
              )
            })}
          </ol>
          <p className="empty" ref={emptyRef} hidden={shown.length > 0}>No photos match this filter. Choose <strong>All</strong> to see every format.</p>
        </div>
      </section>
      <button className="to-top" type="button" aria-label="Scroll to top"><Icon name="up" /></button>

      <div className={`filter-dock hw ${docked ? 'show' : ''}`} role="group" aria-label="Filter photos by format (docked)" {...(docked ? {} : { inert: '' })}>{chips}</div>

      <dialog className="lightbox" ref={lbRef} aria-label={cur ? `Full resolution photo ${cur.s3key}` : 'Photo viewer'}
        onClose={() => { setOpen(null); opener.current?.focus() }}
        onClick={e => { if (e.target === e.currentTarget) setOpen(null) }}
        onKeyDown={e => { if (open === null) return; if (e.key === 'ArrowLeft') go(open - 1); if (e.key === 'ArrowRight') go(open + 1) }}>
        {cur && open !== null && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="lb-img" src={cur.url} alt={photoAlt(cur)}
              onPointerDown={e => { swipeX.current = e.clientX }}
              onPointerUp={e => { // swipe left/right on touch screens
                if (swipeX.current === null) return
                const dx = e.clientX - swipeX.current; swipeX.current = null
                if (Math.abs(dx) > 50) go(open + (dx < 0 ? 1 : -1))
              }} />
            <div className="lb-bar">
              <span className="label">{open + 1} / {shown.length} — {cur.type} · {cur.id}</span>
              <div className="lb-btns">
                <button type="button" aria-label="Previous photo" onClick={() => go(open - 1)}><Icon name="left" /></button>
                <button type="button" aria-label="Next photo" onClick={() => go(open + 1)}><Icon name="right" /></button>
                <button type="button" aria-label="Close full resolution photo" onClick={() => setOpen(null)}><Icon name="x" /></button>
              </div>
            </div>
            <div className="lb-glyph" aria-hidden="true">{shown.map((_, j) => <i key={j} className={j < open ? 'on' : j === open ? 'red' : ''}></i>)}</div>
          </>
        )}
      </dialog>
    </main>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    return { props: { photosData: await fetchPhotos('/photography') }, revalidate: 60 };
  } catch (error) {
    if (shouldFailStaticBuild()) {
      throw error;
    }
    return { props: { photosData: [] }, revalidate: 60 };
  }
}

export default Photography
