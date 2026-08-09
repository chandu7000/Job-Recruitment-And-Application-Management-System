import { X } from 'lucide-react'
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, WORK_MODES } from '../constants/publicJobConstants'
import { activeFilterEntries } from '../utils/urlFilters'
import { labelFromOptions } from '../utils/jobFormatters'

const labels = { search: 'Keyword', location: 'Location', skills: 'Skills', minimumSalary: 'Min salary', maximumSalary: 'Max salary', publishedFrom: 'Published from', publishedTo: 'Published to', deadlineFrom: 'Deadline from', deadlineTo: 'Deadline to' }
const valueLabel = (key, value) => key === 'workMode' ? labelFromOptions(WORK_MODES, value) : key === 'employmentType' ? labelFromOptions(EMPLOYMENT_TYPES, value) : key === 'experienceLevel' ? labelFromOptions(EXPERIENCE_LEVELS, value) : value

function ActiveFilterChips({ filters, onRemove, onClearAll }) {
  const entries = activeFilterEntries(filters)
  if (!entries.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {entries.map(([key, value]) => (
        <button key={key} type="button" onClick={() => onRemove(key)} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800">
          {labels[key] || key}: {valueLabel(key, value)}<X aria-hidden="true" className="size-3.5" />
        </button>
      ))}
      <button type="button" onClick={onClearAll} className="text-xs font-semibold text-slate-600 underline hover:text-slate-950">Clear all</button>
    </div>
  )
}

export default ActiveFilterChips
