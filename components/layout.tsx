import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'
import { initSite, PAGES, SNAP_PAGES } from '../lib/site'

// Heroicons 20 solid
const ICONS: Record<string, string> = {
  'arrow-ur': '<path fill-rule="evenodd" d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z" clip-rule="evenodd"/>',
  'down': '<path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/>',
  'up': '<path fill-rule="evenodd" d="M14.78 11.78a.75.75 0 0 1-1.06 0L10 8.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06Z" clip-rule="evenodd"/>',
  'bars': '<path fill-rule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd"/>',
  'x': '<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>',
  'left': '<path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/>',
  'right': '<path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/>',
  'envelope': '<path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z"/><path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z"/>',
  'copy': '<path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z"/><path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z"/>',
  'play': '<path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z"/>',
  'sun': '<path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.061 1.06l1.06 1.06Z"/>',
  'moon': '<path fill-rule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clip-rule="evenodd"/>',
  'doc': '<path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 6.75a.75.75 0 0 1 1.5 0v2.546l.943-1.048a.75.75 0 0 1 1.114 1.004l-2.25 2.5a.75.75 0 0 1-1.114 0l-2.25-2.5a.75.75 0 1 1 1.114-1.004l.943 1.048V8.75Z" clip-rule="evenodd"/>',
}
const SPRITE = Object.entries(ICONS).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 20 20">${v}</symbol>`).join('')

export const Icon = ({ name, className = '' }: { name: string, className?: string }) => (
  <svg className={`icon ${className}`} aria-hidden="true"><use href={`#i-${name}`} /></svg>
)

const EMAIL = 'laijackylai@gmail.com'
const num = (i: number) => String(i + 1).padStart(2, '0')

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const path = router?.pathname ?? '/'
  const cur = Math.max(0, PAGES.findIndex(([, , href]) => href === path))
  const [page, label] = PAGES[cur]
  const current = (i: number) => (i === cur ? 'page' as const : undefined)

  useEffect(() => {
    document.documentElement.classList.toggle('snap-page', SNAP_PAGES.includes(path))
    return initSite({ page, push: (href: string) => router.push(href) })
  }, [page, path, router])

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: SPRITE }} />
      <a className="skip" href="#main">Skip to content</a>
      <header className="navbar" id="navbar">
        <i className="screw" aria-hidden="true"></i>
        <Link className="nav-brand" href="/" aria-label="HKLai home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="mark" src="/logos/logo_black.svg" alt="" width={30} height={30} />
          <span className="part">HKLai<br />JL—{num(cur)}</span>
        </Link>
        <nav className="seg" aria-label="Primary">
          <span className="ghost" aria-hidden="true"></span><span className="ind" aria-hidden="true"></span>
          {PAGES.map(([key, text, href], i) => (
            <Link key={key} href={href} aria-current={current(i)}><span className="n">{num(i)}</span>{text}</Link>
          ))}
        </nav>
        <span className="nav-cur" aria-hidden="true"><span className="dot-num">{num(cur)}</span>{label}</span>
        <div className="nav-end">
          <button className="theme-btn" type="button" data-theme-toggle aria-label="Switch theme"><Icon name="moon" className="moon" /><Icon name="sun" className="sun" /></button>
          <a className="btn btn-primary" href={`mailto:${EMAIL}`}><i className="pip" aria-hidden="true"></i>Contact</a>
          <button className="menu-btn" type="button" id="menu-btn" aria-expanded="false" aria-controls="sheet" aria-label="Open navigation menu"><Icon name="bars" /></button>
        </div>
        <nav className="sheet hw" id="sheet" aria-label="Mobile">
          <i className="screw tl" aria-hidden="true"></i><i className="screw tr" aria-hidden="true"></i>
          {PAGES.map(([key, text, href], i) => (
            <Link key={key} className="item" href={href} aria-current={current(i)}><span className="dot-num">{num(i)}</span>{text}<Icon name="right" /></Link>
          ))}
          <div className="sheet-foot"><span className="label">LinkedIn · GitHub · Instagram</span><a className="btn btn-primary" href={`mailto:${EMAIL}`}><i className="pip" aria-hidden="true"></i>Contact</a></div>
        </nav>
      </header>
      {children}
      <footer className="site">
        <div className="actions">
          <a className="btn btn-primary" href={`mailto:${EMAIL}`}><Icon name="envelope" />Email</a>
          <button className="btn" type="button" data-copy={EMAIL}><Icon name="copy" />Copy address</button>
          <span className="label" id="copy-status" role="status" aria-live="polite"></span>
        </div>
        <span className="label foot-meta"><button className="key-hint" type="button" data-keys-open>Press <kbd>?</kbd> for keys</button>© {new Date().getFullYear()} HKLai · JL—{num(cur)} {label}</span>
      </footer>
      <dialog className="keys hw" id="keys" aria-labelledby="keys-title">
        <i className="screw tl" aria-hidden="true"></i><i className="screw tr" aria-hidden="true"></i>
        <div className="keys-head"><h2 id="keys-title">Keys</h2><button className="theme-btn" type="button" data-keys-close aria-label="Close keyboard shortcuts"><Icon name="x" /></button></div>
        <dl>
          <div><dt><kbd>1</kbd>–<kbd>5</kbd></dt><dd>Go to page (Home … GIS)</dd></div>
          <div><dt><kbd>J</kbd> / <kbd>K</kbd></dt><dd>Next / previous section</dd></div>
          <div><dt><kbd>T</kbd></dt><dd>Toggle light / dark</dd></div>
          <div><dt><kbd>?</kbd></dt><dd>Show this panel</dd></div>
          <div><dt><kbd>Esc</kbd></dt><dd>Close panel or viewer</dd></div>
        </dl>
      </dialog>
    </>
  )
}
