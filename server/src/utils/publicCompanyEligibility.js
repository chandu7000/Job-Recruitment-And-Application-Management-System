import AppError from "./AppError.js";

import {
  COMPANY_STATUSES
} from "../constants/company.constants.js";

const PUBLIC_COMPANY_ELIGIBILITY_ERROR_CODES =
  Object.freeze({
    COMPANY_REQUIRED:
      "COMPANY_REQUIRED",

    COMPANY_NOT_VERIFIED:
      "COMPANY_NOT_VERIFIED",

    COMPANY_DELETED:
      "COMPANY_DELETED"
  });

const getCompanyValue = (
  company,
  field
) => {
  if (
    company &&
    typeof company.get ===
      "function"
  ) {
    return company.get(
      field
    );
  }

  return company?.[field];
};

const collectPublicCompanyEligibilityIssues =
  (
    company
  ) => {
    const issues = [];

    if (!company) {
      issues.push({
        field:
          "company",

        code:
          PUBLIC_COMPANY_ELIGIBILITY_ERROR_CODES
            .COMPANY_REQUIRED,

        message:
          "Company is required for public eligibility validation.",

        value:
          null
      });

      return issues;
    }

    const status =
      getCompanyValue(
        company,
        "status"
      );

    if (
      status !==
      COMPANY_STATUSES.VERIFIED
    ) {
      issues.push({
        field:
          "status",

        code:
          PUBLIC_COMPANY_ELIGIBILITY_ERROR_CODES
            .COMPANY_NOT_VERIFIED,

        message:
          "Only verified companies are publicly available.",

        value:
          status ?? null,

        requiredValue:
          COMPANY_STATUSES.VERIFIED
      });
    }

    const deletedAt =
      getCompanyValue(
        company,
        "deletedAt"
      );

    if (deletedAt) {
      issues.push({
        field:
          "deletedAt",

        code:
          PUBLIC_COMPANY_ELIGIBILITY_ERROR_CODES
            .COMPANY_DELETED,

        message:
          "Deleted companies are not publicly available.",

        value:
          deletedAt
      });
    }

    return issues;
  };

const isPublicCompanyEligible =
  (
    company
  ) => {
    return (
      collectPublicCompanyEligibilityIssues(
        company
      ).length === 0
    );
  };

const validatePublicCompanyEligibility =
  (
    company
  ) => {
    const issues =
      collectPublicCompanyEligibilityIssues(
        company
      );

    if (
      issues.length > 0
    ) {
      throw new AppError(
        "Public company not found.",
        404,
        "PUBLIC_COMPANY_NOT_FOUND"
      );
    }

    return true;
  };

export {
  PUBLIC_COMPANY_ELIGIBILITY_ERROR_CODES,
  getCompanyValue,
  collectPublicCompanyEligibilityIssues,
  isPublicCompanyEligible,
  validatePublicCompanyEligibility
};