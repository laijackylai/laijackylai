import localFont from "@next/font/local";

const ocra = localFont({
  src: [
    {
      path: '../public/ocr-a/ocr-aregular.ttf',
      weight: '400'
    },
  ],
  variable: '--font-ocra'
})

export default ocra