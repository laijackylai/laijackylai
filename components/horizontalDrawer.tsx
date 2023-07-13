import Image from 'next/image';
import logo from '../assets/logo/logo_black.svg';

type Props = {
  logoSize: number
  width: number
}

const HorizontalDrawer: React.FC<Props> = ({ logoSize = 25, width = 28 }) => {
  return (
    <div className={`flex flex-row justify-between items-center self-start gap-5 w-fit lg:w-[${width}rem] overflow-auto`}>
      <a href="/" className='mr-10'>
        <Image alt={"logo"} src={logo} height={logoSize} width={logoSize} />
      </a>
      <a href='/tech'>
        <div className='cover-underline'>
          <div className='global-font'>Tech</div>
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
}

export default HorizontalDrawer;