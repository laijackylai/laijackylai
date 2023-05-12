import Image from "next/image";
import { useEffect, useState } from "react";
import { image } from "./photo";

const ImageModal = ({ inputImage }: { inputImage: image }) => {
    const [wh, setWh] = useState(0)

    useEffect(() => {
        const listener = () => {
            setWh(window.innerHeight)
        }
        window.addEventListener('resize', listener)
        return () => {
            window.removeEventListener('resize', listener)
        }
    }, [])

    if (inputImage.url == '') {
        return null
    }

    return (
        <div className="w-screen h-fit fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 px-20 lg:px-40 bg-gray-600 bg-opacity-40">
            <Image alt={inputImage.url} className='rounded-sm' src={inputImage.url} blurDataURL={inputImage.url} width={inputImage.width} height={inputImage.height} layout="responsive" objectFit='contain' quality={100} placeholder='blur' />
        </div>
    )
}

export default ImageModal;