import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'

const MAPS = [
  {
    id: 'g1', n: 'M.01', title: 'Toronto shooting rates', note: 'Per 100,000, by neighbourhood', year: '2022', type: 'Choropleth', area: 'City of Toronto',
    src: '/gis/Toronto_Shooting_Rates_2022.png', alt: 'Choropleth map of shooting rates by Toronto neighbourhood, 2022', width: 1600, height: 1236,
  },
  {
    id: 'g2', n: 'M.02', title: 'Cycling routes', type: 'Network map on imagery', area: 'Scarborough, Toronto',
    src: '/gis/Cycle_Routes.png', alt: 'Map of cycling routes, intersections and major parks in Scarborough, Toronto', width: 1236, height: 1600,
  },
]

const GIS: NextPage = () => (
  <main id="main" className="noise-bg">
    <Head><title>GIS — HKLai</title></Head>
    <header className="page-head">
      <div className="inner">
        <div>
          <p className="label" style={{ marginBottom: 16 }}>Cartography / {String(MAPS.length).padStart(2, '0')} maps</p>
          <h1>GIS</h1>
          <p style={{ marginTop: 16 }}>Thematic maps of Toronto.</p>
        </div>
        <span className="idx dot-num" aria-hidden="true">05</span>
      </div>
      <ol className="toc" aria-label="Maps on this page">
        {MAPS.map(m => <li key={m.id}><a href={`#${m.id}`}><span className="dot-num">{m.n}</span><span>{m.title}</span></a></li>)}
      </ol>
    </header>
    <div className="maps">
      {MAPS.map((m, i) => (
        <section className="snap" id={m.id} key={m.id}>
          <article className="map hw reveal" aria-labelledby={`${m.id}-title`}>
            <i className="screw tl"></i><i className="screw tr"></i><i className="screw bl"></i><i className="screw br"></i>
            <figure><Image src={m.src} alt={m.alt} width={m.width} height={m.height} sizes="(min-width: 1024px) 70vw, 100vw" priority={i === 0} /></figure>
            <dl>
              <div><dt className="sr-only">Map</dt><dd className="dot-num" style={{ fontSize: '2.5rem', color: 'var(--accent)' }}>{m.n}</dd></div>
              <div><dt className="part">Title</dt><dd><h2 id={`${m.id}-title`}>{m.title}</h2>{m.note && <p className="label" style={{ marginTop: 4 }}>{m.note}</p>}</dd></div>
              {m.year && <div><dt className="part">Year</dt><dd className="dot-num" style={{ fontSize: '1.5rem' }}>{m.year}</dd></div>}
              <div><dt className="part">Type</dt><dd>{m.type}</dd></div>
              <div><dt className="part">Area</dt><dd>{m.area}</dd></div>
            </dl>
          </article>
        </section>
      ))}
    </div>
  </main>
)

export default GIS
