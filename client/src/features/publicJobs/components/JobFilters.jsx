import { useState } from 'react'
import AppButton from '../../../components/common/AppButton'
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, WORK_MODES } from '../constants/publicJobConstants'
import { validateJobFilters } from '../utils/filterValidation'

function Field({ label, error, children }) {
  return <label className="block text-sm font-medium text-slate-700">{label}{children}{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>
}

function SelectField({ label, value, onChange, options }) {
  return <Field label={label}><select value={value} onChange={onChange} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"><option value="">All</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
}

function JobFilters({ filters, onApply, onClear }) {
  const [draft, setDraft] = useState(filters)
  const [errors, setErrors] = useState({})
  const update = (key) => (event) => setDraft((current) => ({ ...current, [key]: event.target.value }))

  const submit = (event) => {
    event.preventDefault()
    const validationErrors = validateJobFilters(draft)
    setErrors(validationErrors)
    if (!Object.keys(validationErrors).length) onApply(draft)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <SelectField label="Work mode" value={draft.workMode} onChange={update('workMode')} options={WORK_MODES} />
      <SelectField label="Employment type" value={draft.employmentType} onChange={update('employmentType')} options={EMPLOYMENT_TYPES} />
      <SelectField label="Experience level" value={draft.experienceLevel} onChange={update('experienceLevel')} options={EXPERIENCE_LEVELS} />
      <Field label="Skills"><input value={draft.skills} onChange={update('skills')} placeholder="Java, React" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Minimum salary" error={errors.minimumSalary}><input type="number" min="0" value={draft.minimumSalary} onChange={update('minimumSalary')} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></Field>
        <Field label="Maximum salary" error={errors.maximumSalary}><input type="number" min="0" value={draft.maximumSalary} onChange={update('maximumSalary')} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Published from"><input type="date" value={draft.publishedFrom} onChange={update('publishedFrom')} className="mt-1.5 w-full rounded-lg border border-slate-300 px-2 py-2.5" /></Field>
        <Field label="Published to" error={errors.publishedTo}><input type="date" value={draft.publishedTo} onChange={update('publishedTo')} className="mt-1.5 w-full rounded-lg border border-slate-300 px-2 py-2.5" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Deadline from"><input type="date" value={draft.deadlineFrom} onChange={update('deadlineFrom')} className="mt-1.5 w-full rounded-lg border border-slate-300 px-2 py-2.5" /></Field>
        <Field label="Deadline to" error={errors.deadlineTo}><input type="date" value={draft.deadlineTo} onChange={update('deadlineTo')} className="mt-1.5 w-full rounded-lg border border-slate-300 px-2 py-2.5" /></Field>
      </div>
      <div className="flex gap-2"><AppButton type="submit" className="flex-1">Apply filters</AppButton><AppButton type="button" variant="secondary" onClick={onClear}>Clear</AppButton></div>
    </form>
  )
}

export default JobFilters
