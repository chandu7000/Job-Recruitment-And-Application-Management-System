import { describe, expect, it } from 'vitest'
import {
  getNotificationLabel,
  normalizeNotificationPagination,
  notificationCenterPath,
  resolveNotificationTarget,
} from '../features/notifications/utils/notification'

describe('notification utilities', () => {
  it('maps only safe role-aware related resource routes', () => {
    expect(resolveNotificationTarget({ resourceType: 'APPLICATION', resourceId: 'a1' }, 'JOB_SEEKER')).toBe('/job-seeker/applications/a1')
    expect(resolveNotificationTarget({ resourceType: 'INTERVIEW', resourceId: 'i1' }, 'RECRUITER')).toBe('/recruiter/interviews/i1')
    expect(resolveNotificationTarget({ resourceType: 'JOB', resourceId: 'j1' }, 'RECRUITER')).toBe('/recruiter/jobs/j1')
    expect(resolveNotificationTarget({ resourceType: 'JOB', resourceId: 'j1' }, 'JOB_SEEKER')).toBeNull()
    expect(resolveNotificationTarget({ resourceType: 'APPLICATION', resourceId: 'a1' }, 'ADMIN')).toBeNull()
  })

  it('provides center routes and backend type labels', () => {
    expect(notificationCenterPath('JOB_SEEKER')).toBe('/job-seeker/notifications')
    expect(notificationCenterPath('RECRUITER')).toBe('/recruiter/notifications')
    expect(notificationCenterPath('ADMIN')).toBe('/admin/notifications')
    expect(getNotificationLabel('INTERVIEW_RESCHEDULED')).toBe('Interview rescheduled')
  })

  it('normalizes backend pagination metadata', () => {
    expect(normalizeNotificationPagination({ page: 2, totalItems: 15, totalPages: 3, hasNext: true })).toMatchObject({
      page: 2,
      totalItems: 15,
      totalPages: 3,
      hasNext: true,
    })
  })
})
