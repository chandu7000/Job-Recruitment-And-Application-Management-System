import { afterEach, describe, expect, it } from 'vitest'
import axiosClient from '../api/axiosClient'
import { API_ENDPOINTS } from '../api/endpoints'
import { adminApi, buildUserParams, normalizePagination } from '../features/admin/services/adminApi'

const originalAdapter = axiosClient.defaults.adapter
const response = (config, data) => ({
  data: { success: true, data },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})

describe('admin API service', () => {
  afterEach(() => {
    axiosClient.defaults.adapter = originalAdapter
  })

  it('Recruiter pages', () => {
    expect(API_ENDPOINTS.ADMIN.DASHBOARD).toBe('/admin/dashboard')
    expect(API_ENDPOINTS.ADMIN.USERS).toBe('/admin/users')
    expect(API_ENDPOINTS.ADMIN.USER_BY_ID('user 1')).toBe('/admin/users/user%201')
    expect(API_ENDPOINTS.ADMIN.ACTIVATE_USER('u1')).toBe('/admin/users/u1/activate')
    expect(API_ENDPOINTS.ADMIN.DISABLE_USER('u1')).toBe('/admin/users/u1/disable')
    expect(API_ENDPOINTS.ADMIN.SUSPEND_USER('u1')).toBe('/admin/users/u1/suspend')
  })

  it('serializes backend-supported search, filters and pagination', () => {
    const params = buildUserParams({
      page: 2,
      limit: 20,
      search: 'admin@example.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      verified: 'true',
      sort: 'asc',
    })

    expect(params.get('page')).toBe('2')
    expect(params.get('limit')).toBe('20')
    expect(params.get('search')).toBe('admin@example.com')
    expect(params.get('role')).toBe('ADMIN')
    expect(params.get('status')).toBe('ACTIVE')
    expect(params.get('verified')).toBe('true')
    expect(params.get('sort')).toBe('asc')
  })

  it('normalizes the richer admin pagination response', () => {
    expect(normalizePagination({
      totalItems: 41,
      totalPages: 3,
      page: 2,
      limit: 20,
      hasNext: true,
      hasPrevious: true,
    })).toEqual({
      totalRecords: 41,
      totalPages: 3,
      page: 2,
      limit: 20,
      hasNextPage: true,
      hasPreviousPage: true,
    })
  })

  it('connects dashboard, list, detail and dedicated status actions', async () => {
    const requests = []
    axiosClient.defaults.adapter = async (config) => {
      requests.push([config.method, config.url])
      if (config.url === '/admin/users') {
        return response(config, { users: [], pagination: { totalItems: 0, totalPages: 0, page: 1, limit: 20, hasNext: false, hasPrevious: false } })
      }
      return response(config, { id: 'u1' })
    }

    await adminApi.dashboard()
    await adminApi.listUsers({ page: 1 })
    await adminApi.getUser('u1')
    await adminApi.activateUser('u1')
    await adminApi.disableUser('u1')
    await adminApi.suspendUser('u1')

    expect(requests).toEqual([
      ['get', '/admin/dashboard'],
      ['get', '/admin/users'],
      ['get', '/admin/users/u1'],
      ['patch', '/admin/users/u1/activate'],
      ['patch', '/admin/users/u1/disable'],
      ['patch', '/admin/users/u1/suspend'],
    ])
  })
})
