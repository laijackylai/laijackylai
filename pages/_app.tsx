import { Amplify } from 'aws-amplify'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import awsconfig from '../src/aws-exports'
import Script from 'next/script'

Amplify.configure(awsconfig)

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Script id="ms-clarity" strategy="afterInteractive">
                {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "hkl116cujk");`}
            </Script>
            <Component {...pageProps} />
        </>
    )
}

export default MyApp
