const isInvalidRange = (from, to) => from && to && from > to

export const validateJobFilters = (filters) => {
  const errors = {}
  const minimumSalary = filters.minimumSalary === '' ? null : Number(filters.minimumSalary)
  const maximumSalary = filters.maximumSalary === '' ? null : Number(filters.maximumSalary)

  if (minimumSalary != null && (!Number.isFinite(minimumSalary) || minimumSalary < 0)) {
    errors.minimumSalary = 'Minimum salary must be zero or greater.'
  }
  if (maximumSalary != null && (!Number.isFinite(maximumSalary) || maximumSalary < 0)) {
    errors.maximumSalary = 'Maximum salary must be zero or greater.'
  }
  if (minimumSalary != null && maximumSalary != null && minimumSalary > maximumSalary) {
    errors.maximumSalary = 'Maximum salary must be greater than or equal to minimum salary.'
  }
  if (isInvalidRange(filters.publishedFrom, filters.publishedTo)) {
    errors.publishedTo = 'Published-to date cannot be before published-from date.'
  }
  if (isInvalidRange(filters.deadlineFrom, filters.deadlineTo)) {
    errors.deadlineTo = 'Deadline-to date cannot be before deadline-from date.'
  }

  return errors
}
