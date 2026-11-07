import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/layout'
import { fetchPhotos } from '../lib/storage'
import EbayLogo from '../public/logos/ebay_logo.svg'
import EbayLogo1999 from '../public/logos/ebay_logo_1999.svg'
import GDLogo from '../public/logos/g+d_logo.png'
import VotanicLogo from '../public/logos/votanic_logo.png'
import VivableeLogo from '../public/logos/vivablee_logo.png'
import HKOLogo from '../public/logos/hko_logo.png'
import CentalineLogo from '../public/logos/centaline_logo.png'

type Job = {
  href: string,
  logo: StaticImageData,
  logoAlt: string,
  logoHistory?: StaticImageData[],
  wrapClass?: string,
  title: string,
  at: string,
  description: string,
  tags: string[],
  start: string,
  end: string | null,
}

const JOBS: Job[] = [
  {
    href: 'https://www.ebay.com', logo: EbayLogo, logoAlt: 'eBay', logoHistory: [EbayLogo1999],
    title: 'Full Stack Engineer, Data & AI', at: 'eBay',
    description: "Build AI agents and tools that make it easy for research and product teams to get answers from eBay's large collection of survey and customer feedback data. Answer user analytics questions with charts and live dashboards.",
    tags: ['Python', 'TypeScript', 'MCP', 'AI agents', 'SQL'], start: '2026', end: null,
  },
  {
    href: 'https://www.gi-de.com/en/', logo: GDLogo, logoAlt: 'Giesecke+Devrient',
    title: 'Data Gen Engineer', at: 'Giesecke+Devrient',
    description: 'Ran and improved large-scale, containerized data generation systems for SIM and eUICC products, with a focus on automation, reliability and working across teams.',
    tags: ['Docker', 'k8s', 'Python', 'Bash'], start: '2023', end: '2026',
  },
  {
    href: 'https://www.votanic.com', logo: VotanicLogo, logoAlt: 'Votanic', wrapClass: 'votanic',
    title: 'Software Engineer', at: 'Votanic Limited',
    description: 'Redesigned software, enhanced performance and expanded platform compatibility. Real-time communication, full-stack deployment, compatibility testing, installation and licensing.',
    tags: ['Next.js', 'Electron', 'WPF .NET'], start: '2022', end: '2023',
  },
  {
    href: 'https://www.vivablee.com', logo: VivableeLogo, logoAlt: 'Vivablee',
    title: 'Co-Founder', at: 'Vivablee Limited',
    description: 'Oversaw strategic development to secure funding for continuous growth. Developed the Vivablee Android and iOS app.',
    tags: ['React Native', 'AWS'], start: '2020', end: '2024',
  },
  {
    href: 'https://www.hko.gov.hk/en/index.html', logo: HKOLogo, logoAlt: 'Hong Kong Observatory',
    title: 'Co-op', at: 'Hong Kong Observatory',
    description: 'Backend data processing pipeline for meteorological products on distributed MongoDB. Frontend visualization of high-dimensional meteorological data. MVP deployed on internal servers.',
    tags: ['Python', 'Cron', 'Deck.gl', 'MERN', 'Docker Compose'], start: '2020', end: '2021',
  },
  {
    href: 'https://hk.centanet.com/info/en/index', logo: CentalineLogo, logoAlt: 'Centaline Property Agency',
    title: 'Part-time Research Analyst', at: 'Centaline Property',
    description: 'Data-mining scripts for the latest property information across platforms. Automated processing and Centa-City Leading Index report generation.',
    tags: ['Python', 'Excel VBA'], start: '2019', end: '2020',
  },
]

const SKILLS: [string, string, string[]][] = [
  ['01', 'Data engineering', ['Docker & Kubernetes', 'Extract Load Transform', 'Data pipelines', 'Data modelling']],
  ['02', 'Data science', ['NumPy', 'Pandas', 'XGBoost', 'NLTK']],
  ['03', 'Full stack', ['ReactJS', 'NextJS', 'NodeJS', 'Django / Flask']],
  ['04', 'Cloud', ['Amazon Web Services', 'AWS Amplify', 'Vercel']],
]

const PROJECT_SHOTS = ['/images/rbrmesh.jpg', '/images/pitch-pose.jpg', '/images/flight-replay.jpg', '/images/iceland-planner.jpg', '/images/canadian-fires.png', '/images/delatin.png']
const MAPS = ['/gis/Toronto_Shooting_Rates_2022.png', '/gis/Cycle_Routes.png']

const FLASH_MS = 180

/** Company logo that flashes through its past logos (oldest first) on hover, then settles on the current one. */
const JobLogo = ({ job }: { job: Job }) => {
  const [frame, setFrame] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const history = job.logoHistory ?? []

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const flash = () => {
    if (!history.length || frame !== null || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const step = (i: number) => {
      setFrame(i < history.length ? i : null)
      if (i < history.length) timer.current = setTimeout(() => step(i + 1), FLASH_MS)
    }
    step(0)
  }

  return (
    <a className={`logo-wrap ${job.wrapClass ?? ''}`} href={job.href} target="_blank" rel="noopener noreferrer" onPointerEnter={flash}>
      <span style={{ position: 'relative', display: 'block' }}>
        <Image src={job.logo} alt={job.logoAlt} style={frame !== null ? { visibility: 'hidden' } : undefined} />
        {history.map((src, i) => (
          <Image key={i} src={src} alt="" aria-hidden style={{ position: 'absolute', inset: 0, margin: 'auto', display: frame === i ? 'block' : 'none' }} />
        ))}
      </span>
    </a>
  )
}

/** Page tile; on hover a faint greyscale picture from the page's own pool shows behind it, a different one each time. */
const Tile = ({ n, href, name, label, pool }: { n: string, href: string, name: string, label: string, pool: string[] }) => {
  const [pick, setPick] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const next = () => setPick(p => (pool.length < 2 ? 0 : (p + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length))

  useEffect(() => {
    next()
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- once on mount: random first picture

  return (
    // swap only after the fade-out finishes, so the next picture has loaded before the next hover
    <Link className="hw" href={href} onPointerLeave={() => { timer.current = setTimeout(next, 350) }} onBlur={() => { timer.current = setTimeout(next, 350) }}>
      {pool.length > 0 && <Image className="preview" src={pool[pick]} alt="" fill sizes="(min-width: 768px) 25vw, 100vw" quality={40} />}
      <i className="screw tl"></i><i className="screw tr"></i>
      <span className="top"><span className="dot-num">{n}</span><span className="part">JL-{n}</span></span>
      <span className="name">{name}<Icon name="arrow-ur" /></span>
      <span className="label">{label}</span>
    </Link>
  )
}

type Props = { photoPool: string[] }

const Home: NextPage<Props> = ({ photoPool }) => (
  <main id="main">
    <Head><title>HKLai</title></Head>
    <section className="hero noise-bg" aria-labelledby="hero-title">
      <div className="topline">
        <span className="label coords"><span>HK — 22.3193° N, 114.1694° E</span><span>TO — 43.6532° N, 79.3832° W</span></span>
        <div className="socials label">
          <a className="link-underline" href="https://linkedin.com/in/laijackylai" target="_blank" rel="noopener noreferrer">LinkedIn<Icon name="arrow-ur" className="icon-sm" /></a>
          <a className="link-underline" href="https://github.com/laijackylai" target="_blank" rel="noopener noreferrer">GitHub<Icon name="arrow-ur" className="icon-sm" /></a>
          <a className="link-underline" href="https://www.instagram.com/laijackylai/" target="_blank" rel="noopener noreferrer">Instagram<Icon name="arrow-ur" className="icon-sm" /></a>
        </div>
      </div>
      <div className="hero-main">
        <h1 className="hero-title" id="hero-title">Full Stack Engineer<br />Data &amp; AI</h1>
        <p className="hero-lede">Hi, I am Jacky. I&apos;m a full stack engineer focused on data and AI, building AI agents, data pipelines and dashboards. Skilled in Python, TypeScript, Kubernetes and LLM tooling.</p>
      </div>
      <div className="hero-meta">
        <span className="status label"><i aria-hidden="true"></i>Live · currently at eBay</span>
        <a className="scroll-btn" href="#skills" aria-label="Scroll to skills"><Icon name="down" /></a>
        <div className="hw readout" role="group" aria-label="Local time in Hong Kong and Toronto">
          <i className="screw tl" aria-hidden="true"></i><i className="screw tr" aria-hidden="true"></i>
          <div className="stack"><span className="part">Local time</span><span className="glyph" id="glyph" aria-hidden="true"></span></div>
          <div className="city"><span className="part">Hong Kong · HKT</span><span className="time dot-num" data-tz="Asia/Hong_Kong">--:--</span></div>
          <div className="city"><span className="part">Toronto · <span data-tz-abbr="America/Toronto">ET</span></span><span className="time dot-num" data-tz="America/Toronto">--:--</span></div>
        </div>
      </div>
    </section>

    <section className="skills seq-alt" id="skills" aria-labelledby="skills-title">
      <div className="inner">
        <div className="sec-head"><h2 id="skills-title">Skills</h2><span className="label" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><i className="pip"></i>04 disciplines</span></div>
        <dl>
          {SKILLS.map(([idx, name, items]) => (
            <div className="skill-row reveal" key={idx}><dt><span className="idx">{idx}</span><span>{name}</span></dt>
              <dd>
                <span className="rotator" style={{ ['--dur' as string]: `${items.length * 2}s` }} aria-hidden="true">{items.map(t => <span key={t}>{t}</span>)}</span>
                <span className="static-list">{items.join(' · ')}</span><span className="sr-only">{items.join(', ')}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>

    <section className="journey noise-bg" aria-labelledby="journey-title">
      <div className="inner">
        <div className="sec-head"><h2 id="journey-title">My Journey</h2><span className="label tabular">2019 — Present</span></div>
        <ol className="jobs">
          {JOBS.map(job => (
            <li className="job reveal" key={job.at}>
              <div>
                <JobLogo job={job} />
                <h3>{job.title} <span className="at">@ {job.at}</span></h3>
                <p>{job.description}</p>
                <ul className="tags">{job.tags.map(t => <li key={t}>{t}</li>)}</ul>
              </div>
              <div className="years">
                <div className="start">{job.start}</div>
                {job.end ? <div className="end label">— {job.end}</div> : <div className="end label now">Current</div>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <nav className="tiles" aria-label="Explore pages">
      <Tile n="02" href="/projects" name="Projects" label="3D, vision, maps, apps" pool={PROJECT_SHOTS} />
      <Tile n="03" href="/photography" name="Photography" label="Film + digital" pool={photoPool} />
      <Tile n="04" href="/music" name="Music" label="Recordings" pool={[]} />
      <Tile n="05" href="/gis" name="GIS" label="Spatial work" pool={MAPS} />
    </nav>
  </main>
)

export const getStaticProps: GetStaticProps<Props> = async () => {
  // hover pictures only: a missing or failing photo API must not break the home page build
  try {
    const urls = (await fetchPhotos('/')).map(p => p.url).sort(() => Math.random() - .5)
    return { props: { photoPool: urls.slice(0, 12) }, revalidate: 3600 }
  } catch {
    return { props: { photoPool: [] }, revalidate: 3600 }
  }
}

export default Home
