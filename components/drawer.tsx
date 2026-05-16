import React, { useEffect, useState } from 'react'
import { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../assets/logo/logo_black.svg';
import NavLinkBlob from './navLinkBlob';

interface DrawerProps {
}

const ResponsiveDrawer: NextPage<DrawerProps> = () => {
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

    return (
        <div className='top-0 relative' data-testid="drawer-component">
            <div className='fixed flex flex-row lg:flex-col justify-around lg:justify-normal col-span-1 lg:col-span-2 lg:h-full lg:px-5 lg:gap-2 z-10 w-screen lg:w-fit bg-gradient-to-t from-transparent to-white via-white'>
                <Link href="/" className={`py-5 lg:py-16 min-h-min`}>
                    <Image alt={"logo"} src={logo} height={imgWidth} width={imgWidth} />
                </Link>
                <ul className={`flex flex-row lg:flex-col font-mono font-normal text-body-sm items-center lg:items-start`} style={{ gap: `${gap}rem` }}>
                    <li>
                        <NavLinkBlob href="/projects" label="Projects" className="lg:w-full" />
                    </li>
                    <li>
                        <NavLinkBlob href="/photography" label="Photography" className="lg:w-full" />
                    </li>
                    <li>
                        <NavLinkBlob href="/music" label="Music" className="lg:w-full" />
                    </li>
                    <li>
                        <NavLinkBlob href="/gis" label="GIS" className="lg:w-full" />
                    </li>
                </ul>
            </div >
        </div>
    )
}

export default ResponsiveDrawer
