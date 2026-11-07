import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import type { ReactNode } from 'react'
// @ts-ignore
import { getPlaiceholder } from 'plaiceholder'
import { Icon } from '../../components/layout'
import { publicStorageUrl, shouldFailStaticBuild } from '../../lib/storage'

type Props = {
  imageUrls: string[];
  base64: Array<string | null>;
};

type Shot = { src: string, alt: string, width: number, height: number, caption: [string, string] }
type Project = {
  id: string, kind: string, title: string, sub: ReactNode, points?: ReactNode[], tags?: string[],
  links?: { href: string, label: string, icon?: string }[], shot?: Shot, aside?: 'takcarly' | 'stack',
}

const PROJECTS: Project[] = [
  {
    id: 'rbrmesh', kind: '3D reconstruction', title: 'rbrmesh',
    sub: 'Turns 360° road video into a textured, drivable stage for Richard Burns Rally.',
    points: ['12-stage pipeline with typed, hashed TOML configs and QA checks at every stage.', 'Camera poses and depth from MASt3R and Depth Anything V2; road found with SegFormer.', 'Continuous road mesh refined against multiple views, exported to the game via Blender.', 'Python, PyTorch, Open3D, OpenCV, Blender.'],
    shot: { src: '/images/rbrmesh.jpg', alt: 'rbrmesh road point cloud shown in isometric, top-down and driver views', width: 1400, height: 384, caption: ['Stage 7 · global alignment', '34M points'] },
  },
  {
    id: 'pitchpose', kind: 'Computer vision', title: 'PitchPose',
    sub: 'Follows footballers through match video and estimates their 2D and 3D pose, facing and direction of travel.',
    points: ['Identity first: missing frames are acceptable, wrong-player frames are not.', 'One-command pipeline: SAM2 tracking, keypoints, anatomy and motion corrections, pose and heading.', 'Compares and fuses RTMPose, Sapiens2, GVHMR and MotionBERT.', 'Python, PyTorch, YOLO11-pose, OpenCV, Gradio.'],
    shot: { src: '/images/pitch-pose.jpg', alt: 'PitchPose review frame with player skeletons and facing-direction dials', width: 1400, height: 673, caption: ['Frame 186', 'Pose + heading'] },
  },
  {
    id: 'flight', kind: '3D · Simulation', title: 'Flight Replay',
    sub: 'A 3D replay of Apollo 11 and Starship Flight 13 that you can play, pause and scrub, built from the real mission records.',
    points: ['Apollo 11 paths calculated with real physics and matched to NASA reports; lunar terrain from LRO data.', 'Starship flight read off the webcast frame by frame, with reconstructed parts labelled.', 'Automatic broadcast-style camera, NASA footage and subtitles in sync with mission time.', 'React, TypeScript, Three.js, Zustand, Vitest.'],
    shot: { src: '/images/flight-replay.jpg', alt: 'Apollo 11 lunar module descending over the Moon in Flight Replay', width: 1400, height: 875, caption: ['Eagle descent', 'Three.js · WebGL2'] },
  },
  {
    id: 'iceland', kind: 'Maps · Planning', title: 'Iceland Road Trip Planner',
    sub: 'An interactive map planner for a 14-day Iceland Ring Road and Highlands camping trip.',
    points: ['389 places with real road routing from OSRM and a day-by-day time budget.', 'Warns about overpacked days, late arrivals and highland roads that may still be closed.', 'Python data pipeline merging Wikidata, OpenStreetMap and 160 campsites.', 'React, TypeScript, Vite, Leaflet, SunCalc.'],
    shot: { src: '/images/iceland-planner.jpg', alt: 'Iceland Road Trip Planner map with colour-coded daily routes and itinerary', width: 1400, height: 850, caption: ['14 days · 3,030 km', 'Leaflet + OSRM'] },
  },
  {
    id: 'tidal', kind: 'Senior design project', title: '3D Tidal and Cloud Visualization System',
    sub: 'Python processing for terrain, tidal and radar data, rendered in a React frontend.',
    links: [{ href: '/docs/FYP-Final-Report.pdf', label: 'Technical report · PDF 1.6 MB', icon: 'doc' }],
    aside: 'stack',
  },
  {
    id: 'loaders', kind: 'Open source contribution', title: 'loaders.gl terrain',
    sub: <>Contributed to <a className="link-underline" href="https://loaders.gl" target="_blank" rel="noopener noreferrer">@loaders.gl</a>.</>,
    points: [<>Added an alternative triangular mesh technique, <a className="link-underline" href="https://github.com/mapbox/delatin" target="_blank" rel="noopener noreferrer">Delatin</a>, as an option for the terrain loader.</>],
    links: [{ href: 'https://github.com/visgl/loaders.gl/pull/1372', label: 'Pull request #1372' }, { href: 'https://mapbox.github.io/delatin/', label: 'Delatin demo' }],
    shot: { src: '/images/delatin.png', alt: 'Delatin triangular mesh generated over a terrain height map', width: 1021, height: 192, caption: ['Delatin mesh', 'visgl/loaders.gl'] },
  },
  {
    id: 'fires', kind: 'Visualisation / ML', title: 'Canadian Fires',
    sub: 'Visualizing historical Canadian fires from 1930–2021 and predicting future fires in Ontario.',
    points: ['Historical fire map with Deck.gl', 'Natural-language search with NLTK', 'Ontario forecast with XGBoost regression', 'Flask and SQLite backend'],
    links: [{ href: 'https://canadian-fires.vercel.app/', label: 'Live demo' }, { href: 'https://github.com/laijackylai/canadianFires', label: 'Source' }],
    shot: { src: '/images/canadian-fires.png', alt: 'Canadian Fires map showing historical fire locations across Canada', width: 1400, height: 803, caption: ['1930–2021', 'canadian-fires.vercel.app'] },
  },
  {
    id: 'takcarly', kind: 'Mobile · iOS', title: 'Takcarly',
    sub: 'A two-in-one app for taking care of the elderly.',
    points: ['Caretakers set events and schedules, and push reminders and custom notifications to the person they look after.'],
    links: [{ href: 'https://apps.apple.com/ca/app/takcarly/id1664211405', label: 'App Store' }, { href: 'https://github.com/laijackylai/takcarly', label: 'Source' }],
    aside: 'takcarly',
  },
]

const STACK = [
  ['3D terrain', 'Python', 'hkdsm'],
  ['Tidal data', 'Python', 'hktides'],
  ['Radar data', 'Python', 'hkradar'],
  ['Frontend', 'React.js', 'hkterrain'],
]

const pnum = (i: number) => `P.${String(i + 1).padStart(2, '0')}`

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
            {p.links && (
              <div className="links">
                {p.links.map((l, j) => (
                  <a key={l.href} className={`btn ${j === 0 ? 'btn-primary' : ''}`} href={l.href} target="_blank" rel="noopener noreferrer">
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
