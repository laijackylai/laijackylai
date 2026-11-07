import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import logo from '../assets/logo/logo_black.svg';
import { useState } from 'react';
import NavLinkBlob from './navLinkBlob';

type Props = {
  logoSize?: number
  width?: number
  fixedMobile?: boolean
}

const HorizontalDrawer: React.FC<Props> = ({ logoSize = 25, width = 40, fixedMobile = true }) => {

  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navLinkClass = (href: string) => (
    `cover-underline ${router.pathname === href ? 'text-sapphire-500' : ''}`
  );

  const navTextClass = 'font-mono text-body-sm uppercase tracking-nav';
  const mobileHeaderPosition = fixedMobile ? 'fixed top-0 left-0' : 'relative';

  // Both layouts render and CSS picks one at the md breakpoint, so SSR markup matches the client.
  return (
    <>
      <div
        data-testid="desktop-nav"
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] hidden md:flex w-screen px-5 py-10 lg:px-16"
      >
        <div
          className="flex flex-row justify-between items-center gap-5 overflow-auto"
          style={{ width: `${width}rem` }}
        >
          <Link href="/" className='lg:mr-10'>
            <Image alt={"logo"} src={logo} height={logoSize * 2} width={logoSize * 2} />
          </Link>
          <NavLinkBlob href="/projects" label="Projects" />
          <NavLinkBlob href="/photography" label="Photography" />
          <NavLinkBlob href="/music" label="Music" />
          <NavLinkBlob href="/gis" label="GIS" />
        </div>
      </div>
      <div data-testid="mobile-nav" className='flex md:hidden items-center z-0'>
        <div className={`${mobileHeaderPosition} w-screen z-0`}>
          <div className='flex flex-row justify-between items-center bg-white p-5'>
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              onClick={toggleDrawer}
            >
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

        {/* `invisible` keeps the closed drawer's links out of the tab order and the a11y tree. */}
        <div
          id="mobile-drawer"
          data-testid="mobile-drawer"
          className={`${drawerOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
            } transform transition-[transform,visibility] fixed top-0 left-0 bottom-0 z-20 w-screen`}
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
    </>
  )
}

export default HorizontalDrawer;
