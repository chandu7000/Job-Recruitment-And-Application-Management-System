import AppError from "./AppError.js";

import {
  COMPANY_STATUSES
} from "../constants/company.constants.js";

const COMPANY_STATUS_TRANSITIONS =
  Object.freeze({
    [COMPANY_STATUSES.DRAFT]: [
      COMPANY_STATUSES
        .PENDING_VERIFICATION
    ],

    [COMPANY_STATUSES
      .PENDING_VERIFICATION]: [
      COMPANY_STATUSES.VERIFIED,
      COMPANY_STATUSES.REJECTED
    ],

    [COMPANY_STATUSES.VERIFIED]: [],

    [COMPANY_STATUSES.REJECTED]: [
      COMPANY_STATUSES.RESUBMITTED
    ],

    [COMPANY_STATUSES.RESUBMITTED]: [
      COMPANY_STATUSES
        .PENDING_VERIFICATION
    ]
  });

const isValidCompanyStatus = (
  status
) => {
  return Object.prototype.hasOwnProperty.call(
    COMPANY_STATUS_TRANSITIONS,
    status
  );
};

const canChangeCompanyStatus = (
  currentStatus,
  nextStatus
) => {
  if (
    !isValidCompanyStatus(
      currentStatus
    )
  ) {
    throw new AppError(
      `Invalid current company status: ${currentStatus}.`,
      400,
      "INVALID_COMPANY_STATUS"
    );
  }

  if (
    !isValidCompanyStatus(
      nextStatus
    )
  ) {
    throw new AppError(
      `Invalid next company status: ${nextStatus}.`,
      400,
      "INVALID_COMPANY_STATUS"
    );
  }

  const allowedNextStatuses =
    COMPANY_STATUS_TRANSITIONS[
      currentStatus
    ];

  return allowedNextStatuses.includes(
    nextStatus
  );
};

const validateCompanyStatusTransition = (
  currentStatus,
  nextStatus
) => {
  const isAllowed =
    canChangeCompanyStatus(
      currentStatus,
      nextStatus
    );

  if (!isAllowed) {
    throw new AppError(
      `Company status cannot change from ${currentStatus} to ${nextStatus}.`,
      409,
      "INVALID_COMPANY_STATUS_TRANSITION"
    );
  }

  return true;
};

export {
  COMPANY_STATUS_TRANSITIONS,
  isValidCompanyStatus,
  canChangeCompanyStatus,
  validateCompanyStatusTransition
};