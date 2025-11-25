import { GetServerSideProps, NextPage } from 'next';
import ocra from '../../components/font';
import Title from '../../components/title';
import ResponsiveDrawer from '../../components/drawer';
import { DataStore, Storage, graphqlOperation } from 'aws-amplify';
import { Photo } from '../../src/models';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import HorizontalDrawer from '../../components/horizontalDrawer'
import RevealOnScroll from '../../components/reviewOnScroll';
// import { getPlaiceholder } from 'plaiceholder';
// import { decode } from 'blurhash';

interface PhotoData extends Photo {
  url: string,
}

type Props = {
  photosData: PhotoData[],
}

const Photography: NextPage<Props> = ({
  photosData,
}) => {
  // create random numbers
  const random = (min = 300, max = 500) => {
    let difference = max - min;
    let rand = Math.random();
    rand = Math.floor(rand * difference);
    rand = rand + min;
    return rand;
  }

  const [windowWidth, setWindowWidth] = useState(28)
  const [isScrolledToTop, setIsScrolledToTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledToTop(window.scrollY === 0);
    };
    window.addEventListener('scroll', handleScroll);
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth)
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };

  }, []);

  const scrollUp = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // // get blurred photos
  // const getBlurredPhotos = async () => {
  //   const photoBase64 = await Promise.all(
  //     photosData.map(async (p: PhotoData) => {
  //       const buffer = await fetch(p.url).then(async (res) =>
  //         Buffer.from(await res.arrayBuffer())
  //       );
  //       const { base64 } = await getPlaiceholder(buffer);
  //       return base64
  //     })
  //   );
  // }

  return (
    <div className={`global-font ${ocra.variable} font-sans p-5 lg:p-14`}>
      <Title />
      <div className='flex flex-col'>
        <HorizontalDrawer logoSize={25} width={windowWidth} />
        {/* <div className='font-extrabold text-4xl fixed top-5 right-5 opacity-25 -z-50'>PHOTOGRAPHY</div> */}
        <button onClick={scrollUp} className='fixed bottom-5 right-5 lg:bottom-10 lg:right-10 p-2 bg-gray-200 rounded-full z-100' style={{ display: isScrolledToTop ? 'none' : 'block' }}>
          <svg className="w-6 h-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
        <div>
          {
            photosData && photosData.length > 0 && photosData.map((p, i) => {
              const isOdd = i % 2
              const wh = random()
              return (
                <RevealOnScroll key={p.id}>
                  <div className={`gap-5 py-20 flex flex-col items-end lg:justify-start ${isOdd ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
                    <Image
                      quality={75}
                      src={p.url}
                      alt={p.s3key}
                      width={wh * parseFloat(p.aspectRatio ? p.aspectRatio : '1')}
                      height={wh}
                      placeholder='blur'
                      blurDataURL={p.blurredBase64 ? p.blurredBase64 : undefined}
                      loading='lazy'
                      className='object-cover hover:scale-105 transform ease-in duration-100 bg-gray-500'
                    />
                    <div className={`flex flex-col text-xs text-right ${isOdd ? 'lg:text-right' : 'lg:text-left'} overflow-clip`}  >
                      <div className='font-bold text-lg'>{p.type}</div>
                      <div>{p.id}</div>
                      <div>{p.s3key}</div>
                      <div>{p.createdAt}</div>
                    </div>
                  </div>
                </RevealOnScroll>
              )
            })
          }
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {

  // get all photos data from datastore
  const getPhotos = async () => {
    const res = await DataStore.query(Photo).catch(e => {})
    return res
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
  const photosData = await getPhotos()
  if (!photosData) {
    return {
      props: {
        photosData: [],
      }
    }
  }

  // get photo urls
  const photoUrls = await Promise.all(
    photosData.map((o: Photo) => Storage.get(o.s3key, { level: 'public' }))
  );

  // add photo urls and blurred photos
  const data = photosData.map((obj: Photo, i: number) => {
    return {
      ...obj,
      "url": photoUrls[i],
      // "base64": photoBase64[i]
    };
  });

  return {
    props: {
      photosData: shuffleArray(data),
    }
  }
}

export default Photography