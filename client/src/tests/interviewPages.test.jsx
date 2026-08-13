import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ScheduleInterviewPage from '../features/interviews/pages/ScheduleInterviewPage'
import RescheduleInterviewPage from '../features/interviews/pages/RescheduleInterviewPage'
import { recruiterInterviewApi } from '../features/interviews/services/interviewApi'
import { recruiterApplicationApi } from '../features/applications/services/recruiterApplicationApi'
import { toast } from 'sonner'

vi.mock('../features/interviews/services/interviewApi', () => ({
  recruiterInterviewApi: { schedule: vi.fn(), details: vi.fn(), reschedule: vi.fn() },
  candidateInterviewApi: {},
}))
vi.mock('../features/applications/services/recruiterApplicationApi', () => ({
  recruiterApplicationApi: { details: vi.fn() },
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function renderSchedule() {
  return render(
    <MemoryRouter initialEntries={['/recruiter/applications/a1/schedule-interview']}>
      <Routes>
        <Route path="/recruiter/applications/:applicationId/schedule-interview" element={<ScheduleInterviewPage />} />
        <Route path="/recruiter/interviews/:interviewId" element={<h1>Interview details</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('interview pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    recruiterApplicationApi.details.mockResolvedValue(null)
  })

  it('renders scheduling form with all meeting types and required schedule fields', () => {
    renderSchedule()
    expect(screen.getByRole('heading', { name: /schedule interview/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /online/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /in person/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /phone/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Date')).toBeInTheDocument()
    expect(screen.getByLabelText('Start time')).toBeInTheDocument()
    expect(screen.getByLabelText('End time')).toBeInTheDocument()
    expect(screen.getByLabelText('Timezone')).toBeInTheDocument()
  })

  it('switches conditional meeting fields by meeting type', async () => {
    const user = userEvent.setup()
    renderSchedule()

    expect(screen.getByLabelText('Meeting link')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Meeting type'), 'IN_PERSON')
    expect(screen.getByLabelText('Physical location')).toBeInTheDocument()
    expect(screen.queryByLabelText('Meeting link')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Meeting type'), 'PHONE')
    expect(screen.getByLabelText('Phone instructions')).toBeInTheDocument()
  })

  it('validates schedule values before calling the backend', async () => {
    const user = userEvent.setup()
    renderSchedule()

    await user.click(screen.getByRole('button', { name: 'Schedule interview' }))

    expect(await screen.findByText('Select an interview date.')).toBeInTheDocument()
    expect(recruiterInterviewApi.schedule).not.toHaveBeenCalled()
  })

  it('submits a valid online interview payload and navigates after success', async () => {
    const user = userEvent.setup()
    recruiterInterviewApi.schedule.mockResolvedValue({ id: 'i1' })
    renderSchedule()

    await user.type(screen.getByLabelText('Date'), '2030-01-02')
    await user.type(screen.getByLabelText('Start time'), '10:00')
    await user.type(screen.getByLabelText('End time'), '11:00')
    await user.clear(screen.getByLabelText('Timezone'))
    await user.type(screen.getByLabelText('Timezone'), 'Asia/Kolkata')
    await user.type(screen.getByLabelText('Meeting link'), 'https://meet.example.com/interview')
    await user.type(screen.getByLabelText('Interview instructions'), 'Bring identification.')
    await user.click(screen.getByRole('button', { name: 'Schedule interview' }))

    await waitFor(() => expect(recruiterInterviewApi.schedule).toHaveBeenCalledWith(
      'a1',
      expect.objectContaining({
        timezone: 'Asia/Kolkata',
        meetingType: 'ONLINE',
        meetingLink: 'https://meet.example.com/interview',
        physicalLocation: null,
        phoneInstructions: null,
        interviewInstructions: 'Bring identification.',
      }),
    ))
    expect(toast.success).toHaveBeenCalledWith('Interview scheduled successfully.')
    expect(await screen.findByRole('heading', { name: 'Interview details' })).toBeInTheDocument()
  })

  it('loads and validates the reschedule form including the required reason', async () => {
    const user = userEvent.setup()
    recruiterInterviewApi.details.mockResolvedValue({
      id: 'i1',
      scheduledStartAt: '2030-01-02T04:30:00.000Z',
      scheduledEndAt: '2030-01-02T05:30:00.000Z',
      timezone: 'Asia/Kolkata',
      meetingType: 'ONLINE',
      meetingLink: 'https://meet.example.com/original',
    })

    render(
      <MemoryRouter initialEntries={['/recruiter/interviews/i1/reschedule']}>
        <Routes>
          <Route path="/recruiter/interviews/:interviewId/reschedule" element={<RescheduleInterviewPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Reschedule interview' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save new schedule' }))

    expect(await screen.findByText('Reason is required.')).toBeInTheDocument()
    expect(recruiterInterviewApi.reschedule).not.toHaveBeenCalled()
  })
})
