import { BriefcaseBusiness, UserRoundSearch } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthFormHeader from '../components/AuthFormHeader'

const choices = [
  { to: '/register/job-seeker', title: 'I am looking for work', description: 'Create a job-seeker account.', icon: UserRoundSearch },
  { to: '/register/recruiter', title: 'I am hiring', description: 'Create a recruiter account.', icon: BriefcaseBusiness },
]

function RegistrationChoicePage() {
  return (
    <>
      <AuthFormHeader title="Create your account" description="Choose how you want to use CareerForge." />
      <div className="space-y-3">
        {choices.map(({ to, title, description, icon: Icon }) => (
          <Link key={to} to={to} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:bg-brand-50">
            <span className="rounded-lg bg-brand-100 p-3 text-brand-700"><Icon className="size-6" aria-hidden="true" /></span>
            <span><span className="block font-semibold text-slate-950">{title}</span><span className="mt-1 block text-sm text-slate-600">{description}</span></span>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-slate-600">Already registered? <Link className="font-semibold text-brand-700 hover:underline" to="/login">Log in</Link></p>
    </>
  )
}

export default RegistrationChoicePage
