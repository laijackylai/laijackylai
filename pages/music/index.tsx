import { GetServerSideProps, NextPage } from 'next';
import Title from '../../components/title';
import HorizontalDrawer from '../../components/horizontalDrawer';

type Props = {

}

const Music: NextPage<Props> = () => {
  return (
    <div>
      <Title />
      <HorizontalDrawer />
      <div className='flex flex-col p-6 pt-32 lg:py-24 lg:px-16'>
        {/* <div className='font-extrabold text-4xl fixed top-5 right-5 opacity-25 -z-50'>MUSIC</div> */}
        <div className='flex pt-32'>
          <div className='font-display text-heading-1 uppercase tracking-display'>Music</div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {

    }
  }
}

export default Music
