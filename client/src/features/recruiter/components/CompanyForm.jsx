import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import AppButton from '../../../components/common/AppButton'
import RecruiterFormField from './RecruiterFormField'

const createFields = [
  ['companyName', 'Company name', 'text', true], ['companyEmail', 'Company email', 'email'], ['companyPhone', 'Company phone'], ['website', 'Website', 'url'], ['industry', 'Industry'], ['companySize', 'Company size'], ['foundedYear', 'Founded year', 'number'], ['location', 'Location'], ['address', 'Address'], ['city', 'City'], ['state', 'State'], ['country', 'Country'], ['postalCode', 'Postal code'],
]
const editFields = createFields

function CompanyForm({ schema, initialValues = {}, editing = false, saving, onSubmit }) {
  const fields = editing ? editFields : createFields
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({ resolver: zodResolver(schema), defaultValues: initialValues })
  useEffect(() => reset(initialValues), [initialValues, reset])
  useEffect(() => { const warn = (event) => { if (isDirty) { event.preventDefault(); event.returnValue = '' } }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn) }, [isDirty])
  return <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
    {fields.map(([name, label, type, required]) => <RecruiterFormField key={name} name={name} label={label} type={type} required={required} register={register} error={errors[name]} />)}
    <RecruiterFormField name="description" label="Company description" textarea rows="7" maxLength="10000" register={register} error={errors.description} />
    <AppButton className="sm:col-span-2 sm:w-fit" type="submit" loading={saving} disabled={editing && !isDirty}>{editing ? 'Save company changes' : 'Create company'}</AppButton>
  </form>
}
export default CompanyForm
