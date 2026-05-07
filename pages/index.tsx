import type { NextPage } from 'next'
import React, { useEffect, useRef, useState } from 'react'
import Title from '../components/title'
import ocra from '../components/font'
import Image from 'next/image';
import VotanicLogo from '../public/logos/votanic_logo.png'
import VivableeLogo from '../public/logos/vivablee_logo.png'
import HKOLogo from '../public/logos/hko_logo.png'
import CentalineLogo from '../public/logos/centaline_logo.png'
import LinkedinLogo from '../public/logos/linkedin.png'
import GDLogo from "../public/logos/g+d_logo.png"
import GithubLogo from '../public/logos/github.png'
import InstagramLogo from '../public/logos/instagram.png'
import HorizontalDrawer from '../components/horizontalDrawer';
import AnimatedText from '../components/animatedText';
import RevealOnScroll from '../components/reviewOnScroll';

interface JourneyItem {
    href: string
    logoSrc: Parameters<typeof Image>[0]['src']
    logoAlt: string
    logoClassName: string
    title: string
    description: string
    startYear: string
    endYear: string
}

const journeyItems: JourneyItem[] = [
    {
        href: 'https://www.gi-de.com/en/',
        logoSrc: GDLogo,
        logoAlt: 'g+d_logo',
        logoClassName: 'mb-8',
        title: 'DATA GEN ENGINEER @ GIESECKE+DEVRIENT',
        description: 'Operate and optimize high-scale, containerized data generation systems for SIM and eUICC products, focusing on automation, reliability, and cross-functional collaboration. Mainly Utilizing Docker, k8s, Python & Bash.',
        startYear: '2023',
        endYear: 'Current',
    },
    {
        href: 'https://www.votanic.com',
        logoSrc: VotanicLogo,
        logoAlt: 'votanic_logo',
        logoClassName: 'bg-[#5c4c87] p-4 mb-8',
        title: 'SOFTWARE ENGINEER @ VOTANIC LIMITED',
        description: 'I redesigned software, enhanced performance, and expanded platform compatibility. I utilized Next.js, Electron, and WPF .NET for frontend development, implemented real-time communication, deployed full-stack solutions, conducted compatibility testing, and managed software installation and licensing.',
        startYear: '2022',
        endYear: '2023',
    },
    {
        href: 'https://www.vivablee.com',
        logoSrc: VivableeLogo,
        logoAlt: 'vivablee_logo',
        logoClassName: 'py-4',
        title: 'CO-FOUNDER @ VIVABLEE LIMITED',
        description: 'I oversaw strategic development to secure funding for continuous growth. I successfully developed the Vivablee Android and iOS app using React Native and AWS cloud services.',
        startYear: '2020',
        endYear: '2024',
    },
    {
        href: 'https://www.hko.gov.hk/en/index.html',
        logoSrc: HKOLogo,
        logoAlt: 'hko_logo',
        logoClassName: 'py-4',
        title: 'CO-OP @ HONG KONG OBSERVATORY',
        description: 'I developed a backend data processing pipeline using Python and Cron for multiple meteorological products, utilizing distributed MongoDB instances. Additionally, I created a frontend visualization system for high-dimensional meteorological data using Deck.gl and the MERN stack. I successfully deployed the MVP on internal servers using Docker and Docker-compose.',
        startYear: '2020',
        endYear: '2021',
    },
    {
        href: 'https://hk.centanet.com/info/en/index',
        logoSrc: CentalineLogo,
        logoAlt: 'centaline_logo',
        logoClassName: 'py-4',
        title: 'PART-TIME RESEARCH ANALYST @ CENTALINE PROPERTY AGENCY',
        description: 'I developed scripts for data-mining latest property information on various platforms and websites using Python and automated data processing and Centa-City Leading Index report generation using Excel VBA and Python',
        startYear: '2019',
        endYear: '2020',
    },
]

const App: NextPage = () => {
    const [scroll, setScroll] = useState(0)
    const [windowWidth, setWindowWidth] = useState(0)
    const scrollFrameRef = useRef<number | null>(null)

    useEffect(() => {
        function handleScroll() {
            if (scrollFrameRef.current !== null) {
                return
            }

            scrollFrameRef.current = requestAnimationFrame(() => {
                setScroll(window.scrollY)
                scrollFrameRef.current = null
            })
        }

        function handleResize() {
            setWindowWidth(window.innerWidth)
        }

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);
        setWindowWidth(window.innerWidth)

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
            if (scrollFrameRef.current !== null) {
                cancelAnimationFrame(scrollFrameRef.current)
            }
        };
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
            <div className={`relative h-screen p-5 lg:p-16 pt-0 lg:pt-0 flex flex-col justify-between bg-white z-20`}>
                <div className='absolute right-5 top-20 z-10 flex flex-row gap-7 items-center lg:right-8 lg:top-6'>
                    <a href="https://linkedin.com/in/laijackylai" target='_blank' rel="noopener noreferrer">
                        <Image className="grayscale" alt={"linkedin_logo"} src={LinkedinLogo} height={25} width={25} />
                    </a>
                    <a href="https://github.com/laijackylai" target='_blank' rel="noopener noreferrer">
                        <Image className="grayscale" alt={"github_logo"} src={GithubLogo} height={25} width={25} />
                    </a>
                    <a href="https://www.instagram.com/laijackylai/" target='_blank' rel="noopener noreferrer">
                        <Image className="grayscale mr-5 lg:mr-10" alt={"instagram_logo"} src={InstagramLogo} height={25} width={25} />
                    </a>
                    <a href="mailto:laijackylai@gmail.com" className="border border-black p-2 rounded-full relative overflow-hidden group w-fit">
                        <span className="text-black relative group-hover:text-white">contact</span>
                        <span className="absolute inset-0 bg-gradient-to-t from-black to-black opacity-0 group-hover:opacity-100"></span>
                    </a>
                </div>
                <Title />
                <HorizontalDrawer logoSize={25} width={windowWidth} />
                <div>
                    <div className="flex flex-col gap-10 items-center font-['Sabon']">
                        <div className='col-span-6 flex flex-col items-end justify-end gap-10 lg:gap-40 w-full'>
                            <div className="flex flex-col lg:text-8xl text-5xl p-2 text-end font-bold animate-fade-in-left">
                                <div>Data Engineer</div>
                                <div className='text-2xl lg:text-4xl font-normal'>&</div>
                                <div>Software Engineer</div>

                            </div>
                            <div className='text-lg text-right lg:w-1/3 w-full motion-safe:animate-fade-in-right'>
                                Hi, I am Jacky. I&apos;m a Data Engineer experienced in building and maintaining containerized data pipelines.
                                <br />
                                Skilled in Python, Bash, Kubernetes, and automation. Strong problem-solving and cross-team collaboration in high-scale, data-driven environments.
                            </div>
                        </div>
                        {/* moving down or up arrow */}
                        {
                            scroll === 0
                                ?
                                <button type="button" aria-label="Scroll down" onClick={scrollDown}>
                                    <svg className="w-6 h-6 motion-safe:animate-bounce" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>
                                :
                                <button type="button" aria-label="Scroll to top" onClick={scrollUp}>
                                    <svg className="w-6 h-6 motion-safe:animate-bounce" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                    </svg>
                                </button>
                        }
                    </div>
                </div>
            </div>
            <div className="py-20 flex flex-col gap-3 lg:gap-14 w-full bg-slate-800 text-white font-['Sabon']">
                <div className='flex flex-row gap-3 justify-center items-center'>
                    <div className="text-4xl font-extrabold pb-5">Skills</div>
                </div>
                <div className='flex flex-col gap-3 lg:gap-6 items-start w-fit self-center'>
                    <div className="flex items-center text-lg lg:text-2xl font-medium">
                        <div className="w-fit font-bold">Data Engineering:</div>
                        <span className="relative ml-3 lg:ml-5 h-8 lg:h-9 w-60 lg:w-80 overflow-hidden justify-center font-['Gluten']">
                            <span className="absolute h-full w-full -translate-y-full animate-slide-4 leading-none my-2" >
                                Docker & Kubernetes
                            </span>
                            <span className="absolute h-full w-full -translate-y-full animate-slide-4 leading-none [animation-delay:2s] my-2" >
                                Extract Load Transform
                            </span>
                            <span className="absolute h-full w-full -translate-y-full animate-slide-4 leading-none [animation-delay:4s] my-2" >
                                Data Pipelines
                            </span>
                            <span className="absolute h-full w-full -translate-y-full animate-slide-4 leading-none [animation-delay:6s] my-2" >
                                Data Modelling
                            </span>

                        </span>
                    </div>
                    <div className="flex items-center text-lg lg:text-2xl font-medium">
                        <div className="w-fit font-bold">Data Science:</div>
                        <span className="relative ml-3 lg:ml-5 h-8 lg:h-9 w-60 lg:w-80 overflow-hidden justify-center">
                            <span className="absolute h-full w-full -translate-y-full animate-slide-4 leading-none my-2" >
                                NumPy
                            </span>
                            <span className="absolute h-full w-full -translate-y-full animate-slide-4 leading-none [animation-delay:2s] my-2" >
                                Pandas
                            </span>
                            <span className="absolute h-full w-full -translate-y-full animate-slide-4 leading-none [animation-delay:4s] my-2" >
                                XGBoost
                            </span>
                            <span className="absolute h-full w-full -translate-y-full animate-slide-4 leading-none [animation-delay:6s] my-2" >
                                NLTK
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center text-lg lg:text-2xl font-medium">
                        <div className="w-fit font-bold">Full Stack:</div>
                        <span className="relative ml-3 lg:ml-5 h-8 lg:h-9 w-60 lg:w-80 overflow-hidden justify-center">
                            <span className="absolute h-full w-full -translate-y-full animate-slide-4 leading-none my-2" >
                                ReactJS
                            </span>
                            <span className="absolute h-full w-full -translate-y-full animate-slide-4 leading-none [animation-delay:2s] my-2" >
                                NextJS
                            </span>
                            <span className="absolute h-full w-full -translate-y-full animate-slide-4 leading-none [animation-delay:4s] my-2" >
                                NodeJS
                            </span>
                            <span className="absolute h-full w-full -translate-y-full animate-slide-4 leading-none [animation-delay:6s] my-2" >
                                Django / Flask
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center text-lg lg:text-2xl font-medium">
                        <div className="w-fit font-bold">Cloud:</div>
                        <span className="relative ml-3 lg:ml-5 h-8 lg:h-9 w-60 lg:w-80 overflow-hidden justify-center">
                            <span className="absolute h-full w-full -translate-y-full animate-slide-3 leading-none my-2" >
                                Amazon Web Services
                            </span>
                            <span className="absolute h-full w-full -translate-y-full animate-slide-3 leading-none [animation-delay:2s] my-2" >
                                Firebase
                            </span>
                            <span className="absolute h-full w-full -translate-y-full animate-slide-3 leading-none [animation-delay:4s] my-2" >
                                Vercel
                            </span>
                        </span>
                    </div>
                </div>
            </div>
            <div className='flex flex-col items-center gap-20 lg:p-16 p-5'>
                <div className="text-2xl font-bold font-['Sabon']">My Journey</div>
                {journeyItems.map((item, index) => (
                    <RevealOnScroll key={item.href}>
                        <div className={`w-full lg:px-32 px-5 pb-10 ${index < journeyItems.length - 1 ? 'border-b' : ''} flex flex-row justify-between items-center`}>
                            <div className='flex flex-col gap-2 w-2/3 lg:w-1/2'>
                                <a href={item.href} target='_blank' rel="noopener noreferrer">
                                    <Image className={item.logoClassName} alt={item.logoAlt} src={item.logoSrc} height={400} width={index === 0 ? 300 : 200} />
                                </a>
                                <div className="font-['Sabon'] text-2xl">{item.title}</div>
                                <div className="font-['Sabon']">{item.description}</div>
                            </div>
                            <div className="flex flex-col items-end font-['Sabon']">
                                <div className="text-4xl lg:text-8xl">{item.startYear}</div>
                                <div className={item.endYear === 'Current' ? 'font-bold' : ''}>- {item.endYear}</div>
                            </div>
                        </div>
                    </RevealOnScroll>
                ))}
            </div>
        </div>
    )
}

export default App
