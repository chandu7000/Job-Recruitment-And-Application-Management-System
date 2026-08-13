import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ApplicationStatusBadge from '../features/applications/components/ApplicationStatusBadge'
import ApplicationTimeline from '../features/applications/components/ApplicationTimeline'
import InterviewSummary from '../features/applications/components/InterviewSummary'

function renderWithRouter(ui) { return render(<MemoryRouter>{ui}</MemoryRouter>) }

describe('application tracking presentation', () => {
  it.each([
    ['APPLIED', 'Applied'],
    ['UNDER_REVIEW', 'Under Review'],
    ['SHORTLISTED', 'Shortlisted'],
    ['INTERVIEW_SCHEDULED', 'Interview Scheduled'],
    ['INTERVIEW_COMPLETED', 'Interview Completed'],
    ['OFFERED', 'Offered'],
    ['HIRED', 'Hired'],
    ['REJECTED', 'Rejected'],
    ['WITHDRAWN', 'Withdrawn'],
  ])('renders readable application status %s', (status, label) => {
    renderWithRouter(<ApplicationStatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('renders status history without recruiter-private information', () => {
    renderWithRouter(<ApplicationTimeline history={[{ id: 'h1', newStatus: 'APPLIED', reason: 'Application submitted.', createdAt: '2026-08-10T10:00:00.000Z' }]} />)
    expect(screen.getByText('Applied')).toBeInTheDocument()
    expect(screen.getByText('Application submitted.')).toBeInTheDocument()
  })

  it('handles no interview and candidate interview summary states', () => {
    const { rerender } = renderWithRouter(<InterviewSummary interview={null} />)
    expect(screen.getByText(/No interview has been scheduled/i)).toBeInTheDocument()
    rerender(<MemoryRouter><InterviewSummary interview={{ status: 'SCHEDULED', scheduledStartAt: '2026-08-12T10:00:00.000Z', scheduledEndAt: '2026-08-12T11:00:00.000Z', timezone: 'Asia/Kolkata', meetingType: 'ONLINE' }} /></MemoryRouter>)
    expect(screen.getByText('Scheduled')).toBeInTheDocument()
    expect(screen.getByText('Online')).toBeInTheDocument()
  })
})
