import { afterEach, describe, expect, it } from 'vitest'
import axiosClient from '../api/axiosClient'
import { API_ENDPOINTS } from '../api/endpoints'
import { jobSeekerApi } from '../features/jobSeeker/services/jobSeekerApi'

const originalAdapter = axiosClient.defaults.adapter
const response = (config, data) => ({ data: { success: true, data }, status: 200, statusText: 'OK', headers: {}, config })

describe('Job seeker API service', () => {
  afterEach(() => { axiosClient.defaults.adapter = originalAdapter })
  it('uses the approved job seeker endpoint paths', () => {
    expect(API_ENDPOINTS.JOB_SEEKER.DASHBOARD).toBe('/dashboard/job-seeker')
    expect(API_ENDPOINTS.JOB_SEEKER.PROFILE_IMAGE).toBe('/job-seeker/uploads/profile-image')
    expect(API_ENDPOINTS.JOB_SEEKER.RESUME).toBe('/job-seeker/uploads/resume')
  })
  it('maps both direct and named collection response shapes', async () => {
    axiosClient.defaults.adapter = async (config) => response(config, config.url.endsWith('/skills') ? [{ id: '1' }] : { certifications: [{ id: '2' }], total: 1 })
    await expect(jobSeekerApi.list(API_ENDPOINTS.JOB_SEEKER.SKILLS, 'skills')).resolves.toEqual([{ id: '1' }])
    await expect(jobSeekerApi.list(API_ENDPOINTS.JOB_SEEKER.CERTIFICATIONS, 'certifications')).resolves.toEqual([{ id: '2' }])
  })
  it('sends CRUD methods and safely encodes resource ids', async () => {
    const requests = []
    axiosClient.defaults.adapter = async (config) => { requests.push(config); return response(config, {}) }
    await jobSeekerApi.create('/job-seeker/skills', { skillName: 'Java' })
    await jobSeekerApi.update('/job-seeker/projects', 'id/1', { title: 'Project' }, 'patch')
    await jobSeekerApi.remove('/job-seeker/skills', 'id/1')
    expect(requests.map(({ method, url }) => [method, url])).toEqual([['post', '/job-seeker/skills'], ['patch', '/job-seeker/projects/id%2F1'], ['delete', '/job-seeker/skills/id%2F1']])
  })
})
