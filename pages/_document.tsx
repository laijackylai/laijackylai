import { Html, Head, Main, NextScript, DocumentProps } from 'next/document'
import { SNAP_PAGES } from '../lib/site'

export default function Document({ __NEXT_DATA__ }: DocumentProps) {
  // full-page snap scrolling is page-level CSS on <html>; set it server-side so the fixed navbar doesn't jump on hydrate
  return (
    <Html lang="en" className={SNAP_PAGES.includes(__NEXT_DATA__.page) ? 'snap-page' : undefined}>
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Jacky Lai - Full Stack Engineer, Data & AI. Building AI agents, data pipelines and dashboards with Python, TypeScript, Kubernetes and LLM tooling." />
        <meta name="keywords" content="full stack engineer, data engineer, ai, llm, mcp, python, typescript, kubernetes, docker, aws" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Jacky Lai - Full Stack Engineer, Data & AI" />
        <meta property="og:description" content="Full stack engineer focused on data and AI, building AI agents, data pipelines and dashboards. Skilled in Python, TypeScript, Kubernetes and LLM tooling." />
        <meta property="og:url" content="https://laijackylai.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Jacky Lai - Full Stack Engineer, Data & AI" />
        <meta name="twitter:description" content="Full stack engineer focused on data and AI, building AI agents, data pipelines and dashboards. Skilled in Python, TypeScript, Kubernetes and LLM tooling." />
        <link rel="canonical" href="https://laijackylai.com" />
        {/* set theme before paint to avoid a flash */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.dataset.theme=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.classList.add("js")` }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
