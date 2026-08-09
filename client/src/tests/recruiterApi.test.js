import { afterEach, describe, expect, it } from 'vitest'
import axiosClient from '../api/axiosClient'
import { API_ENDPOINTS } from '../api/endpoints'
import { recruiterApi } from '../features/recruiter/services/recruiterApi'

const originalAdapter = axiosClient.defaults.adapter
const response = (config, data) => ({ data: { success: true, data }, status: 200, statusText: 'OK', headers: {}, config })

describe('Recruiter Phase 6 API service', () => {
  afterEach(() => { axiosClient.defaults.adapter = originalAdapter })
  it('uses only verified backend endpoints without repeating the api prefix', () => {
    expect(API_ENDPOINTS.RECRUITER.DASHBOARD).toBe('/dashboard/recruiter')
    expect(API_ENDPOINTS.RECRUITER.PROFILE).toBe('/recruiter/profile')
    expect(API_ENDPOINTS.RECRUITER.MY_COMPANIES).toBe('/companies/me')
  })
  it('normalizes the owned-company array response', async () => {
    axiosClient.defaults.adapter = async (config) => response(config, [{ id: 'company-1' }])
    await expect(recruiterApi.companies()).resolves.toEqual([{ id: 'company-1' }])
  })
  it('uses the exact company logo multipart field', async () => {
    let request
    axiosClient.defaults.adapter = async (config) => { request = config; return response(config, {}) }
    await recruiterApi.uploadLogo(new File(['logo'], 'logo.png', { type: 'image/png' }))
    expect(request.url).toBe('/companies/me/logo')
    expect(request.data.get('companyLogo').name).toBe('logo.png')
  })
  it('connects verification submission, resubmission and history endpoints', async () => {
    const requests = []
    axiosClient.defaults.adapter = async (config) => { requests.push([config.method, config.url]); return response(config, []) }
    await recruiterApi.submitVerification()
    await recruiterApi.resubmitVerification()
    await recruiterApi.verificationHistory()
    expect(requests).toEqual([
      ['post', '/companies/me/submit-verification'],
      ['post', '/companies/me/resubmit-verification'],
      ['get', '/companies/me/verification-history'],
    ])
  })
})
