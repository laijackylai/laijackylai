import { Amplify } from 'aws-amplify'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import awsconfig from '../src/aws-exports'
import { clarity } from 'react-microsoft-clarity'
import { useEffect } from 'react'

Amplify.configure(awsconfig)

function MyApp({ Component, pageProps }: AppProps) {
    useEffect(() => {
        clarity.init('hkl116cujk')
    }, [])

    return <Component {...pageProps} />
}

export default MyApp