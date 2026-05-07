import { GetStaticProps, NextPage } from 'next';
import ocra from '../../components/font';
import Title from '../../components/title';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import HorizontalDrawer from '../../components/horizontalDrawer'
import RevealOnScroll from '../../components/reviewOnScroll';
// import { getPlaiceholder } from 'plaiceholder';

export type PhotoData = {
  id: string,
  s3key: string,
  type: string,
  aspectRatio: string,
  blurredBase64: string | null,
  createdAt?: string | null,
  url: string,
}

type Props = {
  photosData: PhotoData[],
}

const Photography: NextPage<Props> = ({
  photosData,
}) => {
  const [windowWidth, setWindowWidth] = useState(28)
  const [isScrolledToTop, setIsScrolledToTop] = useState(true);
  const imageHeightsById = useMemo(() => {
    return photosData.reduce<Record<string, number>>((acc, photo) => {
      const hash = Array.from(photo.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
      acc[photo.id] = 300 + (hash % 200);
      return acc;
    }, {});
  }, [photosData]);

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
        <button type="button" aria-label="Scroll to top" onClick={scrollUp} className='fixed bottom-5 right-5 lg:bottom-10 lg:right-10 p-2 bg-gray-200 rounded-full z-100' style={{ display: isScrolledToTop ? 'none' : 'block' }}>
          <svg className="w-6 h-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
        <div>
          {
            photosData && photosData.length > 0 && photosData.map((p, i) => {
              const isOdd = i % 2
              const wh = imageHeightsById[p.id] ?? 400
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

const defaultStorageBaseUrl = 'https://laijackylai-storage-4ba35e5623621-main.s3.ap-southeast-1.amazonaws.com';

const shouldFailStaticBuild = () => (
  process.env.NODE_ENV === 'production' && process.env.GITHUB_ACTIONS !== 'true'
);

const getStorageBaseUrl = () => {
  if (!process.env.STORAGE_BASE_URL && shouldFailStaticBuild()) {
    throw new Error('STORAGE_BASE_URL is required to build /photography');
  }
  return process.env.STORAGE_BASE_URL || defaultStorageBaseUrl;
};

// Gen 1 DynamoDB stores s3keys as bare paths (e.g. "photos/film/x.jpg"); Gen 1
// v5 SDK silently prepended "public/" before talking to S3. This shim keeps the
// same behavior so both bucket layouts resolve. Remove once Phase 2 migration
// rewrites s3keys with the explicit "public/" prefix.
const publicStorageUrl = (key: string) => {
  const storageBaseUrl = getStorageBaseUrl();
  const normalizedKey = key.startsWith('public/') ? key : `public/${key}`;
  const encodedKey = normalizedKey.split('/').map(encodeURIComponent).join('/');
  return `${storageBaseUrl.replace(/\/$/, '')}/${encodedKey}`;
};

const shuffleArray = <T,>(array: T[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  if (!process.env.APPSYNC_URL || !process.env.APPSYNC_API_KEY) {
    if (shouldFailStaticBuild()) {
      throw new Error('APPSYNC_URL and APPSYNC_API_KEY are required to build /photography');
    }
    return { props: { photosData: [] }, revalidate: 60 };
  }

  try {
    const query = /* GraphQL */ `
      query ListPhotos {
        listPhotos {
          items {
            id
            s3key
            type
            aspectRatio
            blurredBase64
            createdAt
          }
        }
      }
    `;
    const res = await fetch(process.env.APPSYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.APPSYNC_API_KEY,
      },
      body: JSON.stringify({ query }),
    });
    const json = await res.json();
    if (res.ok === false || json.errors) {
      throw new Error(JSON.stringify(json.errors ?? { status: res.status }));
    }
    const photos = (json.data?.listPhotos?.items ?? []) as Omit<PhotoData, 'url'>[];
    const photosData = photos.map((photo) => ({
      ...photo,
      id: photo.id || photo.s3key,
      url: publicStorageUrl(photo.s3key),
    }));

    return { props: { photosData: shuffleArray(photosData) }, revalidate: 60 };
  } catch (error) {
    if (shouldFailStaticBuild()) {
      throw error;
    }
    return { props: { photosData: [] }, revalidate: 60 };
  }
}

export default Photography
