import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App'

function renderRoute(path) {
  window.history.pushState({}, '', path)
  return render(<App />)
}

describe('application routing', () => {
  it('redirects guest access from the job seeker dashboard to login', async () => {
    renderRoute('/job-seeker/dashboard')

    expect(
      await screen.findByRole(
        'heading',
        { name: 'Welcome back' },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument()
  })

  it('renders the unauthorized page', () => {
    renderRoute('/unauthorized')

    expect(
      screen.getByRole('heading', { name: 'You are not authorized' }),
    ).toBeInTheDocument()
  })

  it('renders the not found page for an unknown route', () => {
    renderRoute('/this-route-does-not-exist')

    expect(
      screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
  })
})
