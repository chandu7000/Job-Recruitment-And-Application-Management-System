import AppError from "./AppError.js";

import {
  JOB_STATUSES
} from "../constants/job.constants.js";

import {
  COMPANY_STATUSES
} from "../constants/company.constants.js";

const PUBLIC_JOB_ELIGIBILITY_ERROR_CODES =
  Object.freeze({
    JOB_REQUIRED:
      "JOB_REQUIRED",

    JOB_NOT_PUBLISHED:
      "JOB_NOT_PUBLISHED",

    JOB_DELETED:
      "JOB_DELETED",

    JOB_APPLICATION_DEADLINE_MISSING:
      "JOB_APPLICATION_DEADLINE_MISSING",

    JOB_APPLICATION_DEADLINE_INVALID:
      "JOB_APPLICATION_DEADLINE_INVALID",

    JOB_APPLICATION_DEADLINE_EXPIRED:
      "JOB_APPLICATION_DEADLINE_EXPIRED",

    COMPANY_REQUIRED:
      "COMPANY_REQUIRED",

    COMPANY_NOT_VERIFIED:
      "COMPANY_NOT_VERIFIED",

    COMPANY_DELETED:
      "COMPANY_DELETED"
  });

const getEntityValue = (
  entity,
  field
) => {
  if (
    entity &&
    typeof entity.get ===
      "function"
  ) {
    return entity.get(field);
  }

  return entity?.[field];
};

const parsePublicJobDeadline = (
  deadline
) => {
  if (
    deadline instanceof Date
  ) {
    return deadline;
  }

  return new Date(deadline);
};

const collectPublicJobEligibilityIssues =
  (
    job,
    company,
    {
      now = new Date()
    } = {}
  ) => {
    const issues = [];

    if (!job) {
      issues.push({
        field: "job",

        code:
          PUBLIC_JOB_ELIGIBILITY_ERROR_CODES
            .JOB_REQUIRED,

        message:
          "Job is required for public eligibility validation.",

        value: null
      });

      return issues;
    }

    const status =
      getEntityValue(
        job,
        "status"
      );

    if (
      status !==
      JOB_STATUSES.PUBLISHED
    ) {
      issues.push({
        field: "status",

        code:
          PUBLIC_JOB_ELIGIBILITY_ERROR_CODES
            .JOB_NOT_PUBLISHED,

        message:
          "Only published jobs are publicly available.",

        value:
          status ?? null,

        requiredValue:
          JOB_STATUSES.PUBLISHED
      });
    }

    const deletedAt =
      getEntityValue(
        job,
        "deletedAt"
      );

    if (deletedAt) {
      issues.push({
        field: "deletedAt",

        code:
          PUBLIC_JOB_ELIGIBILITY_ERROR_CODES
            .JOB_DELETED,

        message:
          "Deleted jobs are not publicly available.",

        value: deletedAt
      });
    }

    const applicationDeadline =
      getEntityValue(
        job,
        "applicationDeadline"
      );

    if (
      applicationDeadline ===
        null ||
      applicationDeadline ===
        undefined
    ) {
      issues.push({
        field:
          "applicationDeadline",

        code:
          PUBLIC_JOB_ELIGIBILITY_ERROR_CODES
            .JOB_APPLICATION_DEADLINE_MISSING,

        message:
          "A public job must have an application deadline.",

        value: null
      });
    } else {
      const parsedDeadline =
        parsePublicJobDeadline(
          applicationDeadline
        );

      if (
        Number.isNaN(
          parsedDeadline.getTime()
        )
      ) {
        issues.push({
          field:
            "applicationDeadline",

          code:
            PUBLIC_JOB_ELIGIBILITY_ERROR_CODES
              .JOB_APPLICATION_DEADLINE_INVALID,

          message:
            "The job application deadline is invalid.",

          value:
            applicationDeadline
        });
      } else if (
        parsedDeadline.getTime() <
        now.getTime()
      ) {
        issues.push({
          field:
            "applicationDeadline",

          code:
            PUBLIC_JOB_ELIGIBILITY_ERROR_CODES
              .JOB_APPLICATION_DEADLINE_EXPIRED,

          message:
            "The job application deadline has expired.",

          value:
            parsedDeadline,

          currentTime:
            now
        });
      }
    }

    if (!company) {
      issues.push({
        field: "company",

        code:
          PUBLIC_JOB_ELIGIBILITY_ERROR_CODES
            .COMPANY_REQUIRED,

        message:
          "The job must belong to an available company.",

        value: null
      });

      return issues;
    }

    const companyStatus =
      getEntityValue(
        company,
        "status"
      );

    if (
      companyStatus !==
      COMPANY_STATUSES.VERIFIED
    ) {
      issues.push({
        field:
          "company.status",

        code:
          PUBLIC_JOB_ELIGIBILITY_ERROR_CODES
            .COMPANY_NOT_VERIFIED,

        message:
          "The job company is not publicly available.",

        value:
          companyStatus ?? null,

        requiredValue:
          COMPANY_STATUSES.VERIFIED
      });
    }

    const companyDeletedAt =
      getEntityValue(
        company,
        "deletedAt"
      );

    if (companyDeletedAt) {
      issues.push({
        field:
          "company.deletedAt",

        code:
          PUBLIC_JOB_ELIGIBILITY_ERROR_CODES
            .COMPANY_DELETED,

        message:
          "The job company is not publicly available.",

        value:
          companyDeletedAt
      });
    }

    return issues;
  };

const isPublicJobEligible = (
  job,
  company,
  options = {}
) => {
  return (
    collectPublicJobEligibilityIssues(
      job,
      company,
      options
    ).length === 0
  );
};

const validatePublicJobEligibility =
  (
    job,
    company,
    options = {}
  ) => {
    const issues =
      collectPublicJobEligibilityIssues(
        job,
        company,
        options
      );

    if (issues.length > 0) {
      throw new AppError(
        "Public job not found.",
        404,
        "PUBLIC_JOB_NOT_FOUND"
      );
    }

    return true;
  };

export {
  PUBLIC_JOB_ELIGIBILITY_ERROR_CODES,
  getEntityValue,
  parsePublicJobDeadline,
  collectPublicJobEligibilityIssues,
  isPublicJobEligible,
  validatePublicJobEligibility
};