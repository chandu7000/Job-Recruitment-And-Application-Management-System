import { PUBLIC_JOB_QUERY_KEYS } from '../constants/publicJobConstants'

const hasValue = (value) =>
  value !== undefined && value !== null && value !== ''

const normalizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(',')
  }

  return typeof value === 'string' ? value.trim() : String(value)
}

export const serializePublicJobQuery = (query = {}) => {
  const params = new URLSearchParams()

  PUBLIC_JOB_QUERY_KEYS.forEach((key) => {
    const value = query[key]

    if (!hasValue(value)) return

    const normalizedValue = normalizeValue(value)
    if (normalizedValue) params.set(key, normalizedValue)
  })

  return params
}

export const serializeSimilarJobsQuery = (limit) => {
  const params = new URLSearchParams()
  if (hasValue(limit)) params.set('limit', String(limit))
  return params
}
