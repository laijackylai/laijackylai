import type { NextPage } from 'next'
import MyPdfViewer from './pdfViewer'

const Tech: NextPage = () => {
    return (
        <div className='flex col-span-3 md:col-span-4 p-5 flex-col'>
            <div>
                <div className='font-extrabold text-4xl fixed top-5 right-5 opacity-25 -z-50'>Tech</div>
                <div className='font-extrabold text-xl'>Senior Design Project</div>
                <div>3D Tidal and Cloud Visualization System</div>
                <div className='p-3'></div>
                <MyPdfViewer />
            </div>
        </div>
    )
}

export default Tech