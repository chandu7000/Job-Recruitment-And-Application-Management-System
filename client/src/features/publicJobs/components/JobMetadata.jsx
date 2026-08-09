import { BriefcaseBusiness, Clock3, IndianRupee, MapPin } from 'lucide-react'
import { EMPLOYMENT_TYPES, WORK_MODES } from '../constants/publicJobConstants'
import { formatExperienceRange, formatSalaryRange, labelFromOptions } from '../utils/jobFormatters'

function MetadataItem({ icon: Icon, children }) {
  return <li className="flex items-center gap-1.5"><Icon aria-hidden="true" className="size-4 text-slate-400" /><span>{children}</span></li>
}

function JobMetadata({ job, compact = false }) {
  return (
    <ul className={`grid gap-2 text-sm text-slate-600 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
      <MetadataItem icon={MapPin}>{job.location || labelFromOptions(WORK_MODES, job.workMode)}</MetadataItem>
      <MetadataItem icon={BriefcaseBusiness}>{labelFromOptions(EMPLOYMENT_TYPES, job.employmentType)}</MetadataItem>
      <MetadataItem icon={Clock3}>{formatExperienceRange(job)}</MetadataItem>
      <MetadataItem icon={IndianRupee}>{formatSalaryRange(job)}</MetadataItem>
    </ul>
  )
}

export default JobMetadata
