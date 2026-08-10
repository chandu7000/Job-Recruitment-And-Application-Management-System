import { useContext } from 'react'
import { SavedJobsContext } from '../context/SavedJobsContextDefinition'

export function useSavedJobs() {
  const context = useContext(SavedJobsContext)
  if (!context) throw new Error('useSavedJobs must be used within SavedJobsProvider.')
  return context
}
