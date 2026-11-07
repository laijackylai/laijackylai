import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import ocra, { doto, ibmPlexSans, michroma } from '../components/font'
import Layout from '../components/layout'

// next/font families feed the --font-* tokens in globals.css (set on :root so dialogs and the pager get them too)
const fontVars = `:root{--nf-display:${michroma.style.fontFamily};--nf-body:${ibmPlexSans.style.fontFamily};--nf-mono:${ocra.style.fontFamily};--nf-dot:${doto.style.fontFamily}}`

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/logos/logo_black.svg" type="image/svg+xml" />
            </Head>
            <style jsx global>{fontVars}</style>
            <Script id="ms-clarity" strategy="afterInteractive">
                {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "hkl116cujk");`}
            </Script>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </>
    )
}
