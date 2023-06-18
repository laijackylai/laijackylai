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
import { getPlaiceholder } from 'plaiceholder';
import { FaGithub } from 'react-icons/fa';

type Props = {
  imageUrls: string[];
  base64: string[];
};

const Tech: NextPage<Props> = ({ imageUrls, base64 }) => {
  const hkterrainURL = "https://github.com/laijackylai/hkterrain"
  const hkdsmURL = "https://github.com/laijackylai/hkdsm"
  const hktidesURL = "https://github.com/laijackylai/hktides"
  const hkradarURL = "https://github.com/laijackylai/hkradar"

  return (
    <div className={`grid grid-cols-5 global-font ${ocra.variable} font-sans`}>
      <Title />
      <ResponsiveDrawer />
      <div className='flex col-span-3 md:col-span-4 px-5 py-14 flex-col'>
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
                <a href="https://github.com/visgl/loaders.gl/pull/1372" target="_blank" rel="noopener noreferrer">
                  <FaGithub size={25} />
                </a>
              </div>
            </div>
          </div>
          <div className='text-sm pb-2'>• Added support for an alternative triangular mesh generation technique (
            <a className='underline' href="https://github.com/mapbox/delatin" target='_blank'>
              Delatin
            </a>
            ) as an option for the terrain loader
          </div>
          <a href='https://mapbox.github.io/delatin/' target="_blank" className='justify-center items-center self-center'>
            <Image src="/images/delatin.png" alt="delatin" width={800} height={100} />
          </a>
        </div>
        <div className='pt-28'>
          <div className='font-extrabold text-2xl flex flex-row gap-2 items-center'>
            NUXT Google Maps
            <a href="https://github.com/laijackylai/vue-google-maps" target="_blank" rel="noopener noreferrer">
              <FaGithub size={25} />
            </a>
          </div>
          <div className=''>A Vue Google Maps demo showcasing google maps & map search</div>
          <div className='text-sm pb-2'>• Tech Stack: Nuxt.js, Google Cloud Platform</div>
          <a href='https://laijackylai.github.io/vue-google-maps/' target="_blank" className='justify-center items-center self-center'>
            <Image src="/images/vue-google-maps.png" alt="vue-google-maps" width={800} height={200} />
          </a>
        </div>
        <div className='pt-28'>
          <div className='font-extrabold text-2xl flex flex-row gap-2 items-center'>
            Takcarly
            <a href="https://github.com/laijackylai/takcarly" target="_blank" rel="noopener noreferrer">
              <FaGithub size={25} />
            </a>
          </div>
          <div className=''>A two in one app for taking care of elderly</div>
          <div className='text-sm'>• Caretakers can set events, schedule, remind & push custom notification events to the elderly that they are taking care of</div>
          <div className='flex overflow-x-auto pt-3 gap-5'>
            {imageUrls && imageUrls.map((url, i) => {
              return (
                <div className='rounded-lg' key={url}>
                  <Image
                    quality={75}
                    src={url}
                    alt={url}
                    width={500}
                    height={500}
                    placeholder='blur'
                    blurDataURL={base64[i]}
                  />
                </div>
              )
            })}
          </div>
        </div>
        <div className='pt-28'>
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
          <MyPdfViewer />
        </div>
      </div>
    </div >
  )
}

export default Tech

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const imageKeys = ["takcarly/takcarly_1.png", "takcarly/takcarly_2.png", "takcarly/takcarly_3.png"]
    const urls = await Promise.all(
      imageKeys.map((key) => Storage.get(key, { level: 'public' }))
    );

    // get blurred photos
    const photoBase64 = await Promise.all(
      urls.map(async (url: string) => {
        const buffer = await fetch(url).then(async (res) =>
          Buffer.from(await res.arrayBuffer())
        );
        const { base64 } = await getPlaiceholder(buffer);
        return base64
      })
    );

    return {
      props: {
        imageUrls: urls,
        base64: photoBase64
      },
    };
  } catch (error) {
    console.error('Error fetching images:', error);
    return {
      props: {
        imageUrls: [],
        base64: []
      },
    };
  }
};
