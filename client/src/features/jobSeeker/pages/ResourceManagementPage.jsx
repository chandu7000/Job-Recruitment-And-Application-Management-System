import { useCallback, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import ResourceForm from '../components/ResourceForm'
import { RESOURCE_CONFIG, formatLabel } from '../constants/jobSeekerConstants'
import { useJobSeekerResource } from '../hooks/useJobSeekerResource'
import { jobSeekerApi } from '../services/jobSeekerApi'

function displayValue(value) {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return value ? formatLabel(String(value)) : null
}

function ResourceManagementPage({ resource }) {
  const config = RESOURCE_CONFIG[resource]
  const loader = useCallback((signal) => jobSeekerApi.list(config.endpoint, config.key, signal), [config])
  const { data: resourceData, loading, error, reload } = useJobSeekerResource(loader)
  const data = resourceData ?? []
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const save = async (payload) => { const uniqueField = resource === 'skills' ? 'skillName' : resource === 'social-links' ? 'platform' : null; if (uniqueField && data.some((item) => item.id !== editing?.id && item[uniqueField]?.toLowerCase() === payload[uniqueField]?.toLowerCase())) { toast.error(`${config.fields.find(([name]) => name === uniqueField)?.[1]} already exists`); return } setSaving(true); try { if (editing) await jobSeekerApi.update(config.endpoint, editing.id, payload, config.method); else await jobSeekerApi.create(config.endpoint, payload); toast.success(`${config.title} updated`); setEditing(null); setAdding(false); reload() } catch (requestError) { toast.error(getApiErrorMessage(requestError)) } finally { setSaving(false) } }
  const remove = async (item) => { if (!window.confirm(`Delete this ${config.title.toLowerCase()} entry?`)) return; try { await jobSeekerApi.remove(config.endpoint, item.id); toast.success('Entry deleted'); reload() } catch (requestError) { toast.error(getApiErrorMessage(requestError)) } }
  if (loading && !data.length) return <PageLoader label={`Loading ${config.title.toLowerCase()}`} />
  if (error) return <ErrorState message={getApiErrorMessage(error)} onRetry={reload} />
  return <div className="space-y-5"><header className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">{config.title}</h1><p className="mt-1 text-slate-600">Add and maintain your professional {config.title.toLowerCase()}.</p></div><AppButton onClick={() => { setEditing(null); setAdding(true) }}><Plus className="size-4" />Add</AppButton></header>
    {(adding || editing) && <ResourceForm config={config} item={editing} saving={saving} onSubmit={save} onCancel={() => { setAdding(false); setEditing(null) }} />}
    {!data.length ? <EmptyState title={`No ${config.title.toLowerCase()} yet`} description="Add your first entry to strengthen your profile." /> : <div className="grid gap-4 lg:grid-cols-2">{data.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex justify-between gap-3"><div>{config.fields.slice(0, 4).map(([name, label]) => displayValue(item[name]) && <p key={name} className={name === config.fields[0][0] ? 'font-bold text-slate-950' : 'mt-1 text-sm text-slate-600'}><span className="sr-only">{label}: </span>{displayValue(item[name])}</p>)}</div><div className="flex gap-1"><button aria-label="Edit entry" className="rounded-lg p-2 hover:bg-slate-100" onClick={() => { setAdding(false); setEditing(item) }}><Pencil className="size-4" /></button><button aria-label="Delete entry" className="rounded-lg p-2 text-red-700 hover:bg-red-50" onClick={() => remove(item)}><Trash2 className="size-4" /></button></div></div></article>)}</div>}
  </div>
}
export default ResourceManagementPage
