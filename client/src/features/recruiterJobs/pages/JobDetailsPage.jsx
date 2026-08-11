import { useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../../components/common/PageHeader'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { formatCurrency } from '../../../utils/currency'
import { formatDate, formatDateTime } from '../../../utils/date'
import { formatStatusLabel } from '../../../utils/status'
import { useRecruiterResource } from '../../recruiter/hooks/useRecruiterResource'
import JobLifecycleActions from '../components/JobLifecycleActions'
import JobStatusBadge from '../components/JobStatusBadge'
import { recruiterJobApi } from '../services/recruiterJobApi'

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-medium text-slate-900">
        {value ?? '—'}
      </dd>
    </div>
  )
}

function JobDetailsPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const loader = useCallback(
    (signal) => recruiterJobApi.getById(jobId, signal),
    [jobId],
  )
  const resource = useRecruiterResource(loader)

  if (resource.loading) return <PageLoader label="Loading job details" />
  if (resource.error) {
    return (
      <ErrorState
        message={getApiErrorMessage(resource.error)}
        onRetry={resource.reload}
      />
    )
  }

  const job = resource.data
  const salary =
    job.minimumSalary != null || job.maximumSalary != null
      ? `${formatCurrency(job.minimumSalary, {
          currency: job.salaryCurrency || 'INR',
        })} – ${formatCurrency(job.maximumSalary, {
          currency: job.salaryCurrency || 'INR',
        })}`
      : 'Not provided'

  const experience =
    job.minimumExperience != null || job.maximumExperience != null
      ? `${job.minimumExperience ?? 0} – ${job.maximumExperience ?? '—'} years`
      : 'Not provided'

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link className="hover:text-brand-700" to="/recruiter/jobs">
          Jobs
        </Link>{' '}
        <span aria-hidden="true">/</span>{' '}
        <span>{job.title || 'Untitled draft'}</span>
      </nav>

      <PageHeader
        title={job.title || 'Untitled draft'}
        description={job.company?.companyName || 'Recruiter-owned job'}
        actions={<JobStatusBadge status={job.status} />}
      />

      <div className="flex flex-wrap gap-3">
        <Link
          to={`/recruiter/jobs/${job.id}/applicants`}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          View applicants ({Number(job.applicationCount ?? 0)})
        </Link>
      </div>

      <JobLifecycleActions
        job={job}
        onChanged={resource.reload}
        onDeleted={() => navigate('/recruiter/jobs', { replace: true })}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-950">Job overview</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Company" value={job.company?.companyName} />
          <Detail label="Company status" value={formatStatusLabel(job.company?.status)} />
          <Detail label="Location" value={job.location || 'Not provided'} />
          <Detail label="Work mode" value={formatStatusLabel(job.workMode)} />
          <Detail label="Employment type" value={formatStatusLabel(job.employmentType)} />
          <Detail label="Experience level" value={formatStatusLabel(job.experienceLevel)} />
          <Detail label="Experience range" value={experience} />
          <Detail label="Salary range" value={salary} />
          <Detail label="Openings" value={job.vacancies ?? '—'} />
          <Detail label="Application deadline" value={formatDateTime(job.applicationDeadline)} />
          <Detail label="Views" value={Number(job.viewCount ?? 0)} />
          <Detail label="Applications" value={Number(job.applicationCount ?? 0)} />
          <Detail label="Created" value={formatDateTime(job.createdAt)} />
          <Detail label="Published" value={formatDateTime(job.publishedAt)} />
          <Detail label="Closed" value={formatDateTime(job.closedAt)} />
        </dl>

        {job.closureReason && (
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900">Closure reason</h3>
            <p className="mt-1 text-sm text-slate-600">{job.closureReason}</p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-950">Public-style preview</h2>
        <div className="mt-5 space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
              {job.description || 'No description provided.'}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Responsibilities</h3>
            <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
              {job.responsibilities || 'No responsibilities provided.'}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Requirements</h3>
            <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
              {job.requirements || 'No requirements provided.'}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Skills</h3>
            {Array.isArray(job.skills) && job.skills.length ? (
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Job skills">
                {job.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-slate-600">No skills provided.</p>
            )}
          </div>
        </div>
      </section>

      <p className="text-xs text-slate-500">
        Last updated {formatDate(job.updatedAt)}.
      </p>
    </div>
  )
}

export default JobDetailsPage
