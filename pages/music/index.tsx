import { GetServerSideProps, NextPage } from 'next';
import ocra from '../../components/font';
import Title from '../../components/title';
import HorizontalDrawer from '../../components/horizontalDrawer';
import { useEffect, useState } from 'react';

type Props = {

}

const Music: NextPage<Props> = () => {
  const [scroll, setScroll] = useState(0)
  const [windowWidth, setWindowWidth] = useState(28)

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      setScroll(scrollTop)
    }

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
      setWindowWidth(window.innerWidth)

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  return (
    <div className={`global-font ${ocra.variable} font-sans`}>
      <Title />
      <HorizontalDrawer logoSize={25} width={windowWidth} />
      <div className='flex p-5 pt-24 lg:p-14'>
        {/* <div className='font-extrabold text-4xl fixed top-5 right-5 opacity-25 -z-50'>MUSIC</div> */}
        <div>Music Page</div>
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

export default Music