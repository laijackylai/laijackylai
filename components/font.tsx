import localFont from "@next/font/local";
import { IBM_Plex_Sans, Michroma } from "@next/font/google";

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

const eurostile = Michroma({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
})

export default ocra
export { ibmPlexSans, eurostile }
