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
  photosData: PhotoData[],
  error: any,
}

const Photography: NextPage<Props> = ({
  photosData,
  error
}) => {
  // create random numbers
  const random = (min = 300, max = 600) => {
    let difference = max - min;
    let rand = Math.random();
    rand = Math.floor(rand * difference);
    rand = rand + min;
    return rand;
  }

  console.log(photosData, error)

  return (
    <div className={`grid grid-cols-5 global-font ${ocra.variable} font-sans`}>
      <Title />
      <ResponsiveDrawer />
      <div className='flex col-span-3 md:col-span-4 p-5 flex-col'>
        <div className='font-extrabold text-4xl fixed top-5 right-5 opacity-25 -z-50'>PHOTOGRAPHY</div>
        <div>
          {
            photosData && photosData.length > 0 && photosData.map((p, i) => {
              const isOdd = i % 2
              const wh = random()
              return (
                <div key={p.id} className={`gap-5 py-20 flex ${isOdd ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Image
                    quality={75}
                    src={p.url}
                    alt={p.s3key}
                    width={wh}
                    height={wh}
                    placeholder='blur'
                    blurDataURL={p.base64}
                  />
                  <div className={`flex flex-col text-xs ${isOdd ? 'text-right' : 'text-left'} overflow-clip`}  >
                    <div className='font-bold text-lg'>{p.type}</div>
                    <div>{p.id}</div>
                    <div>{p.s3key}</div>
                    <div>{p.createdAt}</div>
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  let error = "";

  // get all photos data from datastore
  const getPhotos = async () => {
    try {
      const res = await API.graphql(graphqlOperation(listPhotos))
      if ('data' in res) {
        return res.data.listPhotos.items
      }
    } catch (e: any) {
      console.log(e)
      error = e
      return []
    }
  }

  // shuffle the input array
  const shuffleArray = (array: Object[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // get all photos
  const photosData: Photo[] = await getPhotos()
  if (photosData.length) {
    return {
      props: {
        photosData: [],
        error: "no data"
      }
    }
  }

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

  // add photo urls and blurred photos
  const data = photosData.map((obj: Photo, i: number) => {
    return { ...obj, "url": photoUrls[i], "base64": photoBase64[i] };
  });

  return {
    props: {
      photosData: shuffleArray(data),
      error: error
    }
  }
}

export default Photography