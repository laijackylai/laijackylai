import type { NextPage } from 'next'
import React, { useState } from 'react'
import Head from 'next/head'
import ResponsiveDrawer from './drawer'
import Home from './work'
import Tech from './tech'
import Photo from './photo'
import Music from './music'
import Work from './work'

const Title: NextPage = () => {
    return (
        <Head>
            <title>HKLai</title>
            <link rel="icon" href="logo_black.ico" />
        </Head>
    )
}

interface ContentSwitchProps {
    page: string
}

const ContentSwitch: NextPage<ContentSwitchProps> = ({ page }) => {
    switch (page) {
        case 'home':
            return (
                <Work />
            )
        case 'tech':
            return (
                <Tech />
            )
        case 'photo':
            return (
                <Photo />
            )
        case 'music':
            return (
                <Music />
            )
        default:
            return null;
    }
}

const App: NextPage = () => {
    const [page, setPage] = useState('home')

    return (
        <div className="grid grid-cols-5 global-font">
            <Title />
            <ResponsiveDrawer setPage={setPage} />
            <ContentSwitch page={page} />
        </div>
    )
}

export default App
