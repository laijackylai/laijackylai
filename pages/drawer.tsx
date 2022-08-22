import React from 'react'
import { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';

interface DrawerProps {
    setPage: React.Dispatch<any>
}

const ResponsiveDrawer: NextPage<DrawerProps> = ({ setPage }) => {
    return (
        <div className='flex flex-col col-span-1 items-center h-screen'>
            <Image src={require("../assets/logo_black.svg")} height="750vw" />
            <ul className='flex flex-col font-sans font-normal text-base gap-10'>
                <li className='hover:underline hover:underline-offset-8' onClick={() => setPage('home')}>
                    <Link href="/" >
                        <a>Home</a>
                    </Link>
                </li>
                <li className='hover:underline hover:underline-offset-8' onClick={() => setPage('tech')}>
                    <Link href="/">
                        <a>Tech</a>
                    </Link>
                </li>
                <li className='hover:underline hover:underline-offset-8' onClick={() => setPage('photo')}>
                    <Link href="/" >
                        <a>Photography</a>
                    </Link>
                </li>
                <li className='hover:underline hover:underline-offset-8' onClick={() => setPage('music')}>
                    <Link href="/" >
                        <a>Music</a>
                    </Link>
                </li>
            </ul>
        </div >
    )
}

export default ResponsiveDrawer