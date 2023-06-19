import type { NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import Title from '../components/title'
import ocra from '../components/font'
import logo from '../assets/logo/logo_black.svg';
import Image from 'next/image';

const App: NextPage = () => (
    <div className={`global-font ${ocra.variable} font-sans w-full h-screen sm:p-20 p-5 flex flex-col justify-between`}>
        <Title />
        {/* <ResponsiveDrawer /> */}
        <div className='flex sm:flex-row flex-col lg:justify-between justify-start gap-5 lg:items-center'>
            <div className='flex flex-row justify-between items-center self-start gap-5 w-96 overflow-auto'>
                <a href="/" className='mr-10'>
                    <Image alt={"logo"} src={logo} height={25} width={25} />
                </a>
                <a href='/work'>
                    <div className='cover-underline'>
                        <div className='global-font'>Work</div>
                    </div>
                </a>
                <a href='/tech'>
                    <div className='cover-underline'>
                        <div className='global-font'>Tech</div>
                    </div>
                </a>
                <a href='/photography'>
                    <div className='cover-underline'>
                        <div className='global-font'>Photography</div>
                    </div>
                </a>
                <a href='/music'>
                    <div className='cover-underline'>
                        <div className='global-font'>music</div>
                    </div>
                </a>
            </div>
            <a href="mailto:laijackylai@gmail.com" className="border border-black p-2 rounded-full relative overflow-hidden group w-fit">
                <span className="text-black z-10 relative group-hover:text-white">contact</span>
                <span className="absolute inset-0 bg-gradient-to-t from-black to-black opacity-0 group-hover:opacity-100"></span>
            </a>
        </div>
        <div className='col-span-5 flex flex-col items-end justify-end gap-20'>
            <div className="flex flex-col lg:text-8xl text-6xl font-['Sabon'] p-2 text-end font-bold">
                <div>Full Stack</div>
                <div>Software Engineer</div>
            </div>
            <div className='text-lg text-right lg:w-1/3 w-full'>
                Hi, I am Jacky. A software engineer with expertise in full-stack development, co-founding Vivablee, the mental health platform, and a passion for pushing the limits of technology
            </div>
        </div>
    </div>
)

export default App

