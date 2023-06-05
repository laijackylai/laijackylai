import Head from "next/head"
import type { NextPage } from 'next'

const Title: NextPage = () => {
  return (
    <Head data-testid="title-component">
      <title>HKLai</title>
      <link rel="icon" href="logo_black.ico" />
    </Head>
  )
}

export default Title