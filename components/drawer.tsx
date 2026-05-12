import React, { useEffect, useState } from 'react'
import { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import logo from '../assets/logo/logo_black.svg';

interface DrawerProps {
}

const ResponsiveDrawer: NextPage<DrawerProps> = () => {
    const router = useRouter();
    const [imgSize, setImgSize] = useState(100)
    const [minImgSize, setMinImgSize] = useState(50)
    const [imgWidth, setImgWidth] = useState(imgSize)
    const [gap, setGap] = useState(4)
    const [ratio, setRatio] = useState(4)
    const [windowWidth, setWindowWidth] = useState<number | null>(null);

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        }
        window.addEventListener('resize', handleWindowResize);
        handleWindowResize();

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [])

    useEffect(() => {
        if (windowWidth === null) {
            return
        }

        if (windowWidth < 720) {
            console.info('mobile')
            setImgSize(50)
            setMinImgSize(30)
            setImgWidth(50)
            setRatio(1)
        } else {
            setImgSize(100)
            setMinImgSize(50)
            setImgWidth(100)
            setRatio(4)
        }
    }, [windowWidth])


    useEffect(() => {
        const handleScroll = () => {
            requestAnimationFrame(() => {
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
            })
        }

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [imgSize, minImgSize, ratio])

    const navLinkClass = (href: string) => (
        `cover-underline ${router.pathname === href ? 'border-l-4 border-sapphire-500 pl-2' : ''}`
    )

    const navTextClass = 'font-mono text-label uppercase tracking-nav'

    return (
        <div className='top-0 relative' data-testid="drawer-component">
            <div className='fixed flex flex-row lg:flex-col justify-around lg:justify-normal col-span-1 lg:col-span-2 lg:h-full lg:px-5 lg:gap-2 z-10 w-screen lg:w-fit bg-gradient-to-t from-transparent to-white via-white'>
                <Link href="/" className={`py-5 lg:py-16 min-h-min`}>
                    <Image alt={"logo"} src={logo} height={imgWidth} width={imgWidth} />
                </Link>
                <ul className={`flex flex-row lg:flex-col font-mono font-normal text-label items-center lg:items-start`} style={{ gap: `${gap}rem` }}>
                    <li>
                        <Link href="/projects">
                            <div className={navLinkClass('/projects')}>
                                <div className={navTextClass}>Projects</div>
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/photography" >
                            <div className={navLinkClass('/photography')}>
                                <div className={navTextClass}>Photography</div>
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/music" >
                            <div className={navLinkClass('/music')}>
                                <div className={navTextClass}>Music</div>
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/gis" >
                            <div className={navLinkClass('/gis')}>
                                <div className={navTextClass}>GIS</div>
                            </div>
                        </Link>
                    </li>
                </ul>
            </div >
        </div>
    )
}

export default ResponsiveDrawer
