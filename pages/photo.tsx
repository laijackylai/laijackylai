import type { NextPage } from 'next'
import Image from 'next/image'
import { useState } from 'react';
import useSWR from 'swr';
import ImageModal from './imageModal';

const fetcher = (url: string) => fetch(url).then((res) => res.json())
const imageQuality: number = 25

const Photo: NextPage = () => {
    const { data, error } = useSWR('/api/images', fetcher)

    const [modalOpen, setModalOpen] = useState(true);
    const [modalImage, setModalImage] = useState(nullImage)

    const ImageGridItem = ({ image }: { image: image }) => {
        const style = {
            gridColumn: `span ${image.colSpan}`
        }
        return (
            <div className='px-1 self-center' style={style} onClick={() => setModalImage(image)}>
                <Image className='rounded-sm' src={image.url} blurDataURL={image.url} width={image.width} height={image.height} objectFit='contain' quality={imageQuality} placeholder='blur' />
            </div>
        )
    }

    return (
        <div className='col-span-5 p-5 flex-col lg:col-span-4'>
            <div className='p-2 text-lg' >photo page</div>
            <div className='grid grid-cols-3 grid-flow-dense'>
                {data && data.imagesData.map((image: image, key: number) => <ImageGridItem key={key} image={image} />)}
            </div>
            {modalOpen && <ImageModal inputImage={modalImage} />}
        </div>
    )
}

const nullImage = {
    url: '',
    width: 0,
    height: 0,
    colSpan: 0
}

export interface image {
    url: string,
    width: number,
    height: number,
    colSpan: number,
}

export default Photo