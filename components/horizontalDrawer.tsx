import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import logo from '../assets/logo/logo_black.svg';
import { useEffect, useState } from 'react';

type Props = {
  logoSize?: number
  width?: number
}

const HorizontalDrawer: React.FC<Props> = ({ logoSize = 25, width = 40 }) => {

  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navLinkClass = (href: string) => (
    `cover-underline ${router.pathname === href ? 'text-sapphire-500' : ''}`
  );

  const navTextClass = 'font-mono text-body-sm uppercase tracking-nav';

  return isDesktop ?
    (
      <div
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex w-screen px-5 py-10 lg:px-16"
      >
        <div
          className="flex flex-row justify-between items-center gap-5 overflow-auto"
          style={{ width: `${width}rem` }}
        >
          <Link href="/" className='lg:mr-10'>
            <Image alt={"logo"} src={logo} height={logoSize * 2} width={logoSize * 2} />
          </Link>
          <Link href='/projects'>
            <div className={navLinkClass('/projects')}>
              <div className={navTextClass}>Projects</div>
            </div>
          </Link>
          <Link href='/photography'>
            <div className={navLinkClass('/photography')}>
              <div className={navTextClass}>Photography</div>
            </div>
          </Link>
          <Link href='/music'>
            <div className={navLinkClass('/music')}>
              <div className={navTextClass}>Music</div>
            </div>
          </Link>
          <Link href='/gis'>
            <div className={navLinkClass('/gis')}>
              <div className={navTextClass}>GIS</div>
            </div>
          </Link>
        </div>
      </div>
    )
    :
    (
      <div className='flex items-center z-0'>
        <div className='fixed top-0 left-0 w-screen z-0'>
          <div className='flex flex-row justify-between items-center bg-white p-5'>
            <button type="button" aria-label="Open navigation menu" onClick={toggleDrawer} >
              <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H14M4 18H9" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <Link href="/" className='lg:mr-10'>
              <Image alt={"logo"} src={logo} height={logoSize + 5} width={logoSize + 5} />
            </Link>
          </div>
          <div className='h-5 bg-gradient-to-b from-white to-transparent'></div>
        </div>

        <div
          className={`${drawerOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 transform transition-transform fixed top-0 left-0 bottom-0 z-20 w-screen`}
        >
          <div className='flex flex-row fixed top-0 left-0 bottom-0 w-screen'>
            <div className='p-5 w-full bg-white flex flex-col gap-10'>
              <Link href="/" className='lg:mr-10'>
                <Image alt={"logo"} src={logo} height={logoSize * 2} width={logoSize * 2} />
              </Link>
              <Link href='/projects'>
                <div className={navLinkClass('/projects')}>
                  <div className={navTextClass}>Projects</div>
                </div>
              </Link>
              <Link href='/photography'>
                <div className={navLinkClass('/photography')}>
                  <div className={navTextClass}>Photography</div>
                </div>
              </Link>
              <Link href='/music'>
                <div className={navLinkClass('/music')}>
                  <div className={navTextClass}>Music</div>
                </div>
              </Link>
              <Link href='/gis'>
                <div className={navLinkClass('/gis')}>
                  <div className={navTextClass}>GIS</div>
                </div>
              </Link>
            </div>
            <button
              type="button"
              aria-label="Close navigation menu"
              className='w-52 bg-black opacity-20'
              onClick={toggleDrawer}
            />
          </div>
        </div>
      </div>
    )
}

export default HorizontalDrawer;
