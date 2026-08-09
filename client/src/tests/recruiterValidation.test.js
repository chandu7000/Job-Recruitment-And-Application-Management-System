import { describe, expect, it } from 'vitest'
import { COMPANY_LOGO_RULES, COMPANY_STATUSES, getCompanyCapabilities } from '../features/recruiter/constants/recruiterConstants'
import { companyCreateSchema, companyEditSchema, recruiterProfileSchema } from '../features/recruiter/validation/recruiterSchemas'

describe('Recruiter Phase 6 validation and restrictions', () => {
  it('matches the backend logo contract', () => {
    expect(COMPANY_LOGO_RULES.fieldName).toBe('companyLogo')
    expect(COMPANY_LOGO_RULES.maximumSize).toBe(5 * 1024 * 1024)
    expect(COMPANY_LOGO_RULES.acceptedTypes).toEqual(['image/jpeg', 'image/png', 'image/webp'])
  })
  it('validates recruiter profile limits and LinkedIn ownership', () => {
    const valid = { firstName: 'Chandra', lastName: 'Sekhar', designation: 'Recruiter', phoneNumber: '+91 9876543210', biography: '', linkedinUrl: 'https://linkedin.com/in/chandra' }
    expect(recruiterProfileSchema.safeParse(valid).success).toBe(true)
    expect(recruiterProfileSchema.safeParse({ ...valid, linkedinUrl: 'https://example.com/profile' }).success).toBe(false)
  })
  it('separates creation fields from backend-supported edit fields', () => {
    expect(companyCreateSchema.safeParse({ companyName: 'CareerForge', companyEmail: '', companyPhone: '', website: '', industry: '', companySize: '', foundedYear: '', description: '', location: '', address: '', city: '', state: '', country: '', postalCode: '' }).success).toBe(true)
    expect(companyEditSchema.safeParse({ companyName: 'CareerForge', companyEmail: '', companyPhone: '', website: '', industry: '', companySize: '', foundedYear: '', description: 'Updated', location: '', address: '', city: '', state: '', country: '', postalCode: '' }).success).toBe(true)
  })
  it('prevents unsupported actions for pending companies', () => {
    const pending = getCompanyCapabilities({ status: COMPANY_STATUSES.PENDING_VERIFICATION })
    expect(pending.canEdit).toBe(false)
    expect(pending.canManageLogo).toBe(false)
    expect(pending.canSubmit).toBe(false)
    expect(getCompanyCapabilities({ status: COMPANY_STATUSES.DRAFT }).canSubmit).toBe(true)
  })
})
