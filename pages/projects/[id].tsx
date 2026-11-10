import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Compare from '../../components/compare'
import { PROJECTS, pnum } from '../../lib/projects'

type Props = { id: string }

const STUDIES = PROJECTS.filter(p => p.study)

const CaseStudy: NextPage<Props> = ({ id }) => {
  const i = PROJECTS.findIndex(p => p.id === id)
  const p = PROJECTS[i]
  const s = p.study!
  const nextP = STUDIES[(STUDIES.indexOf(p) + 1) % STUDIES.length]
  let n = 0, f = 0  // section and figure counters, in render order
  const sec = (t: string) => `${String(++n).padStart(2, '0')} — ${t}`
  const fig = () => `Fig. ${pnum(i)}.${String.fromCharCode(97 + f++)}`
  return (
    <main id="main" className="cs">
      <Head><title>{`${p.title} — Projects — HKLai`}</title></Head>
      <header className="page-head noise-bg">
        <div className="inner">
          <div>
            <p className="label" style={{ marginBottom: 16 }}><Link href={`/projects#${p.id}`}>← Projects</Link> / {pnum(i)} / {p.kind}</p>
            <h1>{p.title}</h1>
            <p style={{ marginTop: 16 }}>{p.sub}</p>
          </div>
          <dl className="hw specs"><i className="screw tl"></i><i className="screw tr"></i>
            {s.facts.map(([k, v]) => <div key={k}><dt className="part">{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
      </header>

      <section className="inner cs-sec">
        <h2 className="part">{sec('Problem')}</h2>
        <div className="prose">{s.problem.map((t, j) => <p key={j}>{t}</p>)}</div>
        <ul className="stats">
          {s.stats.map(([n, l]) => <li key={l} className="hw"><span className="dot-num">{n}</span><span className="part">{l}</span></li>)}
        </ul>
      </section>

      <section className="cs-sec seq-alt">
        <div className="inner">
          <h2 className="part">{sec('How it works')}</h2>
          <ol className="pipeline" tabIndex={0} aria-label="Pipeline stages, scroll horizontally">
            {s.stages.map((st, j) => (
              <li key={st.name} className={`hw${st.img ? '' : ' bare'}`}>
                <span className="dot-num">{String(j).padStart(2, '0')}</span>
                {st.img && <Image {...st.img} alt={st.img.alt} sizes="320px" style={st.img.height > st.img.width ? { objectFit: 'contain' } : undefined} />}
                <h3>{st.name}</h3>
                <p>{st.note}</p>
              </li>
            ))}
          </ol>
          <p className="cap part" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}><span>{fig()} — {s.stages.length} stages</span><span>Scroll →</span></p>
        </div>
      </section>

      {s.compare && (
        <section className="inner cs-sec">
          <h2 className="part">{sec('Before / after')}</h2>
          <figure className="media hw"><i className="screw tl"></i><i className="screw tr"></i>
            <Compare before={s.compare.before} after={s.compare.after} label={`${s.compare.caption[0]}: before and after`} />
            <figcaption className="cap part"><span>{fig()} — {s.compare.caption[0]}</span><span>{s.compare.caption[1]}</span></figcaption>
          </figure>
        </section>
      )}

      {s.tech && (
        <section className="cs-sec seq-alt">
          <div className="inner">
            <h2 className="part">{sec('Under the hood')}</h2>
            {s.tech.map(t => (
              <div key={t.title} className="tech">
                <div><h3>{t.title}</h3><p>{t.body}</p></div>
                <figure className="media hw"><i className="screw tl"></i><i className="screw tr"></i>
                  <div className="diagram-wrap">{t.fig}</div>
                  <figcaption className="cap part"><span>{fig()} — {t.caption[0]}</span><span>{t.caption[1]}</span></figcaption>
                </figure>
              </div>
            ))}
          </div>
        </section>
      )}

      {s.specs && (
        <section className="inner cs-sec">
          <h2 className="part">{sec('Spec sheet')}</h2>
          <div className="spec-wrap" tabIndex={0} role="region" aria-label="Per-stage specifications">
            <table className="spec-table">
              <thead><tr>{s.specs[0].map(h => <th key={h} className="part">{h}</th>)}</tr></thead>
              <tbody>{s.specs.slice(1).map(r => <tr key={r[0]}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </section>
      )}

      <section className="inner cs-sec">
        <h2 className="part">{sec('Hard parts')}</h2>
        <div className="hard">
          {s.hard.map(h => <div key={h.title}><h3>{h.title}</h3><p>{h.body}</p></div>)}
        </div>
      </section>

      <section className="inner cs-sec">
        <h2 className="part">{sec('Next')}</h2>
        <ul className="points">{s.next.map(n => <li key={n}>{n}</li>)}</ul>
        <div className="links">
          <Link className="btn" href={`/projects#${p.id}`}>← All projects</Link>
          {nextP !== p && <Link className="btn btn-primary" href={`/projects/${nextP.id}`}>Next: {nextP.title}</Link>}
        </div>
      </section>
    </main>
  )
}

export default CaseStudy

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: STUDIES.map(p => ({ params: { id: p.id } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => ({ props: { id: String(params?.id) } })
