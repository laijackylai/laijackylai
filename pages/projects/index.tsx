import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
// @ts-ignore
import { getPlaiceholder } from 'plaiceholder'
import { Icon } from '../../components/layout'
import { publicStorageUrl, shouldFailStaticBuild } from '../../lib/storage'
import { PROJECTS, STACK, pnum } from '../../lib/projects'

type Props = {
  imageUrls: string[];
  base64: Array<string | null>;
};

const Projects: NextPage<Props> = ({ imageUrls, base64 }) => (
  <main id="main">
    <Head><title>Projects — HKLai</title></Head>
    <header className="page-head noise-bg">
      <div className="inner">
        <div>
          <p className="label" style={{ marginBottom: 16 }}>Index / {String(PROJECTS.length).padStart(2, '0')} entries</p>
          <h1>Projects</h1>
          <p style={{ marginTop: 16 }}>3D reconstruction, computer vision, simulation, maps, open source and mobile work.</p>
        </div>
        <span className="idx dot-num" aria-hidden="true">02</span>
      </div>
      <ol className="toc" aria-label="Projects on this page">
        {PROJECTS.map((p, i) => (
          <li key={p.id}><a href={`#${p.id}`}><span className="dot-num">{pnum(i)}</span><span>{p.title.replace(' and Cloud Visualization System', ' + Cloud')}</span></a></li>
        ))}
      </ol>
    </header>

    {PROJECTS.map((p, i) => (
      <section key={p.id} className={`proj snap ${i % 2 ? 'flip seq-alt' : 'noise-bg'}`} aria-labelledby={`${p.id}-title`} id={p.id}>
        <div className="inner">
          <div className="reveal">
            <div className="meta-row"><span className="dot-num">{pnum(i)}</span><span className="part">{p.kind}</span></div>
            <h2 id={`${p.id}-title`}>{p.title}</h2>
            <p className="sub">{p.sub}</p>
            {p.points && <ul className="points">{p.points.map((pt, j) => <li key={j}>{pt}</li>)}</ul>}
            {(p.links || p.study) && (
              <div className="links">
                {p.study && <Link className="btn btn-primary" href={`/projects/${p.id}`}>Read case study<Icon name="arrow-ur" className="icon-sm" /></Link>}
                {p.links?.map((l, j) => (
                  <a key={l.href} className={`btn ${j === 0 && !p.study ? 'btn-primary' : ''}`} href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.icon && <Icon name={l.icon} className="icon-sm" />}{l.label}{!l.icon && <Icon name="arrow-ur" className="icon-sm" />}
                  </a>
                ))}
              </div>
            )}
          </div>
          {p.shot && (
            <figure className="media hw reveal"><i className="screw tl"></i><i className="screw tr"></i>
              <Image src={p.shot.src} alt={p.shot.alt} width={p.shot.width} height={p.shot.height} sizes="(min-width: 1024px) 60vw, 100vw" priority={i === 0} />
              <figcaption className="cap part"><span>Fig. {pnum(i)} — {p.shot.caption[0]}</span><span>{p.shot.caption[1]}</span></figcaption>
            </figure>
          )}
          {p.aside === 'takcarly' && (
            <div className="reveal">
              <div className="shots" tabIndex={0} role="region" aria-label="Takcarly screenshots, scroll horizontally">
                {imageUrls.map((url, j) => (
                  <Image key={url} src={url} alt={`Takcarly app screenshot ${j + 1}`} width={540} height={960} quality={75}
                    placeholder={base64[j] ? 'blur' : 'empty'} blurDataURL={base64[j] || undefined} />
                ))}
              </div>
              <p className="cap part" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}><span>Fig. {pnum(i)} — {imageUrls.length} screens</span><span>Scroll →</span></p>
            </div>
          )}
          {p.aside === 'stack' && (
            <div className="hw reveal" style={{ padding: '32px 24px 20px' }}><i className="screw tl"></i><i className="screw tr"></i>
              <p className="part" style={{ marginBottom: 8 }}>The tech stack</p>
              <div className="stack-grid">
                {STACK.map(([what, lang, repo]) => (
                  <a key={repo} href={`https://github.com/laijackylai/${repo}`} target="_blank" rel="noopener noreferrer"><span>{what}</span><span className="label">{lang}</span><span className="repo">{repo} ↗</span></a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    ))}
    <button className="to-top" type="button" aria-label="Scroll to top"><Icon name="up" /></button>
  </main>
)

export default Projects

export const getStaticProps: GetStaticProps<Props> = async () => {
  const imageKeys = [
    'public/takcarly/takcarly_1.png',
    'public/takcarly/takcarly_2.png',
    'public/takcarly/takcarly_3.png',
  ];
  const urls = imageKeys.map(key => publicStorageUrl(key));

  try {
    // get blurred photos
    const photoBase64 = await Promise.all(
      urls.map(async (url: string) => {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(`Failed to fetch ${url}: ${res.status}`);
          }
          const buffer = Buffer.from(await res.arrayBuffer());
          const { base64 } = await getPlaiceholder(buffer);
          return base64
        } catch (error) {
          if (shouldFailStaticBuild()) {
            throw error;
          }
          return null;
        }
      })
    );

    return {
      props: {
        imageUrls: urls,
        base64: photoBase64
      },
      revalidate: 3600,
    };
  } catch (error) {
    if (shouldFailStaticBuild()) {
      throw error;
    }
    return {
      props: {
        imageUrls: urls,
        base64: urls.map(() => null)
      },
      revalidate: 3600,
    };
  }
};
