import type { NextComponentType, NextPage } from 'next'
import Image from 'next/image'
import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const Photo: NextPage = () => {
    const { data, error } = useSWR('/api/images', fetcher)

    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div className='col-span-4 p-5 flex-col'>
            <div className='p-2 text-lg' >photo page</div>
            <div className='grid grid-cols-3 grid-flow-dense'>
                {data && data.imagesData.map((image: image, key: number) => <ImageGridItem key={key} image={image} />)}
            </div>
        </div>
    )
}

const ImageGridItem = ({ image }: { image: image }) => {
    const style = {
        gridColumn: `span ${image.colSpan}`
    }
    return (
        <div className='px-1 self-center' style={style}>
            <Image src={image.url} blurDataURL={image.url} width={image.width} height={image.height} objectFit='contain' quality={50} placeholder='blur' />
        </div>
    )
}

interface image {
    url: string,
    width: number,
    height: number,
    colSpan: number,
}

export default Photo