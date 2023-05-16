import type { NextPage } from 'next'
import React, { useState } from 'react'
import Head from 'next/head'
import localFont from '@next/font/local'
import ResponsiveDrawer from './drawer'
import { Amplify } from 'aws-amplify'
import awsconfig from '../src/aws-exports';
import { Title } from './title'
import { ocra } from './font'

Amplify.configure(awsconfig)

const App: NextPage = () => {
    return (
        <div className={`grid grid-cols-5 global-font ${ocra.variable} font-sans`}>
            <Title />
            <ResponsiveDrawer />
        </div>
    )
}

export default App
