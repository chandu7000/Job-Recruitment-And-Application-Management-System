import axios from 'axios'
import { useEffect, useState } from 'react'
import { publicJobApi } from '../../publicJobs/services/publicJobApi'

export default function InterviewJobContext({ jobId, compact = false }) {
  const [job, setJob] = useState(null)
  useEffect(() => {
    if (!jobId) return undefined
    const controller = new AbortController()
    publicJobApi.getById(jobId, { signal: controller.signal }).then(setJob).catch((error) => {
      if (!axios.isCancel(error)) setJob(null)
    })
    return () => controller.abort()
  }, [jobId])
  if (!job) return compact ? null : <p className="text-sm text-slate-500">Job context unavailable.</p>
  const company = job.company?.companyName || job.companyName || job.company?.name
  return <div className={compact ? 'mt-2' : ''}><p className="font-semibold text-slate-900">{job.title}</p>{company&&<p className="text-sm text-slate-600">{company}</p>}</div>
}
