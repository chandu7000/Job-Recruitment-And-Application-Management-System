import AppButton from '../../../components/common/AppButton'
import AppInput from '../../../components/forms/AppInput'
import AppSelect from '../../../components/forms/AppSelect'
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  JOB_SORT_OPTIONS,
  JOB_STATUS_OPTIONS,
  WORK_MODES,
} from '../constants/recruiterJobConstants'

const label = (value) =>
  value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

function RecruiterJobFilters({ query, onChange, onClear }) {
  const update = (key, value) => onChange({ ...query, [key]: value, page: 1 })

  return (
    <section
      aria-label="Recruiter job filters"
      className="rounded-2xl border border-slate-200 bg-white p-4"
    >
      <div className="grid gap-3 lg:grid-cols-4">
        <AppInput
          aria-label="Search recruiter jobs"
          placeholder="Search title, description or skills"
          value={query.search ?? ''}
          onChange={(event) => update('search', event.target.value)}
        />

        <AppSelect
          aria-label="Filter by status"
          value={query.status ?? ''}
          onChange={(event) => update('status', event.target.value)}
        >
          {JOB_STATUS_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </AppSelect>

        <AppSelect
          aria-label="Filter by work mode"
          value={query.workMode ?? ''}
          onChange={(event) => update('workMode', event.target.value)}
        >
          <option value="">All work modes</option>
          {WORK_MODES.map((value) => (
            <option key={value} value={value}>
              {label(value)}
            </option>
          ))}
        </AppSelect>

        <AppSelect
          aria-label="Sort recruiter jobs"
          value={query.sort ?? 'newest'}
          onChange={(event) => update('sort', event.target.value)}
        >
          {JOB_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </AppSelect>

        <AppInput
          aria-label="Filter by location"
          placeholder="Location"
          value={query.location ?? ''}
          onChange={(event) => update('location', event.target.value)}
        />

        <AppSelect
          aria-label="Filter by employment type"
          value={query.employmentType ?? ''}
          onChange={(event) => update('employmentType', event.target.value)}
        >
          <option value="">All employment types</option>
          {EMPLOYMENT_TYPES.map((value) => (
            <option key={value} value={value}>
              {label(value)}
            </option>
          ))}
        </AppSelect>

        <AppSelect
          aria-label="Filter by experience level"
          value={query.experienceLevel ?? ''}
          onChange={(event) => update('experienceLevel', event.target.value)}
        >
          <option value="">All experience levels</option>
          {EXPERIENCE_LEVELS.map((value) => (
            <option key={value} value={value}>
              {label(value)}
            </option>
          ))}
        </AppSelect>

        <AppButton variant="secondary" onClick={onClear}>
          Clear filters
        </AppButton>
      </div>
    </section>
  )
}

export default RecruiterJobFilters
