import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Jacky Lai - Data Engineer & Software Engineer. Building and maintaining containerized data pipelines with expertise in Python, Kubernetes, and cloud solutions." />
        <meta name="keywords" content="data engineer, software engineer, python, kubernetes, docker, aws" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Jacky Lai - Data Engineer & Software Engineer" />
        <meta property="og:description" content="Data Engineer experienced in building and maintaining containerized data pipelines. Skilled in Python, Bash, Kubernetes, and automation." />
        <meta property="og:url" content="https://laijackylai.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Jacky Lai - Data Engineer & Software Engineer" />
        <meta name="twitter:description" content="Data Engineer experienced in building and maintaining containerized data pipelines. Skilled in Python, Bash, Kubernetes, and automation." />
        <link rel="canonical" href="https://laijackylai.com" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
