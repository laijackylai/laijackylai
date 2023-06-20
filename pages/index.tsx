import type { NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import Title from '../components/title'
import ocra from '../components/font'
import logo from '../assets/logo/logo_black.svg';
import Image from 'next/image';
import VotanicLogo from '../public/logos/votanic_logo.png'
import VivableeLogo from '../public/logos/vivablee_logo.png'
import HKOLogo from '../public/logos/hko_logo.png'

const App: NextPage = () => {
    const [scroll, setScroll] = useState(0)
    const [innerHeight, setInnerHeight] = useState(0)

    useEffect(() => {
        function handleScroll() {
            const scrollTop = window.scrollY;
            setScroll(scrollTop)
        }

        if (typeof window !== "undefined") {
            setInnerHeight(window.innerHeight)
            window.addEventListener("scroll", handleScroll);

            return () => {
                window.removeEventListener("scroll", handleScroll);
            };
        }
    }, []);

    const scrollDown = () => {
        const scrollHeight = window.innerHeight / 3;
        window.scrollTo({
            top: window.pageYOffset + scrollHeight,
            behavior: "smooth",
        });
    };

    const scrollUp = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    return (
        <div className={`global-font ${ocra.variable} font-sans w-full`}>
            <div className={`h-screen sm:p-16 p-5 flex flex-col justify-between`}>
                <Title />
                {/* <ResponsiveDrawer /> */}
                <div className='flex sm:flex-row flex-col md:justify-between lg:justify-between justify-start gap-5 md:items-center lg:items-center'>
                    <div className='flex flex-row justify-between items-center self-start gap-5 w-96 overflow-auto'>
                        <a href="/" className='mr-10'>
                            <Image alt={"logo"} src={logo} height={25} width={25} />
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
                <div className='flex flex-col gap-10 items-center'>
                    <div className='col-span-5 flex flex-col items-end justify-end gap-16'>
                        <div className="flex flex-col lg:text-8xl text-6xl font-['Sabon'] p-2 text-end font-bold">
                            <div>Full Stack</div>
                            <div>Software Engineer</div>
                        </div>
                        <div className='text-lg text-right lg:w-1/3 w-full'>
                            Hi, I am Jacky. A software engineer with expertise in full-stack development, co-founding Vivablee, the mental health platform, and a passion for pushing the limits of technology
                        </div>
                    </div>
                    {
                        scroll === 0
                            ?
                            <button onClick={scrollDown}>
                                <svg className="w-6 h-6 motion-safe:animate-bounce" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>
                            :
                            <button onClick={scrollUp}>
                                <svg className="w-6 h-6 motion-safe:animate-bounce" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                </svg>
                            </button>
                    }
                </div>
            </div>
            <div className='flex flex-col items-center gap-20 lg:p-16 p-5'>
                <div className="text-2xl font-bold font-['Sabon']">My Journey</div>
                <div className='w-full lg:px-32 px-5 pb-10 border-b flex flex-row justify-between items-center'>
                    <div className='flex flex-col gap-2 w-1/2'>
                        <Image className="bg-[#5c4c87] p-4 mb-8" alt={"votanic_logo"} src={VotanicLogo} height={400} width={200} />
                        <div className="font-['Sabon'] text-2xl">SOFTWARE ENGINEER @ VOTANIC LIMITED</div>
                        <div className="font-['Sabon']">
                            I redesigned software, enhanced performance, and expanded platform compatibility. I utilized Next.js, Electron, and WPF .NET for frontend development, implemented real-time communication, deployed full-stack solutions, conducted compatibility testing, and managed software installation and licensing.
                        </div>
                    </div>
                    <div className="flex flex-col items-end font-['Sabon']">
                        <div className="text-8xl">2022</div>
                        <div >- 2023</div>
                    </div>
                </div>
                <div className='w-full lg:px-32 px-5 pb-10 border-b flex flex-row justify-between items-center'>
                    <div className='flex flex-col gap-2 w-1/2'>
                        <Image className="py-4" alt={"vivablee_logo"} src={VivableeLogo} height={400} width={200} />
                        <div className="font-['Sabon'] text-2xl">CO-FOUNDER @ VIVABLEE LIMITED</div>
                        <div className="font-['Sabon']">
                            I oversaw strategic development to secure funding for continuous growth. I successfully developed the Vivablee Android and iOS app using React Native and AWS cloud services.
                        </div>
                    </div>
                    <div className="flex flex-col items-end font-['Sabon']">
                        <div className="text-8xl">2020</div>
                        <div >- Current</div>
                    </div>
                </div>
                <div className='w-full lg:px-32 px-5 pb-10 flex flex-row justify-between items-center'>
                    <div className='flex flex-col gap-2 w-1/2'>
                        <Image className="py-4" alt={"hko_logo"} src={HKOLogo} height={400} width={200} />
                        <div className="font-['Sabon'] text-2xl">CO-OP @ HONG KONG OBSERVATORY</div>
                        <div className="font-['Sabon']">
                            I developed a backend data processing pipeline using Python and Cron for multiple meteorological products, utilizing distributed MongoDB instances. Additionally, I created a frontend visualization system for high-dimensional meteorological data using Deck.gl and the MERN stack. I successfully deployed the MVP on internal servers using Docker and Docker-compose.
                        </div>
                    </div>
                    <div className="flex flex-col items-end font-['Sabon']">
                        <div className="text-8xl">2020</div>
                        <div >- 2021</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App

