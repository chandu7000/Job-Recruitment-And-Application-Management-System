import { useCallback, useEffect, useRef, useState } from 'react'

export function useRecruiterResource(loader) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const requestRef = useRef(0)
  const controllerRef = useRef(null)
  const load = useCallback(async () => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const requestId = ++requestRef.current
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const data = await loader(controller.signal)
      if (requestRef.current === requestId) setState({ data, loading: false, error: null })
    } catch (error) {
      if (error?.code !== 'ERR_CANCELED' && requestRef.current === requestId) setState({ data: null, loading: false, error })
    }
  }, [loader])
  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => { window.clearTimeout(timer); controllerRef.current?.abort() }
  }, [load])
  return { ...state, reload: load }
}
