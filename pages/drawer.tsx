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
                <li onClick={() => setPage('home')}>
                    <Link href="/" >
                        <a className='cover-underline'>
                            <a>Home</a>
                            <a></a>
                        </a>
                    </Link>
                </li>
                <li onClick={() => setPage('tech')}>
                    <Link href="/">
                        <a className='cover-underline'>
                            <a>Tech</a>
                            <a></a>
                        </a>
                    </Link>
                </li>
                <li onClick={() => setPage('photo')}>
                    <Link href="/" >
                        <a className='cover-underline'>
                            <a>Photography</a>
                            <a></a>
                        </a>
                    </Link>
                </li>
                <li onClick={() => setPage('music')}>
                    <Link href="/" >
                        <a className='cover-underline'>
                            <a>Music</a>
                            <a></a>
                        </a>
                    </Link>
                </li>
            </ul>
        </div >
    )
}

export default ResponsiveDrawer