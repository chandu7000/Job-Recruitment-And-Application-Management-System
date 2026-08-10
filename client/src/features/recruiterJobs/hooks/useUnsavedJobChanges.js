import { useCallback, useEffect } from 'react'

export function useUnsavedJobChanges(isDirty) {
  useEffect(() => {
    if (!isDirty) return undefined

    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  return useCallback(
    () =>
      !isDirty ||
      window.confirm('You have unsaved job changes. Leave this page anyway?'),
    [isDirty],
  )
}
