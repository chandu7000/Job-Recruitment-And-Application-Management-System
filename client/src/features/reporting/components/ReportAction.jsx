import { useContext, useState } from 'react'
import { Flag } from 'lucide-react'
import { AuthContext } from '../../auth/context/AuthContextDefinition'
import { REPORTER_ROLES } from '../constants/reportConstants'
import ReportModal from './ReportModal'

function ReportAction({ targetType, targetResourceId, targetLabel }) {
  const auth = useContext(AuthContext)
  const [open, setOpen] = useState(false)

  if (
    !auth?.isAuthenticated ||
    !REPORTER_ROLES.includes(auth.role) ||
    !targetResourceId
  ) {
    return null
  }

  const targetName = targetType === 'COMPANY' ? 'company' : 'job'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 font-semibold text-red-700 hover:underline"
      >
        <Flag aria-hidden="true" className="size-4" />
        Report {targetName}
      </button>
      <ReportModal
        isOpen={open}
        targetType={targetType}
        targetResourceId={targetResourceId}
        targetLabel={targetLabel}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

export default ReportAction
