import { act, fireEvent, render, screen } from '@testing-library/react'
import Home, { getStaticProps } from '../pages'

describe('Home page', () => {
  it('renders the hero, current role and every job', () => {
    render(<Home photoPool={[]} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Full Stack EngineerData & AI')
    expect(screen.getByText(/currently at eBay/)).toBeInTheDocument()
    for (const at of ['eBay', 'Giesecke+Devrient', 'Votanic Limited', 'Vivablee Limited', 'Hong Kong Observatory', 'Centaline Property']) {
      expect(screen.getByText(`@ ${at}`)).toBeInTheDocument()
    }
    expect(screen.getByText('Current')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute('href', 'https://linkedin.com/in/laijackylai')
    expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute('href', 'https://github.com/laijackylai')
    expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute('href', 'https://www.instagram.com/laijackylai/')
  })

  it('flashes the old eBay logo on hover', () => {
    jest.useFakeTimers()
    jest.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList)
    render(<Home photoPool={[]} />)
    const ebay = screen.getByAltText('eBay').closest('a') as HTMLElement

    fireEvent.pointerEnter(ebay)
    expect(screen.getByAltText('eBay')).toHaveStyle({ visibility: 'hidden' })
    act(() => { jest.advanceTimersByTime(200) })
    expect(screen.getByAltText('eBay')).not.toHaveStyle({ visibility: 'hidden' })
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('gives each page tile its own hover picture pool', () => {
    jest.useFakeTimers()
    render(<Home photoPool={['https://example.com/a.jpg', 'https://example.com/b.jpg']} />)
    const tile = (name: string) => screen.getByRole('link', { name: new RegExp(`^\\d+ JL-\\d+ ${name}`, 'i') })
    const preview = (name: string) => tile(name).querySelector('img.preview')

    expect(preview('Music')).toBeNull()
    expect(preview('GIS')?.getAttribute('src')).toContain('gis')
    const before = preview('Photography')?.getAttribute('src')
    expect(before).toContain('example.com')
    fireEvent.pointerLeave(tile('Photography'))
    act(() => { jest.advanceTimersByTime(400) })
    expect(preview('Photography')?.getAttribute('src')).not.toBe(before)
    jest.useRealTimers()
  })

  it('builds without the photo API', async () => {
    delete process.env.APPSYNC_URL
    await expect(getStaticProps({} as any)).resolves.toEqual({ props: { photoPool: [] }, revalidate: 3600 })
  })
})
