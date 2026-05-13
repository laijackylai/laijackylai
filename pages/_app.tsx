import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import ocra, { eurostile, ibmPlexSans } from '../components/font'

export default function MyApp({ Component, pageProps }: AppProps) {
    const fontVariables = `${ocra.variable} ${ibmPlexSans.variable} ${eurostile.variable} font-body`

    return (
        <>
            <Script id="ms-clarity" strategy="afterInteractive">
                {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "hkl116cujk");`}
            </Script>
            <div className={fontVariables}>
                <Component {...pageProps} />
            </div>
        </>
    )
}
