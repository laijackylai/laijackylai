import type { NextPage } from 'next'
import React from 'react'
import ResponsiveDrawer from '../components/drawer'
import Title from '../components/title'
import ocra from '../components/font'

const App: NextPage = () => {
    return (
        <div className={`grid grid-cols-5 global-font ${ocra.variable} font-sans`}>
            <Title />
            <ResponsiveDrawer />
        </div>
    )
}

export default App
