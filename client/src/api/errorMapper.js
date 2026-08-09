const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.'

export function mapApiError(error) {
  const responseData = error?.response?.data
  const isNetworkError = !error?.response

  const apiError = {
    status: error?.response?.status ?? null,
    message:
      responseData?.message ??
      (isNetworkError
        ? 'Unable to connect to the server. Please check your connection.'
        : DEFAULT_ERROR_MESSAGE),
    code:
      responseData?.code ??
      (isNetworkError ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR'),
    errors: Array.isArray(responseData?.errors) ? responseData.errors : [],
    requestId: responseData?.requestId ?? null,
    isNetworkError,
  }

  if (error && typeof error === 'object') {
    error.apiError = apiError
  }

  return error
}

export function getApiErrorMessage(
  error,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
) {
  return (
    error?.apiError?.message ??
    error?.response?.data?.message ??
    error?.message ??
    fallbackMessage
  )
}