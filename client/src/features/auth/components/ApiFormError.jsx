function ApiFormError({ error }) {
  if (!error) return null

  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <p className="font-medium">{error.message}</p>
      {error.requestId && <p className="mt-1 text-xs">Request ID: {error.requestId}</p>}
    </div>
  )
}

export default ApiFormError
