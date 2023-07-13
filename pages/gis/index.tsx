import { GetServerSideProps, NextPage } from 'next';
import ocra from '../../components/font';
import Title from '../../components/title';
import ResponsiveDrawer from '../../components/drawer';
import HorizontalDrawer from '../../components/horizontalDrawer';
import Image from 'next/image';

type Props = {

}

const GIS: NextPage<Props> = () => {
  return (
    <div className={`grid grid-cols-5 global-font ${ocra.variable} font-sans`}>
      <Title />
      <div className='font-extrabold text-4xl fixed top-5 right-5 opacity-25 -z-50'>GIS</div>
      <div className='flex col-span-3 md:col-span-4 flex-col w-screen snap-y snap-mandatory overflow-scroll'>
        <div className='h-screen w-screen p-5 lg:px-12 lg:py-8 flex flex-col justify-around snap-start'>
          <HorizontalDrawer logoSize={50} width={40} />
          <div />
          <Image className='bg-white rounded-md self-center ' src="/gis/Toronto_Shooting_Rates_2022.png" alt="torontoShootingRates2022" width={800} height={100} />
        </div>
        <div className='h-screen w-screen p-5 lg:px-12 lg:py-8 flex items-center justify-center snap-start'>
          <Image className='bg-white border border-black' src="/gis/Cycle_Routes.png" alt="CycleRoutes" width={500} height={100} />
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {

    }
  }
}

export default GIS