import {
  createCompanyVerificationHistory,
  findCompanyVerificationHistory,
  findLatestCompanyVerificationHistory
} from "../repositories/companyVerificationHistory.repository.js";

import AppError from "../utils/AppError.js";

const recordCompanyVerificationTransition =
  async ({
    companyId,
    oldStatus,
    newStatus,
    reason = null,
    performedBy,
    transaction
  }) => {
    if (!performedBy) {
      throw new AppError(
        "The user performing the company status change is required.",
        400,
        "COMPANY_STATUS_PERFORMER_REQUIRED"
      );
    }

    return createCompanyVerificationHistory(
      {
        companyId,
        oldStatus,
        newStatus,

        reason:
          reason?.trim() || null,

        performedBy
      },
      {
        transaction
      }
    );
  };

const getCompanyVerificationHistory =
  async ({
    companyId
  }) => {
    return findCompanyVerificationHistory(
      companyId
    );
  };

const getLatestCompanyVerificationHistory =
  async ({
    companyId
  }) => {
    return findLatestCompanyVerificationHistory(
      companyId
    );
  };

export {
  recordCompanyVerificationTransition,
  getCompanyVerificationHistory,
  getLatestCompanyVerificationHistory
};