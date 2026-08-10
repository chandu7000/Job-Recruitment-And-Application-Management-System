import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Send } from 'lucide-react'
import { AuthContext } from '../../auth/context/AuthContextDefinition'

function ApplyJobLink({ job }) {
  const auth = useContext(AuthContext)
  if (!job?.id) return null
  if (!auth?.isAuthenticated) return <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Sign in to apply</Link>
  if (auth.role !== 'JOB_SEEKER') return null
  return <Link to={`/job-seeker/apply/${encodeURIComponent(job.id)}`} state={{ job }} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"><Send aria-hidden="true" className="size-4" />Apply now</Link>
}

export default ApplyJobLink
