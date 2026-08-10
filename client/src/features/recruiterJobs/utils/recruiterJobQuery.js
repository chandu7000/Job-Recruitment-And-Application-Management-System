import {
  DEFAULT_JOB_QUERY,
  RECRUITER_JOB_QUERY_KEYS,
} from '../constants/recruiterJobConstants'

const hasValue = (value) =>
  value !== undefined && value !== null && value !== ''

export function serializeRecruiterJobQuery(query = {}) {
  const params = new URLSearchParams()

  RECRUITER_JOB_QUERY_KEYS.forEach((key) => {
    const value = query[key]
    if (!hasValue(value)) return
    params.set(key, String(value).trim())
  })

  return params
}

export function readRecruiterJobQuery(searchParams) {
  const query = { ...DEFAULT_JOB_QUERY }

  RECRUITER_JOB_QUERY_KEYS.forEach((key) => {
    const value = searchParams.get(key)
    if (value !== null && value !== '') query[key] = value
  })

  query.page = Math.max(1, Number(query.page) || 1)
  query.limit = Math.min(100, Math.max(1, Number(query.limit) || 10))
  return query
}

export function buildRecruiterJobSearchParams(query) {
  const params = serializeRecruiterJobQuery(query)
  if (String(query.page ?? 1) === '1') params.delete('page')
  if (String(query.limit ?? 10) === '10') params.delete('limit')
  if ((query.sort ?? 'newest') === 'newest') params.delete('sort')
  return params
}
