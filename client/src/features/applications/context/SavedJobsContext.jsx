import axios from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../auth/hooks/useAuth'
import { savedJobsApi } from '../services/applicationApi'
import { SavedJobsContext } from './SavedJobsContextDefinition'

export function SavedJobsProvider({ children }) {
  const { isAuthenticated, role } = useAuth()
  const [savedIds, setSavedIds] = useState(() => new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [pendingIds, setPendingIds] = useState(() => new Set())

  const refresh = useCallback(async (signal) => {
    if (!isAuthenticated || role !== 'JOB_SEEKER') {
      setSavedIds(new Set())
      return
    }
    setIsLoading(true)
    try {
      const first = await savedJobsApi.list({ page: 1, limit: 100 }, { signal })
      let items = [...first.savedJobs]
      const totalPages = Number(first.pagination?.totalPages || 1)
      for (let page = 2; page <= totalPages; page += 1) {
        const next = await savedJobsApi.list({ page, limit: 100 }, { signal })
        items = items.concat(next.savedJobs)
      }
      setSavedIds(new Set(items.map((item) => item?.jobId ?? item?.job?.id).filter(Boolean)))
    } catch (error) {
      if (!axios.isCancel(error)) setSavedIds(new Set())
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, role])

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      void refresh(controller.signal)
    }, 0)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [refresh])

  const mutate = useCallback(async (jobId, shouldSave) => {
    if (!jobId || pendingIds.has(jobId)) return false
    setPendingIds((current) => new Set(current).add(jobId))
    try {
      if (shouldSave) {
        await savedJobsApi.save(jobId)
        setSavedIds((current) => new Set(current).add(jobId))
        toast.success('Job saved successfully.')
      } else {
        await savedJobsApi.remove(jobId)
        setSavedIds((current) => {
          const next = new Set(current)
          next.delete(jobId)
          return next
        })
        toast.success('Saved job removed.')
      }
      return true
    } catch (error) {
      const code = error?.apiError?.code ?? error?.response?.data?.code
      if (shouldSave && code === 'JOB_ALREADY_SAVED') {
        setSavedIds((current) => new Set(current).add(jobId))
        toast.info('This job is already saved.')
      } else if (!shouldSave && code === 'SAVED_JOB_NOT_FOUND') {
        setSavedIds((current) => {
          const next = new Set(current)
          next.delete(jobId)
          return next
        })
        toast.info('This job is no longer in your saved jobs.')
      } else {
        toast.error(error?.apiError?.message ?? error?.response?.data?.message ?? 'Unable to update saved job.')
      }
      return false
    } finally {
      setPendingIds((current) => {
        const next = new Set(current)
        next.delete(jobId)
        return next
      })
    }
  }, [pendingIds])

  const value = useMemo(() => ({
    isLoading,
    isSaved: (jobId) => savedIds.has(jobId),
    isPending: (jobId) => pendingIds.has(jobId),
    save: (jobId) => mutate(jobId, true),
    remove: (jobId) => mutate(jobId, false),
    refresh,
  }), [isLoading, mutate, pendingIds, refresh, savedIds])

  return <SavedJobsContext.Provider value={value}>{children}</SavedJobsContext.Provider>
}
