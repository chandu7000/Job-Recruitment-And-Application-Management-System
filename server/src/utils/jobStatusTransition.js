import AppError from "./AppError.js";

import {
  JOB_STATUSES,
  JOB_STATUS_VALUES,
  JOB_STATUS_ERROR_CODES,
  RECRUITER_JOB_STATUS_TRANSITIONS,
  MODERATION_JOB_STATUS_TRANSITIONS
} from "../constants/job.constants.js";

const isValidJobStatus = (status) => {
  return (
    typeof status === "string" &&
    JOB_STATUS_VALUES.includes(status)
  );
};

const validateJobStatus = (
  status,
  fieldName = "status"
) => {
  if (!isValidJobStatus(status)) {
    throw new AppError(
      `Invalid job ${fieldName}.`,
      400,
      JOB_STATUS_ERROR_CODES.INVALID_STATUS,
      [
        {
          field: fieldName,
          value: status,
          allowedValues:
            JOB_STATUS_VALUES
        }
      ]
    );
  }

  return true;
};

const getAllowedJobTransitions = (
  currentStatus,
  {
    allowModeration = false
  } = {}
) => {
  validateJobStatus(
    currentStatus,
    "currentStatus"
  );

  const recruiterTransitions =
    RECRUITER_JOB_STATUS_TRANSITIONS[
      currentStatus
    ] ?? [];

  if (!allowModeration) {
    return [...recruiterTransitions];
  }

  const moderationTransitions =
    MODERATION_JOB_STATUS_TRANSITIONS[
      currentStatus
    ] ?? [];

  return [
    ...new Set([
      ...recruiterTransitions,
      ...moderationTransitions
    ])
  ];
};

const canTransitionJobStatus = (
  currentStatus,
  nextStatus,
  {
    allowModeration = false
  } = {}
) => {
  if (
    !isValidJobStatus(currentStatus) ||
    !isValidJobStatus(nextStatus)
  ) {
    return false;
  }

  if (currentStatus === nextStatus) {
    return false;
  }

  const allowedTransitions =
    getAllowedJobTransitions(
      currentStatus,
      {
        allowModeration
      }
    );

  return allowedTransitions.includes(
    nextStatus
  );
};

const validateJobStatusTransition = (
  currentStatus,
  nextStatus,
  {
    allowModeration = false
  } = {}
) => {
  validateJobStatus(
    currentStatus,
    "currentStatus"
  );

  validateJobStatus(
    nextStatus,
    "nextStatus"
  );

  if (
    !canTransitionJobStatus(
      currentStatus,
      nextStatus,
      {
        allowModeration
      }
    )
  ) {
    throw new AppError(
      `Job status cannot transition from ${currentStatus} to ${nextStatus}.`,
      409,
      JOB_STATUS_ERROR_CODES
        .INVALID_TRANSITION,
      [
        {
          currentStatus,
          requestedStatus:
            nextStatus,
          allowedTransitions:
            getAllowedJobTransitions(
              currentStatus,
              {
                allowModeration
              }
            )
        }
      ]
    );
  }

  return true;
};

const isTerminalJobStatus = (status) => {
  validateJobStatus(status);

  return (
    status === JOB_STATUSES.CLOSED ||
    status === JOB_STATUSES.REMOVED
  );
};

export {
  isValidJobStatus,
  validateJobStatus,
  getAllowedJobTransitions,
  canTransitionJobStatus,
  validateJobStatusTransition,
  isTerminalJobStatus
};