export const JOB_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  REMOVED: 'REMOVED',
})

export const JOB_STATUS_OPTIONS = Object.freeze([
  { value: '', label: 'All statuses' },
  { value: JOB_STATUSES.DRAFT, label: 'Draft' },
  { value: JOB_STATUSES.PUBLISHED, label: 'Published' },
  { value: JOB_STATUSES.CLOSED, label: 'Closed' },
  { value: JOB_STATUSES.REMOVED, label: 'Removed' },
])

export const WORK_MODES = Object.freeze(['ONSITE', 'REMOTE', 'HYBRID'])
export const EMPLOYMENT_TYPES = Object.freeze([
  'FULL_TIME',
  'PART_TIME',
  'INTERNSHIP',
  'CONTRACT',
  'FREELANCE',
])
export const EXPERIENCE_LEVELS = Object.freeze([
  'FRESHER',
  'JUNIOR',
  'MID',
  'SENIOR',
  'LEAD',
])

export const JOB_SORT_OPTIONS = Object.freeze([
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'deadlineSoon', label: 'Deadline soon' },
  { value: 'titleAscending', label: 'Title A–Z' },
  { value: 'titleDescending', label: 'Title Z–A' },
  { value: 'salaryAscending', label: 'Salary low to high' },
  { value: 'salaryDescending', label: 'Salary high to low' },
])

export const JOB_FIELD_LIMITS = Object.freeze({
  titleMin: 3,
  titleMax: 150,
  descriptionMax: 50000,
  responsibilitiesMax: 30000,
  requirementsMax: 30000,
  locationMax: 255,
  closureReasonMax: 2000,
  skillsMax: 50,
  skillMax: 100,
  experienceMax: 60,
  vacanciesMax: 100000,
  searchMax: 200,
})

export const RECRUITER_JOB_QUERY_KEYS = Object.freeze([
  'page',
  'limit',
  'search',
  'status',
  'location',
  'employmentType',
  'workMode',
  'experienceLevel',
  'dateFrom',
  'dateTo',
  'publishedFrom',
  'publishedTo',
  'deadlineFrom',
  'deadlineTo',
  'minimumSalary',
  'maximumSalary',
  'sort',
])

export const DEFAULT_JOB_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  search: '',
  status: '',
  location: '',
  employmentType: '',
  workMode: '',
  experienceLevel: '',
  sort: 'newest',
})

export const DRAFT_EDITABLE_FIELDS = Object.freeze([
  'title',
  'description',
  'responsibilities',
  'requirements',
  'skills',
  'location',
  'workMode',
  'employmentType',
  'experienceLevel',
  'minimumExperience',
  'maximumExperience',
  'minimumSalary',
  'maximumSalary',
  'salaryCurrency',
  'vacancies',
  'applicationDeadline',
])

export const PUBLISHED_EDITABLE_FIELDS = Object.freeze([
  'description',
  'responsibilities',
  'requirements',
  'skills',
  'location',
  'workMode',
  'vacancies',
  'applicationDeadline',
])

export const JOB_STATUS_CONTENT = Object.freeze({
  DRAFT: { label: 'Draft', tone: 'slate' },
  PUBLISHED: { label: 'Published', tone: 'green' },
  CLOSED: { label: 'Closed', tone: 'amber' },
  REMOVED: { label: 'Removed', tone: 'red' },
})

export const DEFAULT_JOB_VALUES = Object.freeze({
  title: '',
  description: '',
  responsibilities: '',
  requirements: '',
  skills: [],
  location: '',
  workMode: '',
  employmentType: '',
  experienceLevel: '',
  minimumExperience: '',
  maximumExperience: '',
  minimumSalary: '',
  maximumSalary: '',
  salaryCurrency: 'INR',
  vacancies: 1,
  applicationDeadline: '',
})
