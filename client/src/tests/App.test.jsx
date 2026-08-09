import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

describe('CareerForge application', () => {
    beforeEach(() => {
        window.history.pushState({}, '', '/')
    })

    it('renders the application home page', async () => {
        render(<App />)

        expect(
            await screen.findByRole('heading', {
                name: /build a career that moves you forward/i,
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('link', { name: 'CareerForge' }),
        ).toBeInTheDocument()
    })
})
