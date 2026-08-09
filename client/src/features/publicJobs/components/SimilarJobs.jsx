import axios from 'axios'
import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../../api/errorMapper'
import EmptyState from '../../../components/feedback/EmptyState'
import JobCard from './JobCard'
import JobCardSkeleton from './JobCardSkeleton'
import { publicJobApi } from '../services/publicJobApi'

function SimilarJobs({ jobId }) {
  const [state, setState] = useState({ jobs: [], loadedFor: '', error: '' })

  useEffect(() => {
    const controller = new AbortController()
    publicJobApi.getSimilar(jobId, 5, { signal: controller.signal })
      .then(({ jobs }) => setState({ jobs, loadedFor: jobId, error: '' }))
      .catch((error) => {
        if (!axios.isCancel(error)) setState({ jobs: [], loadedFor: jobId, error: getApiErrorMessage(error) })
      })
    return () => controller.abort()
  }, [jobId])

  return (
    <section className="mt-12" aria-labelledby="similar-jobs-heading">
      <h2 id="similar-jobs-heading" className="text-2xl font-bold text-slate-950">Similar jobs</h2>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {state.loadedFor !== jobId ? Array.from({ length: 2 }, (_, index) => <JobCardSkeleton key={index} />) : state.error ? <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Similar jobs are temporarily unavailable.</p> : !state.jobs.length ? <EmptyState className="lg:col-span-2" title="No similar jobs available" /> : state.jobs.map((job) => <JobCard key={job.id} job={job} />)}
      </div>
    </section>
  )
}

export default SimilarJobs
