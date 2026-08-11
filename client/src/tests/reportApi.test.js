import { beforeEach, describe, expect, it, vi } from 'vitest'
import axiosClient from '../api/axiosClient'
import { API_ENDPOINTS } from '../api/endpoints'
import { reportApi } from '../features/reporting/services/reportApi'

vi.mock('../api/axiosClient', () => ({
  default: { post: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

describe('report api', () => {
  it('submits the exact backend-compatible report payload', async () => {
    const payload = {
      targetType: 'JOB',
      targetResourceId: 'job-1',
      category: 'FRAUD_OR_SCAM',
      description: 'This job posting appears fraudulent.',
    }
    axiosClient.post.mockResolvedValue({ data: { data: { id: 'report-1', ...payload } } })

    await expect(reportApi.submit(payload)).resolves.toEqual({ id: 'report-1', ...payload })
    expect(API_ENDPOINTS.REPORTS.SUBMIT).toBe('/reports')
    expect(axiosClient.post).toHaveBeenCalledWith('/reports', payload)
  })
})
