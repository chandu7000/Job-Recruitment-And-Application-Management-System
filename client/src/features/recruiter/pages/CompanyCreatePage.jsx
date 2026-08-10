import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Building2,
  BriefcaseBusiness,
  CheckCircle2,
  Pencil,
} from 'lucide-react'

import AppButton from '../../../components/common/AppButton'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'

import CompanyForm from '../components/CompanyForm'
import CompanyStatusBadge from '../components/CompanyStatusBadge'
import { useRecruiterResource } from '../hooks/useRecruiterResource'
import { recruiterApi } from '../services/recruiterApi'
import {
  companyCreateSchema,
  compactPayload,
} from '../validation/recruiterSchemas'

function CompanyCreatedState({ company }) {
  return (
    <div className="mx-auto max-w-3xl">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2
              className="size-7 text-emerald-600"
              aria-hidden="true"
            />
          </div>

          <p className="mt-5 text-sm font-semibold text-brand-700">
            Company onboarding
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
            Company created successfully
          </h1>

          <p className="mt-3 max-w-xl text-slate-600">
            Your company profile has been created and linked to your recruiter
            account. A recruiter can manage only one company, so another company
            cannot be created from this account.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white">
              <Building2
                className="size-5 text-slate-700"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-950">
                  {company?.companyName || 'Your company'}
                </h2>

                {company?.status ? (
                  <CompanyStatusBadge status={company.status} />
                ) : null}
              </div>

              <p className="mt-1 text-sm text-slate-600">
                You can now complete your company profile, manage verification,
                and continue to recruiter job management.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <AppButton asChild>
            <Link to="/recruiter/company">
              <Building2 className="size-4" aria-hidden="true" />
              View company
            </Link>
          </AppButton>

          <AppButton asChild variant="secondary">
            <Link to="/recruiter/company/edit">
              <Pencil className="size-4" aria-hidden="true" />
              Edit company
            </Link>
          </AppButton>

          <AppButton asChild variant="secondary">
            <Link to="/recruiter/jobs">
              <BriefcaseBusiness className="size-4" aria-hidden="true" />
              Go to jobs
            </Link>
          </AppButton>
        </div>
      </section>
    </div>
  )
}

function CompanyCreatePage() {
  const [saving, setSaving] = useState(false)
  const [createdCompany, setCreatedCompany] = useState(null)

  const loader = useCallback(
    (signal) => recruiterApi.companies(signal),
    [],
  )

  const resource = useRecruiterResource(loader)

  if (resource.loading) {
    return <PageLoader label="Checking company account" />
  }

  if (resource.error) {
    return (
      <ErrorState
        message={getApiErrorMessage(resource.error)}
        onRetry={resource.reload}
      />
    )
  }

  const existingCompany =
    createdCompany || resource.data?.[0] || null

  if (existingCompany) {
    return (
      <CompanyCreatedState company={existingCompany} />
    )
  }

  const submit = async (values) => {
    setSaving(true)

    try {
      const company = await recruiterApi.createCompany(
        compactPayload(values),
      )

      setCreatedCompany(company)

      toast.success('Company created')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-brand-700">
          Company onboarding
        </p>

        <h1 className="text-3xl font-bold">
          Create your company profile
        </h1>

        <p className="mt-2 text-slate-600">
          Your company begins in Draft status. Add its required details and
          logo before verification.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <CompanyForm
          schema={companyCreateSchema}
          saving={saving}
          onSubmit={submit}
        />
      </section>
    </div>
  )
}

export default CompanyCreatePage