import type { NextPage } from 'next'
import React, { useState } from 'react'
import Head from 'next/head'
import ResponsiveDrawer from './drawer'
import Home from './home'

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
                <Home />
            )
        case 'tech':
            return (
                <div>tech</div>
            )
        case 'photo':
            return (
                <div>photo</div>
            )
        case 'music':
            return (
                <div>music</div>
            )
        default:
            return null;
    }
}

const App: NextPage = () => {
    const [page, setPage] = useState('home')

    return (
        <div className="grid grid-cols-5">
            <Title />
            <ResponsiveDrawer setPage={setPage} />
            <ContentSwitch page={page} />
        </div>
    )
}

export default App
