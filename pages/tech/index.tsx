import type { GetServerSideProps, GetStaticProps, NextPage } from 'next'
import MyPdfViewer from './pdfViewer'
import Image from 'next/image'
import githubLogo from '../../public/logos/github.png'
import pythonLogo from '../../public/logos/python.png'
import reactLogo from '../../public/logos/react.png'
import { Storage } from 'aws-amplify'
import ResponsiveDrawer from '../../components/drawer'
import ocra from '../../components/font'
import Title from '../../components/title'


type Props = {
  imageUrls: string[];
};

const Tech: NextPage<Props> = ({ imageUrls }) => {
  const hkterrainURL = "https://github.com/laijackylai/hkterrain"
  const hkdsmURL = "https://github.com/laijackylai/hkdsm"
  const hktidesURL = "https://github.com/laijackylai/hktides"
  const hkradarURL = "https://github.com/laijackylai/hkradar"

  return (
    <div className={`grid grid-cols-5 global-font ${ocra.variable} font-sans`}>
      <Title />
      <ResponsiveDrawer />
      <div className='flex col-span-3 md:col-span-4 p-5 flex-col'>
        <div className='font-extrabold text-4xl fixed top-5 right-5 opacity-25 -z-50'>TECH</div>
        <div>
          <div className='font-extrabold text-2xl'>Open Source Contribution</div>
          <div>
            <div className='flex flex-row gap-2'>
              Contributed to
              <a className='underline' href="https://loaders.gl" target='_blank'>
                <div>@loaders.gl</div>
              </a>
              <div>
                (
                <a className='underline' href="https://github.com/visgl/loaders.gl/pull/1372" target='_blank'>
                  PR
                </a>
                )
              </div>
            </div>
          </div>
          <div className='text-sm'>• Added support for an alternative triangular mesh generation technique (
            <a className='underline' href="https://github.com/mapbox/delatin" target='_blank'>
              Delatin
            </a>
            ) as an option for the terrain loader
          </div>
        </div>
        <div className='pt-10'>
          <div className='flex flex-row items-center'>
            <div className='font-extrabold text-2xl'>Senior Design Project</div>
          </div>
          <div>3D Tidal and Cloud Visualization System</div>
          <div className='p-2' />
          <div className='font-bold text-xl'>The Tech Stack</div>
          <div className='flex flex-row justify-between'>
            <div>
              <div>Data Processing:</div>
              <div className='flex flex-row items-center gap-3'>
                <div className=' text-sm'>• 3D Terrain (hkdsm)</div>
                <a>
                  <Image src={pythonLogo} alt={'pythonLogo'} height={15} width={15} />
                </a>
                <a href={hkdsmURL} target="_blank">
                  <Image src={githubLogo} alt={'githubLogo'} height={15} width={15} />
                </a>
              </div>
              <div className='flex flex-row items-center gap-3'>
                <div className=' text-sm'>• Tidal Data (hktides)</div>
                <a>
                  <Image src={pythonLogo} alt={'pythonLogo'} height={15} width={15} />
                </a>
                <a href={hktidesURL} target="_blank">
                  <Image src={githubLogo} alt={'githubLogo'} height={15} width={15} />
                </a>
              </div>
              <div className='flex flex-row items-center gap-3'>
                <div className=' text-sm'>• Radar Data (hkradar)</div>
                <a>
                  <Image src={pythonLogo} alt={'pythonLogo'} height={15} width={15} />
                </a>
                <a href={hkradarURL} target="_blank">
                  <Image src={githubLogo} alt={'githubLogo'} height={15} width={15} />
                </a>
              </div>
            </div>
            <div>
              <div className='pt-1'>Frontend:</div>
              <div className='flex flex-row items-center gap-3'>
                <div className=' text-sm'>• React.js (hkterrain)</div>
                <a>
                  <Image src={reactLogo} alt={'reactLogo'} height={15} width={15} />
                </a>
                <a href={hkterrainURL} target="_blank">
                  <Image src={githubLogo} alt={'githubLogo'} height={15} width={15} />
                </a>
              </div>
            </div>
            <div />
          </div>
          <div className='p-3' />
          <MyPdfViewer />
        </div>
        <div className='pt-10'>
          <div className='font-extrabold text-2xl'>Takcarly</div>
          <div className=''>A two in one app for taking care of elderly</div>
          <div className='text-sm'>• Caretakers can set events, schedule, remind & push custom notification events to the elderly that they are taking care of</div>
          <div className='flex overflow-x-auto pt-3 gap-5'>
            {/* {takcarlyUrl && takcarlyUrl.map(url => {
                        return (
                            <div className='rounded-lg' key={url}>
                                <Image quality={25} src={url} alt={url} width={500} height={500} />
                            </div>
                        )
                    })} */}
            {imageUrls && imageUrls.map(url => {
              return (
                <div className='rounded-lg' key={url}>
                  <Image quality={25} src={url} alt={url} width={500} height={500} />
                </div>
              )
            })}

          </div>
        </div>
      </div>
    </div>
  )
}

export default Tech

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const imageKeys = ["takcarly/takcarly_1.png", "takcarly/takcarly_2.png", "takcarly/takcarly_3.png"]
    const urls = await Promise.all(
      imageKeys.map((key) => Storage.get(key, { level: 'public' }))
    );
    return {
      props: {
        imageUrls: urls,
      },
    };
  } catch (error) {
    console.error('Error fetching images:', error);
    return {
      props: {
        imageUrls: [],
      },
    };
  }
};
