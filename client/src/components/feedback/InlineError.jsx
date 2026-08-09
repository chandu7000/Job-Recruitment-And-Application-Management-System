function InlineError({ id, message }) {
  if (!message) {
    return null
  }

  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-red-600">
      {message}
    </p>
  )
}

export default InlineError