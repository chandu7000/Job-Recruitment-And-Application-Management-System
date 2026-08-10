import { useContext } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import AppButton from '../../../components/common/AppButton'
import { AuthContext } from '../../auth/context/AuthContextDefinition'
import { SavedJobsContext } from '../context/SavedJobsContextDefinition'

function SaveJobButton({ jobId, compact = false }) {
  const auth = useContext(AuthContext)
  const savedJobs = useContext(SavedJobsContext)
  if (!auth?.isAuthenticated || auth.role !== 'JOB_SEEKER' || !jobId || !savedJobs) return null
  const saved = savedJobs.isSaved(jobId)
  return (
    <AppButton
      variant="secondary"
      size={compact ? 'small' : 'medium'}
      loading={savedJobs.isPending(jobId)}
      aria-pressed={saved}
      onClick={() => (saved ? savedJobs.remove(jobId) : savedJobs.save(jobId))}
    >
      {saved ? <BookmarkCheck aria-hidden="true" className="size-4" /> : <Bookmark aria-hidden="true" className="size-4" />}
      {saved ? 'Saved' : 'Save job'}
    </AppButton>
  )
}

export default SaveJobButton
