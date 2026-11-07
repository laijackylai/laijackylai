import { fireEvent, render, screen, within } from '@testing-library/react'
import mockRouter from 'next-router-mock'
import MyApp from '../pages/_app'

jest.mock('next/router', () => require('next-router-mock'))
jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ children, id }: { children: string; id: string }) => <script id={id}>{children}</script>,
}))

const Page = ({ label }: { label: string }) => <div>{label}</div>

describe('MyApp', () => {
  beforeEach(() => mockRouter.setCurrentUrl('/projects'))

  it('renders clarity script and forwards pageProps', () => {
    const { rerender } = render(<MyApp Component={Page as any} pageProps={{ label: 'first page' }} router={{} as any} />)

    expect(document.querySelector('#ms-clarity')?.textContent).toContain('hkl116cujk')
    expect(screen.getByText('first page')).toBeInTheDocument()

    rerender(<MyApp Component={Page as any} pageProps={{ label: 'second page' }} router={{} as any} />)
    expect(screen.getByText('second page')).toBeInTheDocument()
  })

  it('renders the nav with the current page marked, contact and footer', () => {
    render(<MyApp Component={Page as any} pageProps={{ label: 'x' }} router={{} as any} />)
    const nav = within(screen.getByRole('navigation', { name: 'Primary' }))

    for (const [name, href] of [['Home', '/'], ['Projects', '/projects'], ['Photography', '/photography'], ['Music', '/music'], ['GIS', '/gis']]) {
      expect(nav.getByRole('link', { name: new RegExp(name) })).toHaveAttribute('href', href)
    }
    expect(nav.getByRole('link', { name: /projects/i })).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByRole('link', { name: /contact/i })[0]).toHaveAttribute('href', 'mailto:laijackylai@gmail.com')
    expect(document.documentElement).toHaveClass('snap-page')
  })

  it('switches theme and opens the mobile menu', () => {
    document.documentElement.dataset.theme = 'light'
    render(<MyApp Component={Page as any} pageProps={{ label: 'x' }} router={{} as any} />)

    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    expect(screen.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true')
  })
})
