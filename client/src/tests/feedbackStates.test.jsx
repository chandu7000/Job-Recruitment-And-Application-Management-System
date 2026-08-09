import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import EmptyState from '../components/feedback/EmptyState'
import ErrorState from '../components/feedback/ErrorState'
import PageLoader from '../components/feedback/PageLoader'

describe('feedback states', () => {
    it('renders a page loading state', () => {
        render(<PageLoader message="Loading applications" />)

        expect(
            screen.getByText('Loading applications', { selector: 'p' }),
        ).toBeInTheDocument()

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders an empty state', () => {
        render(
            <EmptyState
                title="No applications"
                description="Your applications will appear here."
            />,
        )

        expect(
            screen.getByRole('heading', { name: 'No applications' }),
        ).toBeInTheDocument()
    })

    it('allows retrying from an error state', async () => {
        const user = userEvent.setup()
        const handleRetry = vi.fn()

        render(
            <ErrorState
                message="Applications could not be loaded."
                onRetry={handleRetry}
            />,
        )

        await user.click(screen.getByRole('button', { name: 'Try again' }))

        expect(handleRetry).toHaveBeenCalledOnce()
    })
})