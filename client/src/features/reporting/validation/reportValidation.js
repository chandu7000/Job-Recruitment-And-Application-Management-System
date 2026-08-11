import {
  REPORT_CATEGORY_VALUES,
  REPORT_DESCRIPTION_LIMITS,
  REPORT_TARGET_TYPES,
} from '../constants/reportConstants'

export function validateReport({ targetType, targetResourceId, category, description }) {
  const errors = {}
  const normalizedDescription = String(description ?? '').trim()

  if (!Object.values(REPORT_TARGET_TYPES).includes(targetType)) {
    errors.target = 'A valid report target is required.'
  }

  if (!targetResourceId) {
    errors.target = 'A valid report target is required.'
  }

  if (!REPORT_CATEGORY_VALUES.includes(category)) {
    errors.category = 'Select a reason for this report.'
  }

  if (!normalizedDescription) {
    errors.description = 'Describe why you are reporting this.'
  } else if (normalizedDescription.length < REPORT_DESCRIPTION_LIMITS.MIN) {
    errors.description = `Description must be at least ${REPORT_DESCRIPTION_LIMITS.MIN} characters.`
  } else if (normalizedDescription.length > REPORT_DESCRIPTION_LIMITS.MAX) {
    errors.description = `Description must be ${REPORT_DESCRIPTION_LIMITS.MAX} characters or fewer.`
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: {
      targetType,
      targetResourceId,
      category,
      description: normalizedDescription,
    },
  }
}
