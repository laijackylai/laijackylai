import React, { useEffect, useState } from 'react'
import { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../assets/logo/logo_black.svg';

interface DrawerProps {
    setPage: React.Dispatch<any>
}

const ResponsiveDrawer: NextPage<DrawerProps> = ({ setPage }) => {
    const [imgWidth, setImgWidth] = useState(100)
    const [gap, setGap] = useState(4)

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            // * handle img
            setImgWidth(() => {
                const newWidth = 100 - (currentScroll / 2)
                if (newWidth > 50) {
                    const newGap = (newWidth / 100 * 4)
                    setGap(newGap)
                    console.log(newGap)
                    return newWidth
                }
                else {
                    setGap(og => og)
                    return 50
                }
            })
        }

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    })

    return (
        <div className='top-0 relative'>
            <div className='fixed flex flex-col col-span-2 md:col-span-1 h-full px-5'>
                <div className={`py-16 min-h-min`}>
                    <Image alt={logo} src={logo} height={imgWidth} width={imgWidth} />
                </div>
                <ul className={`flex flex-col font-sans font-normal text-base`} style={{ gap: `${gap}rem` }}>
                    <li onClick={() => setPage('home')}>
                        <Link href="/" >
                            <div className='cover-underline'>
                                <div className='global-font'>Work</div>
                                <div />
                            </div>
                        </Link>
                    </li>
                    <li onClick={() => setPage('tech')}>
                        <Link href="/">
                            <div className='cover-underline'>
                                <div className='global-font'>Tech</div>
                                <div />
                            </div>
                        </Link>
                    </li>
                    <li onClick={() => setPage('photo')}>
                        <Link href="/" >
                            <div className='cover-underline'>
                                <div className='global-font'>Photography</div>
                                <div />
                            </div>
                        </Link>
                    </li>
                    <li onClick={() => setPage('music')}>
                        <Link href="/" >
                            <div className='cover-underline'>
                                <div className='global-font'>Music</div>
                                <div />
                            </div>
                        </Link>
                    </li>
                </ul>
            </div >
        </div>
    )
}

export default ResponsiveDrawer