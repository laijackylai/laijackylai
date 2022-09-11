import React from 'react'
import { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../assets/logo/logo_black.svg';

interface DrawerProps {
    setPage: React.Dispatch<any>
}

const ResponsiveDrawer: NextPage<DrawerProps> = ({ setPage }) => {
    return (
        <div className='flex flex-col col-span-1 h-screen px-20 sticky top-0'>
            <div className='py-28 min-h-min'>
                <Image src={logo} height="100vw" width="100vw" layout='fixed' />
            </div>
            <ul className='flex flex-col font-sans font-normal text-base gap-12'>
                <li onClick={() => setPage('home')}>
                    <Link href="/" >
                        <a className='cover-underline'>
                            <div className='global-font'>Work</div>
                            <div></div>
                        </a>
                    </Link>
                </li>
                <li onClick={() => setPage('tech')}>
                    <Link href="/">
                        <a className='cover-underline'>
                            <div className='global-font'>Tech</div>
                            <div></div>
                        </a>
                    </Link>
                </li>
                <li onClick={() => setPage('photo')}>
                    <Link href="/" >
                        <a className='cover-underline'>
                            <div className='global-font'>Photography</div>
                            <div></div>
                        </a>
                    </Link>
                </li>
                <li onClick={() => setPage('music')}>
                    <Link href="/" >
                        <a className='cover-underline'>
                            <div className='global-font'>Music</div>
                            <div></div>
                        </a>
                    </Link>
                </li>
            </ul>
        </div >
    )
}

export default ResponsiveDrawer