import { GetServerSideProps, NextPage } from 'next';
import ocra from '../../components/font';
import Title from '../../components/title';
import ResponsiveDrawer from '../../components/drawer';
import { API, Storage, graphqlOperation } from 'aws-amplify';
import { listPhotos } from '../../src/graphql/queries';
import { Photo } from '../../src/models';
import Image from 'next/image';
import { getPlaiceholder } from 'plaiceholder';

interface PhotoData extends Photo {
  url: string
  base64: string
}

type Props = {
  photosData: PhotoData[]
}

const Photography: NextPage<Props> = ({ photosData }) => {
  return (
    <div className={`grid grid-cols-5 global-font ${ocra.variable} font-sans`}>
      <Title />
      <ResponsiveDrawer />
      <div className='flex col-span-3 md:col-span-4 p-5 flex-col'>
        <div className='font-extrabold text-4xl fixed top-5 right-5 opacity-25 -z-50'>PHOTOGRAPHY</div>
        {
          photosData.map((p) => {
            return (
              <div key={p.id}>
                <div>{p.s3key}</div>
                <div className='rounded-lg' key={p.url}>
                  <Image
                    quality={75}
                    src={p.url}
                    alt={p.s3key}
                    width={500}
                    height={500}
                    placeholder='blur'
                    blurDataURL={p.base64}
                  />
                </div>
              </div>
            )
          }
          )
        }
      </div>
    </div>
  );
}

const getPhotos = async () => {
  try {
    const res = await API.graphql(graphqlOperation(listPhotos))
    if (res instanceof Object && 'data' in res) {
      return res.data.listPhotos.items
    }
  } catch (error) {
    console.log(error)
    return []
  }
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // get all photos
  const photosData = await getPhotos()

  // get photo urls
  const photoUrls = await Promise.all(
    photosData.map((o: Photo) => Storage.get(o.s3key, { level: 'public' }))
  );

  // get blurred photos
  const photoBase64 = await Promise.all(
    photoUrls.map(async (url: string) => {
      const buffer = await fetch(url).then(async (res) =>
        Buffer.from(await res.arrayBuffer())
      );
      const { base64 } = await getPlaiceholder(buffer);
      return base64
    })
  );

  const data = photosData.map((obj: Photo, i: number) => {
    return { ...obj, "url": photoUrls[i], "base64": photoBase64[i] };
  });

  return {
    props: {
      photosData: data
    }
  }
}

export default Photography