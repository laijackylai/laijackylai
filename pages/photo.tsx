import type { NextPage } from 'next'
import Image from 'next/image'
import { XMasonry, XBlock } from "react-xmasonry"; // Imports precompiled bundle

import img1 from '../assets/images/000082500004.jpg'
import img2 from '../assets/images/000082500005.jpg'

const Photo: NextPage = () => {

    const rand = (s: number = 1, e: number = 2) => {
        return Math.floor(Math.random() * (e - s + 1) + s)
    }

    return (
        <div className='col-span-4 p-5 flex-col'>
            <div className='p-2 text-lg' >photo page</div>
            <XMasonry>
                <XBlock width={rand()}>
                    <div className="card">
                        <Image src={img1} layout='responsive' objectFit='contain' quality={75} placeholder='blur' />
                    </div>
                </XBlock>
                <XBlock width={rand()}>
                    <div className="card">
                        <Image src={img2} layout='responsive' objectFit='contain' quality={75} placeholder='blur' />
                    </div>
                </XBlock>
                <XBlock width={rand()}>
                    <div className="card">
                        <Image src={img1} layout='responsive' objectFit='contain' quality={75} placeholder='blur' />
                    </div>
                </XBlock>
                <XBlock width={rand()}>
                    <div className="card">
                        <Image src={img2} layout='responsive' objectFit='contain' quality={75} placeholder='blur' />
                    </div>
                </XBlock>
                <XBlock width={rand()}>
                    <div className="card">
                        <Image src={img2} layout='responsive' objectFit='contain' quality={75} placeholder='blur' />
                    </div>
                </XBlock>
            </XMasonry>
        </div>
    )
}

export default Photo