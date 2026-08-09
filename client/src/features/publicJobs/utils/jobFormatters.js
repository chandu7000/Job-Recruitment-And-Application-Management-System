import { formatCurrency } from '../../../utils/currency'
import { formatDate, formatRelativeDate } from '../../../utils/date'

export const labelFromOptions = (options, value, fallback = 'Not specified') =>
  options.find((option) => option.value === value)?.label ?? fallback

export const formatSalaryRange = (job) => {
  const currency = job.salaryCurrency || 'INR'
  const minimum = job.minimumSalary
  const maximum = job.maximumSalary

  if (minimum == null && maximum == null) return 'Salary not disclosed'
  if (minimum != null && maximum != null) {
    return `${formatCurrency(minimum, { currency })} – ${formatCurrency(maximum, { currency })}`
  }
  if (minimum != null) return `From ${formatCurrency(minimum, { currency })}`
  return `Up to ${formatCurrency(maximum, { currency })}`
}

export const formatExperienceRange = (job) => {
  const minimum = job.minimumExperience
  const maximum = job.maximumExperience

  if (minimum == null && maximum == null) return 'Experience not specified'
  if (minimum != null && maximum != null) {
    return minimum === maximum
      ? `${minimum} ${Number(minimum) === 1 ? 'year' : 'years'}`
      : `${minimum}–${maximum} years`
  }
  if (minimum != null) return `${minimum}+ years`
  return `Up to ${maximum} years`
}

export const formatJobDeadline = (value) =>
  value ? `Apply by ${formatDate(value)}` : 'No deadline specified'

export const formatPublishedDate = (value) =>
  value ? `Published ${formatRelativeDate(value)}` : 'Publish date unavailable'

export const companyLocation = (company) =>
  [company?.location, company?.city, company?.state, company?.country]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(', ') || 'Location not specified'
