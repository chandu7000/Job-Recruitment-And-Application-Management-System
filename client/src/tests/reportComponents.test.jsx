import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../features/auth/context/AuthContextDefinition'
import ReportAction from '../features/reporting/components/ReportAction'
import { reportApi } from '../features/reporting/services/reportApi'
import { toast } from 'sonner'

vi.mock('sonner', () => ({ toast: { success: vi.fn() } }))

vi.mock('../features/reporting/services/reportApi', () => ({
  reportApi: { submit: vi.fn() },
}))

function renderAction({ role = 'JOB_SEEKER', targetType = 'JOB' } = {}) {
  return render(
    <AuthContext.Provider value={{ isAuthenticated: true, role }}>
      <ReportAction
        targetType={targetType}
        targetResourceId={targetType === 'JOB' ? 'job-1' : 'company-1'}
        targetLabel={targetType === 'JOB' ? 'Backend Engineer' : 'Acme Labs'}
      />
    </AuthContext.Provider>,
  )
}

describe('reporting components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows eligible report actions and hides them for guests or unsupported roles', () => {
    const eligible = renderAction()

    expect(
      screen.getByRole('button', { name: 'Report job' }),
    ).toBeInTheDocument()

    eligible.unmount()

    const guest = render(
      <AuthContext.Provider value={{ isAuthenticated: false, role: null }}>
        <ReportAction targetType="JOB" targetResourceId="job-1" />
      </AuthContext.Provider>,
    )

    expect(
      screen.queryByRole('button', { name: 'Report job' }),
    ).not.toBeInTheDocument()

    guest.unmount()

    renderAction({ role: 'ADMIN' })

    expect(
      screen.queryByRole('button', { name: 'Report job' }),
    ).not.toBeInTheDocument()
  })

  it('opens, validates, cancels, and submits the correct job report', async () => {
    const user = userEvent.setup()

    reportApi.submit.mockResolvedValue({ id: 'report-1' })

    renderAction()

    await user.click(screen.getByRole('button', { name: 'Report job' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: 'Report this job' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Submit report' }))

    expect(
      screen.getByText('Select a reason for this report.'),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/describe why/i),
    ).toBeInTheDocument()

    expect(reportApi.submit).not.toHaveBeenCalled()

    await user.selectOptions(
      screen.getByLabelText('Category'),
      'FRAUD_OR_SCAM',
    )

    await user.type(
      screen.getByLabelText('Description'),
      'This job posting appears fraudulent.',
    )

    await user.click(screen.getByRole('button', { name: 'Submit report' }))

    await waitFor(() => {
      expect(reportApi.submit).toHaveBeenCalledTimes(1)
    })

    expect(reportApi.submit).toHaveBeenCalledWith({
      targetType: 'JOB',
      targetResourceId: 'job-1',
      category: 'FRAUD_OR_SCAM',
      description: 'This job posting appears fraudulent.',
    })

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    expect(toast.success).toHaveBeenCalledWith(
      'Report submitted successfully.',
    )
  })

  it('prevents rapid duplicate submission while the request is pending', async () => {
    let resolveRequest

    reportApi.submit.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        }),
    )

    renderAction()

    fireEvent.click(screen.getByRole('button', { name: 'Report job' }))

    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'OTHER' },
    })

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'This report has enough detail.' },
    })

    const submit = screen.getByRole('button', { name: 'Submit report' })

    fireEvent.click(submit)
    fireEvent.click(submit)
    fireEvent.click(submit)

    expect(reportApi.submit).toHaveBeenCalledTimes(1)
    expect(submit).toBeDisabled()

    resolveRequest({ id: 'report-1' })

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('preserves values on recoverable failure and handles backend 429 feedback', async () => {
    const user = userEvent.setup()

    const error = {
      apiError: {
        status: 429,
        code: 'REPORT_RATE_LIMIT_EXCEEDED',
        message: 'Rate limited',
      },
    }

    reportApi.submit.mockRejectedValue(error)

    renderAction({
      targetType: 'COMPANY',
      role: 'RECRUITER',
    })

    await user.click(
      screen.getByRole('button', { name: 'Report company' }),
    )

    await user.selectOptions(
      screen.getByLabelText('Category'),
      'MISLEADING_INFORMATION',
    )

    await user.type(
      screen.getByLabelText('Description'),
      'The public company information is misleading.',
    )

    await user.click(screen.getByRole('button', { name: 'Submit report' }))

    expect(
      await screen.findByText(
        'Too many reports submitted. Please try again later.',
      ),
    ).toBeInTheDocument()

    expect(screen.getByLabelText('Category')).toHaveValue(
      'MISLEADING_INFORMATION',
    )

    expect(screen.getByLabelText('Description')).toHaveValue(
      'The public company information is misleading.',
    )
  })

  it('resets the form when cancelled and reopened', async () => {
    const user = userEvent.setup()

    renderAction()

    await user.click(screen.getByRole('button', { name: 'Report job' }))

    await user.selectOptions(
      screen.getByLabelText('Category'),
      'OTHER',
    )

    await user.type(
      screen.getByLabelText('Description'),
      'This is a valid description.',
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await user.click(screen.getByRole('button', { name: 'Report job' }))

    expect(screen.getByLabelText('Category')).toHaveValue('')
    expect(screen.getByLabelText('Description')).toHaveValue('')
  })
})