import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { AVAILABILITY, EMPLOYMENT_TYPES, WORK_MODES, formatLabel } from '../constants/jobSeekerConstants'
import { useJobSeekerResource } from '../hooks/useJobSeekerResource'
import { jobSeekerApi } from '../services/jobSeekerApi'

const initial = { preferredJobRoles: '', preferredLocations: '', employmentTypes: [], workModes: [], expectedSalary: '', salaryCurrency: 'INR', noticePeriodDays: '', willingToRelocate: false, availabilityStatus: 'OPEN_TO_OPPORTUNITIES' }
const csv = (value) => value.split(',').map((item) => item.trim()).filter(Boolean)
function PreferencesForm({ data, reload }) {
  const [form, setForm] = useState({ ...initial, ...data, preferredJobRoles: (data?.preferredJobRoles ?? []).join(', '), preferredLocations: (data?.preferredLocations ?? []).join(', '), expectedSalary: data?.expectedSalary ?? '', noticePeriodDays: data?.noticePeriodDays ?? '' }); const [saving, setSaving] = useState(false)
  const toggle = (field, value) => setForm((current) => ({ ...current, [field]: current[field].includes(value) ? current[field].filter((item) => item !== value) : [...current[field], value] }))
  const submit = async (event) => { event.preventDefault(); setSaving(true); try { await jobSeekerApi.updatePreferences({ ...form, preferredJobRoles: csv(form.preferredJobRoles), preferredLocations: csv(form.preferredLocations), expectedSalary: form.expectedSalary === '' ? null : Number(form.expectedSalary), noticePeriodDays: form.noticePeriodDays === '' ? null : Number(form.noticePeriodDays) }); toast.success('Job preferences saved'); reload() } catch (requestError) { toast.error(getApiErrorMessage(requestError)) } finally { setSaving(false) } }
  const reset = async () => { if (!window.confirm('Reset all job preferences?')) return; try { await jobSeekerApi.resetPreferences(); setForm(initial); toast.success('Preferences reset'); reload() } catch (requestError) { toast.error(getApiErrorMessage(requestError)) } }
  return <form onSubmit={submit} className="max-w-4xl space-y-6"><h1 className="text-3xl font-bold">Job preferences</h1><div className="grid gap-4 rounded-2xl border bg-white p-5 sm:grid-cols-2">{[['preferredJobRoles','Preferred roles'],['preferredLocations','Preferred locations']].map(([name,label]) => <label key={name}><span className="text-sm font-medium">{label} (comma separated)</span><input value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>)}
    {[['employmentTypes','Employment types',EMPLOYMENT_TYPES],['workModes','Work modes',WORK_MODES]].map(([name,label,options]) => <fieldset key={name}><legend className="text-sm font-medium">{label}</legend><div className="mt-2 flex flex-wrap gap-2">{options.map((option) => <label key={option} className="rounded-full border px-3 py-2 text-sm"><input className="mr-2" type="checkbox" checked={form[name].includes(option)} onChange={() => toggle(name, option)} />{formatLabel(option)}</label>)}</div></fieldset>)}
    <label><span className="text-sm font-medium">Expected salary</span><input type="number" min="0" value={form.expectedSalary} onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label><label><span className="text-sm font-medium">Notice period (days)</span><input type="number" min="0" max="365" value={form.noticePeriodDays} onChange={(e) => setForm({ ...form, noticePeriodDays: e.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>
    <label><span className="text-sm font-medium">Availability</span><select value={form.availabilityStatus} onChange={(e) => setForm({ ...form, availabilityStatus: e.target.value })} className="mt-1 w-full rounded-lg border p-3">{AVAILABILITY.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}</select></label><label className="flex items-center gap-2 self-end py-3"><input type="checkbox" checked={form.willingToRelocate} onChange={(e) => setForm({ ...form, willingToRelocate: e.target.checked })} />Willing to relocate</label></div><div className="flex gap-3"><AppButton type="submit" loading={saving}>Save preferences</AppButton><AppButton variant="danger" onClick={reset}>Reset</AppButton></div></form>
}
function JobPreferencesPage() {
  const loader = useCallback((signal) => jobSeekerApi.preferences(signal), [])
  const { data, loading, error, reload } = useJobSeekerResource(loader)
  if (loading && !data) return <PageLoader label="Loading job preferences" />
  if (error) return <ErrorState message={getApiErrorMessage(error)} onRetry={reload} />
  return <PreferencesForm key={data?.updatedAt ?? data?.id ?? 'empty'} data={data} reload={reload} />
}
export default JobPreferencesPage
