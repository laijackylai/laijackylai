import { NextPage } from 'next';
import Title from '../../components/title';
import HorizontalDrawer from '../../components/horizontalDrawer';

type Props = {

}

const Music: NextPage<Props> = () => {
  return (
    <div>
      <Title />
      <HorizontalDrawer />
      <div className='noise-bg flex flex-col p-6 pt-32 lg:py-24 lg:px-16'>
        <div className='flex pt-32'>
          <h1 className='font-display text-heading-1 uppercase tracking-display'>Music</h1>
        </div>
      </div>
    </div>
  );
}

export default Music
