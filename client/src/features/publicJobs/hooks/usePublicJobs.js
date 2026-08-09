import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { publicJobApi } from '../services/publicJobApi'

export function usePublicJobs(query, service = publicJobApi.list) {
  const [state, setState] = useState({ jobs: [], pagination: {}, requestId: '', error: '' })
  const [requestKey, setRequestKey] = useState(0)
  const retry = useCallback(() => setRequestKey((key) => key + 1), [])
  const requestId = `${JSON.stringify(query)}:${requestKey}`

  useEffect(() => {
    const controller = new AbortController()
    service(query, { signal: controller.signal })
      .then((result) => setState({ ...result, requestId, error: '' }))
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setState({ jobs: [], pagination: {}, requestId, error: getApiErrorMessage(error) })
        }
      })

    return () => controller.abort()
  }, [query, requestId, service])

  return { ...state, loading: state.requestId !== requestId, retry }
}
