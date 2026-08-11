import { afterEach, describe, expect, it } from 'vitest'
import axiosClient from '../api/axiosClient'
import { API_ENDPOINTS } from '../api/endpoints'
import { recruiterApplicationApi } from '../features/applications/services/recruiterApplicationApi'

const originalAdapter = axiosClient.defaults.adapter
const response = (config, data, meta = {}) => ({
  data: { success: true, data, meta },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})

describe('recruiter applicant API', () => {
  afterEach(() => { axiosClient.defaults.adapter = originalAdapter })

  it('builds encoded recruiter application endpoints', () => {
    expect(API_ENDPOINTS.RECRUITER.APPLICATION_BY_ID('app/id')).toBe('/recruiter/applications/app%2Fid')
    expect(API_ENDPOINTS.RECRUITER.APPLICATION_NOTES('app/id')).toBe('/recruiter/applications/app%2Fid/notes')
    expect(API_ENDPOINTS.RECRUITER.APPLICATION_STATUS('app/id')).toBe('/recruiter/applications/app%2Fid/status')
  })

  it('lists only the requested job through the backend jobId filter', async () => {
    axiosClient.defaults.adapter = async (config) => {
      expect(config.params.jobId).toBe('job-1')
      return response(config, { applications: [{ id: 'a1', jobId: 'job-1', status: 'APPLIED' }] }, { page: 1, totalPages: 1 })
    }

    await expect(recruiterApplicationApi.listByJob('job-1', { page: 1 })).resolves.toEqual({
      applications: [expect.objectContaining({ id: 'a1', jobId: 'job-1' })],
      pagination: { page: 1, totalPages: 1 },
    })
  })

  it('loads details and preserves recruiter-only candidate data', async () => {
    axiosClient.defaults.adapter = async (config) => response(config, {
      application: {
        id: 'a1',
        recruiterNotes: 'Private note',
        candidateSnapshot: { email: 'candidate@example.com' },
        candidateProfile: { skills: [{ skillName: 'Java' }] },
      },
    })

    await expect(recruiterApplicationApi.details('a1')).resolves.toMatchObject({
      recruiterNotes: 'Private note',
      candidateSnapshot: { email: 'candidate@example.com' },
      candidateProfile: { skills: [{ skillName: 'Java' }] },
    })
  })

  it('saves notes and sends backend-authoritative status changes', async () => {
    axiosClient.defaults.adapter = async (config) => {
      const requestData =
        typeof config.data === 'string'
          ? JSON.parse(config.data)
          : config.data

      return response(config, {
        application: {
          id: 'a1',
          recruiterNotes:
            config.method === 'put' ? requestData.notes : null,
          status:
            config.method === 'patch' ? requestData.status : 'APPLIED',
        },
      })
    }

    await expect(recruiterApplicationApi.saveNotes('a1', 'Review Java experience')).resolves.toMatchObject({ recruiterNotes: 'Review Java experience' })
    await expect(recruiterApplicationApi.updateStatus('a1', 'UNDER_REVIEW', 'Initial screening')).resolves.toMatchObject({ status: 'UNDER_REVIEW' })
  })
})
