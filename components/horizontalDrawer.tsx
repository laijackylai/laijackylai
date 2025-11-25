import Image from 'next/image';
import logo from '../assets/logo/logo_black.svg';
import { useEffect, useState } from 'react';

type Props = {
  logoSize: number
  width: number
}

const HorizontalDrawer: React.FC<Props> = ({ logoSize = 25, width = 28 }) => {

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

  return isDesktop ?
    (
      <div className={`flex flex-row justify-between items-center self-start gap-5 w-fit lg:w-[${width}rem] overflow-auto py-10`}>
        <a href="/" className='lg:mr-10'>
          <Image alt={"logo"} src={logo} height={50} width={50} />
        </a>
        <a href='/projects'>
          <div className='cover-underline'>
            <div className='global-font'>Projects</div>
          </div>
        </a>
        <a href='/photography'>
          <div className='cover-underline'>
            <div className='global-font'>Photography</div>
          </div>
        </a>
        <a href='/music'>
          <div className='cover-underline'>
            <div className='global-font'>Music</div>
          </div>
        </a>
        <a href='/gis'>
          <div className='cover-underline'>
            <div className='global-font'>GIS</div>
          </div>
        </a>
      </div>
    )
    :
    (
      <div className='flex items-center z-0'>
        <div className='fixed top-0 left-0 w-screen z-0'>
          <div className='flex flex-row justify-between items-center bg-white p-5'>
            <button onClick={toggleDrawer} >
              <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H14M4 18H9" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <a href="/" className='lg:mr-10'>
              <Image alt={"logo"} src={logo} height={30} width={30} />
            </a>
          </div>
          <div className='h-5 bg-gradient-to-b from-white to-transparent'></div>
        </div>

        <div
          className={`${drawerOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 transform transition-transform fixed top-0 left-0 bottom-0 z-20 w-screen`}
        >
          <div className='flex flex-row fixed top-0 left-0 bottom-0 w-screen'>
            <div className='p-5 w-full bg-white flex flex-col gap-10'>
              <a href="/" className='lg:mr-10'>
                <Image alt={"logo"} src={logo} height={50} width={50} />
              </a>
              <a href='/projects'>
                <div className='cover-underline'>
                  <div className='global-font'>Projects</div>
                </div>
              </a>
              <a href='/photography'>
                <div className='cover-underline'>
                  <div className='global-font'>Photography</div>
                </div>
              </a>
              <a href='/music'>
                <div className='cover-underline'>
                  <div className='global-font'>Music</div>
                </div>
              </a>
              <a href='/gis'>
                <div className='cover-underline'>
                  <div className='global-font'>GIS</div>
                </div>
              </a>
            </div>
            <div className='w-52 bg-gray-400 opacity-30' onClick={toggleDrawer} />
          </div>
        </div>
      </div>
    )
}

export default HorizontalDrawer;