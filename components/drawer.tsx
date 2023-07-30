import React, { useEffect, useState } from 'react'
import { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../assets/logo/logo_black.svg';

interface DrawerProps {
}

const ResponsiveDrawer: NextPage<DrawerProps> = () => {
    const [imgSize, setImgSize] = useState(100)
    const [minImgSize, setMinImgSize] = useState(50)
    const [imgWidth, setImgWidth] = useState(imgSize)
    const [gap, setGap] = useState(4)
    const [ratio, setRatio] = useState(4)
    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        }
        window.addEventListener('DOMContentLoaded', handleWindowResize);
        handleWindowResize();

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [])

    useEffect(() => {
        if (windowWidth < 720) {
            console.info('mobile')
            setImgSize(50)
            setMinImgSize(30)
            setRatio(1)
        }
    })


    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            // * handle img
            setImgWidth(() => {
                const newWidth = imgSize - (currentScroll / 2)
                if (newWidth > minImgSize) {
                    const newGap = (newWidth / imgSize * ratio)
                    setGap(newGap)
                    return newWidth
                }
                else {
                    setGap(og => og)
                    return minImgSize
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
            <div className='fixed flex flex-row lg:flex-col justify-around lg:justify-normal col-span-1 lg:col-span-2 lg:h-full lg:px-5 lg:gap-2 z-10 w-screen lg:w-fit bg-gradient-to-t from-transparent to-white via-white'>
                <a href="/" className={`py-5 lg:py-16 min-h-min`}>
                    <Image alt={"logo"} src={logo} height={imgWidth} width={imgWidth} />
                </a>
                <ul className={`flex flex-row lg:flex-col font-sans font-normal text-base items-center lg:items-start`} style={{ gap: `${gap}rem` }}>
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
                    <li>
                        <Link href="/gis" >
                            <div className='cover-underline'>
                                <div className='global-font'>GIS</div>
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