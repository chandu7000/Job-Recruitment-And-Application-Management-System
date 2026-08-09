import { describe, expect, it } from 'vitest'
import { RESOURCE_CONFIG } from '../features/jobSeeker/constants/jobSeekerConstants'
import { normalizePayload, professionalSchema, resourceSchema } from '../features/jobSeeker/validation/jobSeekerSchemas'

describe('Job seeker validation', () => {
  it('enforces headline and biography limits', () => {
    expect(professionalSchema.safeParse({ headline: 'Developer', biography: 'About me' }).success).toBe(true)
    expect(professionalSchema.safeParse({ headline: 'x'.repeat(256), biography: '' }).success).toBe(false)
  })
  it('requires resource fields and validates date ranges', () => {
    const schema = resourceSchema(RESOURCE_CONFIG.education)
    expect(schema.safeParse({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '', description: '' }).success).toBe(false)
    expect(schema.safeParse({ institution: 'JNTUK', degree: 'B.Tech', fieldOfStudy: 'ECE', startDate: '2024-01-01', endDate: '2023-01-01', grade: '', description: '' }).success).toBe(false)
  })
  it('normalizes empty values and comma-separated technologies', () => {
    const payload = normalizePayload({ title: ' CareerForge ', description: '', technologies: 'React, Node, React', projectUrl: '', repositoryUrl: '', startDate: '', endDate: '' }, RESOURCE_CONFIG.projects.fields)
    expect(payload.title).toBe('CareerForge')
    expect(payload.description).toBeNull()
    expect(payload.technologies).toEqual(['React', 'Node'])
  })
})
