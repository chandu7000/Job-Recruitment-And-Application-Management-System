export const PUBLIC_JOB_SORTS = Object.freeze([
  Object.freeze({ value: 'latest', label: 'Latest' }),
  Object.freeze({ value: 'oldest', label: 'Oldest' }),
  Object.freeze({ value: 'relevance', label: 'Relevance' }),
  Object.freeze({ value: 'deadlineSoon', label: 'Deadline soon' }),
  Object.freeze({ value: 'salaryAscending', label: 'Salary: low to high' }),
  Object.freeze({ value: 'salaryDescending', label: 'Salary: high to low' }),
  Object.freeze({ value: 'titleAscending', label: 'Title: A to Z' }),
  Object.freeze({ value: 'titleDescending', label: 'Title: Z to A' }),
])

export const WORK_MODES = Object.freeze([
  Object.freeze({ value: 'ONSITE', label: 'On-site' }),
  Object.freeze({ value: 'REMOTE', label: 'Remote' }),
  Object.freeze({ value: 'HYBRID', label: 'Hybrid' }),
])

export const EMPLOYMENT_TYPES = Object.freeze([
  Object.freeze({ value: 'FULL_TIME', label: 'Full-time' }),
  Object.freeze({ value: 'PART_TIME', label: 'Part-time' }),
  Object.freeze({ value: 'INTERNSHIP', label: 'Internship' }),
  Object.freeze({ value: 'CONTRACT', label: 'Contract' }),
  Object.freeze({ value: 'FREELANCE', label: 'Freelance' }),
])

export const EXPERIENCE_LEVELS = Object.freeze([
  Object.freeze({ value: 'FRESHER', label: 'Fresher' }),
  Object.freeze({ value: 'JUNIOR', label: 'Junior' }),
  Object.freeze({ value: 'MID', label: 'Mid-level' }),
  Object.freeze({ value: 'SENIOR', label: 'Senior' }),
  Object.freeze({ value: 'LEAD', label: 'Lead' }),
])

export const PUBLIC_JOB_QUERY_KEYS = Object.freeze([
  'page',
  'limit',
  'sort',
  'search',
  'location',
  'workMode',
  'employmentType',
  'experienceLevel',
  'skills',
  'minimumSalary',
  'maximumSalary',
  'companyId',
  'publishedFrom',
  'publishedTo',
  'deadlineFrom',
  'deadlineTo',
])

export const PUBLIC_JOB_PAGINATION = Object.freeze({
  defaultPage: 1,
  defaultLimit: 10,
  maximumLimit: 100,
})

export const SIMILAR_JOB_LIMITS = Object.freeze({
  defaultLimit: 5,
  maximumLimit: 10,
})
