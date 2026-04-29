import { render, screen } from '@testing-library/react';
import MyApp from '../pages/_app';
import { Amplify } from 'aws-amplify';
import { clarity } from 'react-microsoft-clarity';

jest.mock('../src/aws-exports', () => ({}));
jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
}));
jest.mock('react-microsoft-clarity', () => ({
  clarity: {
    init: jest.fn(),
  },
}));

const Page = ({ label }: { label: string }) => <div>{label}</div>;

describe('MyApp', () => {
  beforeEach(() => {
    (clarity.init as jest.Mock).mockClear();
  });

  it('configures Amplify at module load, initializes clarity once, and forwards pageProps', () => {
    const { rerender } = render(<MyApp Component={Page as any} pageProps={{ label: 'first page' }} router={{} as any} />);

    expect(Amplify.configure).toHaveBeenCalledWith({});
    expect(clarity.init).toHaveBeenCalledWith('hkl116cujk');
    expect(clarity.init).toHaveBeenCalledTimes(1);
    expect(screen.getByText('first page')).toBeInTheDocument();

    rerender(<MyApp Component={Page as any} pageProps={{ label: 'second page' }} router={{} as any} />);

    expect(clarity.init).toHaveBeenCalledTimes(1);
    expect(screen.getByText('second page')).toBeInTheDocument();
  });
});
