import { render } from '@testing-library/react'
import App from '../pages'

jest.mock('next/router', () => require('next-router-mock'));

describe('App', () => {
  it('renders the title and drawer components', () => {
    // Render the component
    const { getByTestId } = render(<App />)

    // Assert that the drawer component is rendered
    expect(getByTestId('drawer-component')).toBeInTheDocument()
  })
})
