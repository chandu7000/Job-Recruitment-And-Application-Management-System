import { afterEach, describe, expect, it } from 'vitest'
import axiosClient from '../api/axiosClient'
import { API_ENDPOINTS } from '../api/endpoints'
import { adminApi, buildAuditParams, buildJobParams, buildReportParams } from '../features/admin/services/adminApi'

const originalAdapter = axiosClient.defaults.adapter
const response = (config, data) => ({ data: { success: true, data }, status: 200, statusText: 'OK', headers: {}, config })

describe('Admin moderation API', () => {
  afterEach(() => { axiosClient.defaults.adapter = originalAdapter })

  it('uses only verified admin moderation backend endpoints', () => {
    expect(API_ENDPOINTS.ADMIN.PENDING_COMPANIES).toBe('/admin/companies/pending')
    expect(API_ENDPOINTS.ADMIN.VERIFY_COMPANY('c 1')).toBe('/admin/companies/c%201/verify')
    expect(API_ENDPOINTS.ADMIN.REJECT_COMPANY('c1')).toBe('/admin/companies/c1/reject')
    expect(API_ENDPOINTS.ADMIN.JOB_BY_ID('j1')).toBe('/admin/jobs/j1')
    expect(API_ENDPOINTS.ADMIN.MODERATE_JOB('j1')).toBe('/admin/jobs/j1/moderate')
    expect(API_ENDPOINTS.ADMIN.REPORT_BY_ID('r1')).toBe('/admin/reports/r1')
    expect(API_ENDPOINTS.ADMIN.PROCESS_REPORT('r1')).toBe('/admin/reports/r1/process')
    expect(API_ENDPOINTS.ADMIN.AUDIT_LOG_BY_ID('a1')).toBe('/admin/audit-logs/a1')
  })

  it('serializes supported job, report and audit filters', () => {
    expect(buildJobParams({ page: 2, status: 'REMOVED', location: 'Hyderabad', search: 'Java' }).toString()).toContain('status=REMOVED')
    expect(buildReportParams({ targetType: 'JOB', status: 'OPEN', category: 'OTHER' }).toString()).toContain('targetType=JOB')
    const audit = buildAuditParams({ action: 'JOB_REMOVED', resourceType: 'JOB', actorRole: 'ADMIN', from: '2026-08-01' })
    expect(audit.get('action')).toBe('JOB_REMOVED')
    expect(audit.get('resourceType')).toBe('JOB')
    expect(audit.get('actorRole')).toBe('ADMIN')
    expect(audit.get('from')).toBe('2026-08-01')
  })

  it('sends verified moderation payloads', async () => {
    const requests = []
    axiosClient.defaults.adapter = async (config) => { requests.push([config.method, config.url, config.data]); return response(config, { id: 'x' }) }
    await adminApi.verifyCompany('c1')
    await adminApi.rejectCompany('c1', 'Invalid company details')
    await adminApi.removeJob('j1', 'Policy violation')
    await adminApi.restoreJob('j1')
    await adminApi.processReport('r1', { status: 'UNDER_REVIEW' })
    expect(requests.map(([m,u]) => [m,u])).toEqual([
      ['patch','/admin/companies/c1/verify'], ['patch','/admin/companies/c1/reject'], ['patch','/admin/jobs/j1/moderate'], ['patch','/admin/jobs/j1/moderate'], ['patch','/admin/reports/r1/process'],
    ])
    expect(JSON.parse(requests[1][2])).toEqual({ reason: 'Invalid company details' })
    expect(JSON.parse(requests[2][2])).toEqual({ operation: 'remove', reason: 'Policy violation' })
    expect(JSON.parse(requests[3][2])).toEqual({ operation: 'restore' })
  })
})
