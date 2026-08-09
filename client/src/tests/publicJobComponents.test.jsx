import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import JobCard from '../features/publicJobs/components/JobCard'
import Pagination from '../features/publicJobs/components/Pagination'

const job = {
  id: 'job-1', title: 'Java Developer', slug: 'java-developer', location: 'Hyderabad',
  workMode: 'HYBRID', employmentType: 'FULL_TIME', minimumExperience: 1,
  maximumExperience: 3, skills: ['Java', 'Spring Boot'], publishedAt: '2026-08-01T00:00:00.000Z',
  company: { companyName: 'Acme', slug: 'acme' },
}

describe('Public job components', () => {
  it('renders a complete accessible job card with navigation', () => {
    render(<MemoryRouter><JobCard job={job} /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Java Developer' })).toHaveAttribute('href', '/jobs/java-developer')
    expect(screen.getByRole('link', { name: 'Acme' })).toHaveAttribute('href', '/companies/acme')
    expect(screen.getByText('Spring Boot')).toBeInTheDocument()
  })

  it('changes pages and respects pagination boundaries', () => {
    const onPageChange = vi.fn()
    render(<Pagination pagination={{ page: 2, totalPages: 3, hasPreviousPage: true, hasNextPage: true }} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: /previous/i }))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3)
  })
})
