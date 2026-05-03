import { render, screen } from '@testing-library/react';
import MyApp from '../pages/_app';
import { Amplify } from 'aws-amplify';

jest.mock('../src/aws-exports', () => ({}));
jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
}));
jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ children, id }: { children: string; id: string }) => <script id={id}>{children}</script>,
}));

const Page = ({ label }: { label: string }) => <div>{label}</div>;

describe('MyApp', () => {
  it('configures Amplify at module load, renders clarity script, and forwards pageProps', () => {
    const { rerender } = render(<MyApp Component={Page as any} pageProps={{ label: 'first page' }} router={{} as any} />);

    expect(Amplify.configure).toHaveBeenCalledWith({});
    expect(document.querySelector('#ms-clarity')?.textContent).toContain('hkl116cujk');
    expect(screen.getByText('first page')).toBeInTheDocument();

    rerender(<MyApp Component={Page as any} pageProps={{ label: 'second page' }} router={{} as any} />);

    expect(screen.getByText('second page')).toBeInTheDocument();
  });
});
