import Head from "next/head"
import type { NextPage } from 'next'

const Title: NextPage = () => {
  return (
    <Head data-testid="title-component">
      <title>HKLai</title>
      <link rel="icon" href="/logos/logo_black.svg" type="image/svg+xml" />
    </Head>
  )
}

export default Title
