import { getApiErrorMessage } from '../../../api/errorMapper'

const messages = Object.freeze({
  NOTIFICATION_NOT_FOUND: 'This notification is no longer available.',
  INVALID_NOTIFICATION_TYPE: 'The selected notification type is not supported.',
  RATE_LIMIT_EXCEEDED: 'Too many requests were made. Please try again shortly.',
})

export function getNotificationErrorMessage(error) {
  const code = error?.apiError?.code ?? error?.response?.data?.code
  return messages[code] || getApiErrorMessage(error)
}
