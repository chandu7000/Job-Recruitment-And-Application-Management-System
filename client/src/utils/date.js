import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

function normalizeDate(value) {
  if (!value) {
    return null
  }

  const normalizedDate =
    value instanceof Date
      ? value
      : typeof value === 'string'
        ? parseISO(value)
        : new Date(value)

  return isValid(normalizedDate) ? normalizedDate : null
}

export function formatDate(value, fallback = '—') {
  const normalizedDate = normalizeDate(value)

  return normalizedDate ? format(normalizedDate, 'dd MMM yyyy') : fallback
}

export function formatDateTime(value, fallback = '—') {
  const normalizedDate = normalizeDate(value)

  return normalizedDate
    ? format(normalizedDate, 'dd MMM yyyy, hh:mm a')
    : fallback
}

export function formatRelativeDate(value, fallback = '—') {
  const normalizedDate = normalizeDate(value)

  return normalizedDate
    ? formatDistanceToNow(normalizedDate, { addSuffix: true })
    : fallback
}