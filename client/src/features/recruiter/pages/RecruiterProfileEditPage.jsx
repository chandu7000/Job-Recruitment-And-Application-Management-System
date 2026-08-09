import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import RecruiterFormField from '../components/RecruiterFormField'
import { useRecruiterResource } from '../hooks/useRecruiterResource'
import { recruiterApi } from '../services/recruiterApi'
import { compactPayload, recruiterProfileSchema } from '../validation/recruiterSchemas'

const fields = [['firstName', 'First name'], ['lastName', 'Last name'], ['designation', 'Designation'], ['phoneNumber', 'Phone number'], ['linkedinUrl', 'LinkedIn URL']]
function RecruiterProfileEditPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const loader = useCallback((signal) => recruiterApi.profile(signal), [])
  const resource = useRecruiterResource(loader)
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({ resolver: zodResolver(recruiterProfileSchema) })
  useEffect(() => { if (resource.data) reset(Object.fromEntries([...fields.map(([name]) => [name, resource.data?.[name] ?? '']), ['biography', resource.data?.biography ?? '']])) }, [reset, resource.data])
  useEffect(() => { const warn = (event) => { if (isDirty) { event.preventDefault(); event.returnValue = '' } }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn) }, [isDirty])
  const submit = async (values) => { setSaving(true); try { await recruiterApi.updateProfile(compactPayload(values)); toast.success('Recruiter profile updated'); reset(values); navigate('/recruiter/profile') } catch (error) { toast.error(getApiErrorMessage(error)) } finally { setSaving(false) } }
  if (resource.loading) return <PageLoader label="Loading profile editor" />
  if (resource.error) return <ErrorState message={getApiErrorMessage(resource.error)} onRetry={resource.reload} />
  return <div className="space-y-6"><header><p className="text-sm font-semibold text-brand-700">Recruiter profile</p><h1 className="text-3xl font-bold">Edit professional information</h1></header><form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2" onSubmit={handleSubmit(submit)}>{fields.map(([name, label]) => <RecruiterFormField key={name} name={name} label={label} required register={register} error={errors[name]} />)}<RecruiterFormField name="biography" label="Biography" textarea rows="7" maxLength="2000" register={register} error={errors.biography} /><AppButton className="sm:col-span-2 sm:w-fit" type="submit" loading={saving} disabled={!isDirty}>Save profile</AppButton></form></div>
}
export default RecruiterProfileEditPage
