import { z } from 'zod'

const optionalText = (maximum, label) => z.string().trim().max(maximum, `${label} must not exceed ${maximum} characters.`).optional().or(z.literal(''))
const optionalUrl = z.string().trim().max(500).refine((value) => !value || /^https?:\/\//i.test(value), 'Enter a URL beginning with http:// or https://.')

export const recruiterProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  designation: z.string().trim().min(1).max(150),
  phoneNumber: z.string().trim().regex(/^\+?[0-9\s()-]{7,20}$/, 'Enter a valid phone number.'),
  biography: optionalText(2000, 'Biography'),
  linkedinUrl: optionalUrl.refine((value) => !value || /(^|\.)linkedin\.com$/i.test(new URL(value).hostname.replace(/^www\./, '')), 'Enter a linkedin.com URL.'),
})

export const companyCreateSchema = z.object({
  companyName: z.string().trim().min(2).max(200),
  companyEmail: z.string().trim().email().max(255).optional().or(z.literal('')),
  companyPhone: z.string().trim().min(7).max(30).optional().or(z.literal('')),
  website: optionalUrl,
  industry: optionalText(150, 'Industry'),
  companySize: optionalText(50, 'Company size'),
  foundedYear: z.union([z.literal(''), z.coerce.number().int().min(1000).max(new Date().getUTCFullYear())]),
  description: optionalText(10000, 'Description'),
  location: optionalText(255, 'Location'),
  address: optionalText(500, 'Address'),
  city: optionalText(100, 'City'),
  state: optionalText(100, 'State'),
  country: optionalText(100, 'Country'),
  postalCode: optionalText(20, 'Postal code'),
})

export const companyEditSchema = companyCreateSchema

export function compactPayload(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '' && value !== null && value !== undefined))
}
