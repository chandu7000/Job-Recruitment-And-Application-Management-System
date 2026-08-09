import { z } from 'zod'

const optionalText = (max) => z.string().trim().max(max).optional().or(z.literal(''))
const optionalUrl = z.string().trim().refine((value) => !value || /^https?:\/\//i.test(value), 'Enter a valid HTTP or HTTPS URL')

export const profileSchema = z.object({
  firstName: optionalText(100), lastName: optionalText(100), phoneNumber: optionalText(30), location: optionalText(255),
  addressLine1: optionalText(255), addressLine2: optionalText(255), city: optionalText(100), state: optionalText(100), country: optionalText(100), postalCode: optionalText(20),
})
export const professionalSchema = z.object({ headline: optionalText(255), biography: optionalText(5000) })
export const resourceSchema = (config) => z.object(Object.fromEntries(config.fields.map(([name, label, type, required]) => {
  let schema = type === 'checkbox' ? z.boolean() : z.string()
  if (required && type !== 'checkbox') schema = schema.trim().min(1, `${label} is required`)
  if (type === 'url') schema = optionalUrl
  return [name, schema]
}))).superRefine((data, context) => {
  if (data.startDate && data.endDate && data.endDate < data.startDate) context.addIssue({ code: 'custom', path: ['endDate'], message: 'End date cannot be before start date' })
  if ((data.isCurrent || data.doesNotExpire) && data.endDate) context.addIssue({ code: 'custom', path: ['endDate'], message: 'Remove the end date when this option is selected' })
})

export function normalizePayload(values, fields) {
  return Object.fromEntries(fields.map(([name, , type]) => {
    const value = values[name]
    if (type === 'csv') {
      const normalized = value.split(',').map((item) => item.trim()).filter(Boolean)
      return [name, normalized.filter((item, index) => normalized.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) === index)]
    }
    if (type === 'checkbox') return [name, Boolean(value)]
    return [name, value === '' ? null : value.trim()]
  }))
}
