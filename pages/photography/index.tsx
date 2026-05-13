import { GetStaticProps, NextPage } from 'next';
import Title from '../../components/title';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import HorizontalDrawer from '../../components/horizontalDrawer'
import RevealOnScroll from '../../components/reviewOnScroll';

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
  const [isScrolledToTop, setIsScrolledToTop] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
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

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };

  }, []);

  useEffect(() => {
    if (!selectedPhoto) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPhoto]);

  const scrollUp = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div>
      <Title />
      <HorizontalDrawer />
      <div className='flex flex-col px-8 py-5 pt-12 sm:px-10 lg:px-24 lg:py-14 lg:pt-8 xl:px-32'>
        <button type="button" aria-label="Scroll to top" onClick={scrollUp} className='fixed bottom-5 right-5 lg:bottom-10 lg:right-10 p-3 bg-black text-white z-100' style={{ display: isScrolledToTop ? 'none' : 'block' }}>
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
        <div>
          {
            photosData && photosData.length > 0 && photosData.map((p, i) => {
              const isOdd = i % 2
              const wh = imageHeightsById[p.id] ?? 400
              const isInitialViewport = i < 2;
              const photoPaddingClass = i === 0 ? 'pt-8 pb-24 lg:pt-10 lg:pb-32' : 'py-24 lg:py-32';
              const photoContent = (
                <div className={`gap-5 ${photoPaddingClass} flex flex-col items-end lg:justify-start ${isOdd ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
                  <button
                    type="button"
                    aria-label={`Open full resolution photo ${p.s3key}`}
                    onClick={() => setSelectedPhoto(p)}
                    className='cursor-zoom-in bg-transparent p-0 text-left'
                  >
                    <Image
                      quality={65}
                      src={p.url}
                      alt={p.s3key}
                      width={wh * parseFloat(p.aspectRatio ? p.aspectRatio : '1')}
                      height={wh}
                      placeholder={p.blurredBase64 ? 'blur' : 'empty'}
                      blurDataURL={p.blurredBase64 ? p.blurredBase64 : undefined}
                      priority={isInitialViewport}
                      sizes='(min-width: 1024px) 50vw, 100vw'
                      className='object-cover hover:scale-105 transform ease-in duration-100 bg-gray-100'
                    />
                  </button>
                  <div className={`flex flex-col text-right ${isOdd ? 'lg:text-right' : 'lg:text-left'} overflow-clip`}  >
                    <div className='pb-2 font-display text-heading-3 uppercase tracking-display'>{p.type}</div>
                    <div className='font-mono text-label text-gray-400'>{p.id}</div>
                    <div className='font-mono text-label text-gray-400'>{p.s3key}</div>
                    <div className='font-body text-label text-gray-400'>{p.createdAt}</div>
                  </div>
                </div>
              );

              return isInitialViewport ? (
                <div key={p.id}>{photoContent}</div>
              ) : (
                <RevealOnScroll key={p.id}>{photoContent}</RevealOnScroll>
              );
            })
          }
        </div>
      </div>
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Full resolution photo ${selectedPhoto.s3key}`}
          className='fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 lg:p-8'
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className='relative'
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close full resolution photo"
              className='absolute bottom-0 left-full z-[101] bg-white px-3 py-2 font-mono text-label uppercase tracking-nav text-black'
              onClick={() => setSelectedPhoto(null)}
            >
              X
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.s3key}
              className='block max-h-[90vh] max-w-[90vw]'
            />
          </div>
        </div>
      )}
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

const publicStorageUrl = (key: string) => {
  const storageBaseUrl = getStorageBaseUrl();
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return `${storageBaseUrl.replace(/\/$/, '')}/${encodedKey}`;
};

const maxInlineBlurDataUrlLength = 2048;

const normalizeBlurDataUrl = (blurredBase64: string | null) => {
  if (!blurredBase64 || blurredBase64.length > maxInlineBlurDataUrlLength) {
    return null;
  }
  return blurredBase64;
};

const randomizePhotosForInitialLoad = (photos: PhotoData[]) => {
  const randomizedPhotos = [...photos];

  for (let i = randomizedPhotos.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomizedPhotos[i], randomizedPhotos[j]] = [randomizedPhotos[j], randomizedPhotos[i]];
  }

  return randomizedPhotos;
};

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
      blurredBase64: normalizeBlurDataUrl(photo.blurredBase64),
      url: publicStorageUrl(photo.s3key),
    }));

    return { props: { photosData: randomizePhotosForInitialLoad(photosData) }, revalidate: 60 };
  } catch (error) {
    if (shouldFailStaticBuild()) {
      throw error;
    }
    return { props: { photosData: [] }, revalidate: 60 };
  }
}

export default Photography
