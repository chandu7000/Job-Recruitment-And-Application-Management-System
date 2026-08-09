export function applyServerFieldErrors(error, setError) {
  const fieldErrors = error?.apiError?.errors ?? []

  fieldErrors.forEach(({ field, message }) => {
    if (field && message) {
      setError(field, { type: 'server', message })
    }
  })
}
