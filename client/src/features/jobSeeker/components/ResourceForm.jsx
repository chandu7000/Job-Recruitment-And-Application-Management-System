import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import AppButton from '../../../components/common/AppButton'
import { formatLabel } from '../constants/jobSeekerConstants'
import { normalizePayload, resourceSchema } from '../validation/jobSeekerSchemas'

const defaults = (fields, item) => { const source = item ?? {}; return Object.fromEntries(fields.map(([name, , type]) => [name, type === 'checkbox' ? Boolean(source[name]) : type === 'csv' ? (source[name] ?? []).join(', ') : (source[name] ?? '')])) }

function ResourceForm({ config, item, onSubmit, onCancel, saving }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(resourceSchema(config)), defaultValues: defaults(config.fields, item) })
  useEffect(() => reset(defaults(config.fields, item)), [config.fields, item, reset])
  return <form className="grid gap-4 rounded-xl border border-brand-100 bg-brand-50/40 p-4 sm:grid-cols-2" onSubmit={handleSubmit((values) => onSubmit(normalizePayload(values, config.fields)))}>
    {config.fields.map(([name, label, type = 'text', required, options]) => <label key={name} className={type === 'textarea' ? 'sm:col-span-2' : ''}>
      {type === 'checkbox' ? <span className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" {...register(name)} />{label}</span> : <>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}{required && ' *'}</span>
        {type === 'textarea' ? <textarea rows="4" {...register(name)} className="w-full rounded-lg border border-slate-300 px-3 py-2" /> : type === 'select' ? <select {...register(name)} className="w-full rounded-lg border border-slate-300 px-3 py-2"><option value="">Select</option>{options.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}</select> : <input type={type === 'csv' ? 'text' : type} {...register(name)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />}
      </>}
      {errors[name] && <span role="alert" className="mt-1 block text-xs text-red-700">{errors[name].message}</span>}
    </label>)}
    <div className="flex gap-2 sm:col-span-2"><AppButton type="submit" loading={saving}>{item ? 'Save changes' : 'Add'}</AppButton><AppButton variant="secondary" onClick={onCancel}>Cancel</AppButton></div>
  </form>
}
export default ResourceForm
