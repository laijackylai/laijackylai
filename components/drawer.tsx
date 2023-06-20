import React, { useEffect, useState } from 'react'
import { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../assets/logo/logo_black.svg';

interface DrawerProps {

}

const ResponsiveDrawer: NextPage<DrawerProps> = () => {
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
        <div className='top-0 relative' data-testid="drawer-component">
            <div className='fixed flex flex-col col-span-2 md:col-span-1 h-full px-5'>
                <a href="/" className={`py-16 min-h-min`}>
                    <Image alt={"logo"} src={logo} height={imgWidth} width={imgWidth} />
                </a>
                <ul className={`flex flex-col font-sans font-normal text-base`} style={{ gap: `${gap}rem` }}>
                    <li>
                        <Link href="/tech">
                            <div className='cover-underline'>
                                <div className='global-font'>Tech</div>
                                <div />
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/photography" >
                            <div className='cover-underline'>
                                <div className='global-font'>Photography</div>
                                <div />
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/music" >
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