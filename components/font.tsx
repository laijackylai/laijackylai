import localFont from "next/font/local";
import { Doto, IBM_Plex_Sans, Michroma } from "next/font/google";

const ocra = localFont({
  src: [
    {
      path: '../public/ocr-a/ocr-aregular.ttf',
      weight: '400'
    },
  ],
  variable: '--font-ocra'
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex',
})

const michroma = Michroma({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-michroma',
})

const doto = Doto({
  subsets: ['latin'],
  weight: ['600', '800'],
  variable: '--font-doto',
})

export default ocra
export { ibmPlexSans, michroma, doto }
