import { GetServerSideProps, NextPage } from 'next';
import { ocra } from '../font';
import { Title } from '../title';
import ResponsiveDrawer from '../drawer';

type Props = {

}

const Work: NextPage<Props> = () => {
  return (
    <div className={`grid grid-cols-5 global-font ${ocra.variable} font-sans`}>
      <Title />
      <ResponsiveDrawer />
      <div className='flex col-span-3 md:col-span-4 p-5 flex-col'>
        <div className='font-extrabold text-4xl fixed top-5 right-5 opacity-25 -z-50'>WORK</div>
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

export default Work