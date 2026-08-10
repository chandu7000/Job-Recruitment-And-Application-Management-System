import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { recruiterJobApi } from '../services/recruiterJobApi'

export function useRecruiterJobs(query) {
  const [state, setState] = useState({
    jobs: [],
    pagination: {},
    error: '',
    resolvedRequestKey: '',
  })

  const [requestKey, setRequestKey] = useState(0)
  const requestRef = useRef(0)

  const retry = useCallback(() => {
    setRequestKey((key) => key + 1)
  }, [])

  const activeRequestKey = JSON.stringify([query, requestKey])
  const loading = state.resolvedRequestKey !== activeRequestKey

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestRef.current

    recruiterJobApi
      .list(query, { signal: controller.signal })
      .then((result) => {
        if (requestId !== requestRef.current) return

        setState({
          ...result,
          error: '',
          resolvedRequestKey: activeRequestKey,
        })
      })
      .catch((error) => {
        if (axios.isCancel(error) || requestId !== requestRef.current) return

        setState({
          jobs: [],
          pagination: {},
          error: getApiErrorMessage(error),
          resolvedRequestKey: activeRequestKey,
        })
      })

    return () => controller.abort()
  }, [query, requestKey, activeRequestKey])

  return {
    jobs: state.jobs,
    pagination: state.pagination,
    loading,
    error: loading ? '' : state.error,
    retry,
  }
}