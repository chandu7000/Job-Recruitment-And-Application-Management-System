import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import SectionCard from '../components/SectionCard'
import { useJobSeekerResource } from '../hooks/useJobSeekerResource'
import { jobSeekerApi } from '../services/jobSeekerApi'
import { professionalSchema, profileSchema } from '../validation/jobSeekerSchemas'

const personalFields = [['firstName','First name'],['lastName','Last name'],['phoneNumber','Phone number'],['location','Location'],['addressLine1','Address line 1'],['addressLine2','Address line 2'],['city','City'],['state','State'],['country','Country'],['postalCode','Postal code']]
function EditForm({ profile, schema, fields, professional, onSaved }) {
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, control, formState: { errors, isDirty } } = useForm({ resolver: zodResolver(schema) })
  const values = useWatch({ control })
  useEffect(() => reset(Object.fromEntries(fields.map(([name]) => [name, profile?.[name] ?? '']))), [fields, profile, reset])
  useEffect(() => { const warn = (event) => { if (isDirty) { event.preventDefault(); event.returnValue = '' } }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn) }, [isDirty])
  const submit = async (values) => { const payload = professional ? values : Object.fromEntries(Object.entries(values).filter(([name, value]) => !['firstName', 'lastName', 'phoneNumber'].includes(name) || value.trim())); setSaving(true); try { await (professional ? jobSeekerApi.updateProfessional(payload) : jobSeekerApi.updateProfile(payload)); toast.success('Profile updated'); reset(values); onSaved() } catch (error) { toast.error(getApiErrorMessage(error)) } finally { setSaving(false) } }
  return <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(submit)}>{fields.map(([name, label, type]) => <label key={name} className={type === 'textarea' ? 'sm:col-span-2' : ''}><span className="mb-1 block text-sm font-medium">{label}</span>{type === 'textarea' ? <textarea rows="7" maxLength="5000" {...register(name)} className="w-full rounded-lg border border-slate-300 p-3" /> : <input {...register(name)} maxLength={name === 'headline' ? 255 : undefined} className="w-full rounded-lg border border-slate-300 p-3" />}<span className="flex justify-between text-xs"><span className="text-red-700">{errors[name]?.message}</span>{professional && <span>{values?.[name]?.length ?? 0}/{name === 'headline' ? 255 : 5000}</span>}</span></label>)}<AppButton className="sm:col-span-2 sm:w-fit" type="submit" loading={saving} disabled={!isDirty}>Save changes</AppButton></form>
}
function ProfileEditPage() {
  const loader = useCallback((signal) => jobSeekerApi.profile(signal), [])
  const { data, loading, error, reload } = useJobSeekerResource(loader)
  if (loading) return <PageLoader label="Loading profile editor" />
  if (error) return <ErrorState message={getApiErrorMessage(error)} onRetry={reload} />
  return <div className="space-y-6"><h1 className="text-3xl font-bold">Edit profile</h1><SectionCard title="Personal information"><EditForm profile={data} schema={profileSchema} fields={personalFields} onSaved={reload} /></SectionCard><SectionCard title="Headline and biography"><EditForm profile={data} schema={professionalSchema} fields={[["headline","Professional headline"],["biography","Biography","textarea"]]} professional onSaved={reload} /></SectionCard></div>
}
export default ProfileEditPage
