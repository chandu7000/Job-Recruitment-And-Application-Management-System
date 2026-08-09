import { useCallback, useEffect, useRef, useState } from 'react'

export function useJobSeekerResource(loader) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const requestRef = useRef(0)
  const load = useCallback(async () => {
    const requestId = ++requestRef.current
    const controller = new AbortController()
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const data = await loader(controller.signal)
      if (requestRef.current === requestId) setState({ data, loading: false, error: null })
    } catch (error) {
      if (error?.code !== 'ERR_CANCELED' && requestRef.current === requestId) setState({ data: null, loading: false, error })
    }
    return () => controller.abort()
  }, [loader])
  useEffect(() => {
    let cleanup
    const timer = window.setTimeout(() => { load().then((fn) => { cleanup = fn }) }, 0)
    return () => { window.clearTimeout(timer); cleanup?.() }
  }, [load])
  return { ...state, reload: load }
}
