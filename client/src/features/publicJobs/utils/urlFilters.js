import { PUBLIC_JOB_QUERY_KEYS } from '../constants/publicJobConstants'

export const EMPTY_FILTERS = Object.freeze({
  search: '', location: '', workMode: '', employmentType: '', experienceLevel: '',
  skills: '', minimumSalary: '', maximumSalary: '', publishedFrom: '', publishedTo: '',
  deadlineFrom: '', deadlineTo: '', sort: 'latest', page: '1',
})

export const filtersFromSearchParams = (searchParams) => {
  const filters = { ...EMPTY_FILTERS }
  PUBLIC_JOB_QUERY_KEYS.forEach((key) => {
    const value = searchParams.get(key)
    if (value !== null && key in filters) filters[key] = value
  })
  return filters
}

export const filtersToSearchParams = (filters) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return
    if (key === 'page' && String(value) === '1') return
    if (key === 'sort' && value === 'latest') return
    params.set(key, String(value).trim())
  })
  return params
}

export const activeFilterEntries = (filters) =>
  Object.entries(filters).filter(([key, value]) =>
    Boolean(value) && key !== 'page' && key !== 'sort',
  )
