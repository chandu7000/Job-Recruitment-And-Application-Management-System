import AppError from "./AppError.js";

import validateCompanyJobEligibility from
  "./companyJobEligibility.js";

import {
  JOB_STATUSES
} from "../constants/job.constants.js";

const APPLICATION_ELIGIBILITY_ERROR_CODES =
  Object.freeze({
    JOB_REQUIRED:
      "JOB_REQUIRED",

    JOB_NOT_PUBLISHED:
      "JOB_NOT_PUBLISHED",

    JOB_APPLICATION_DEADLINE_MISSING:
      "JOB_APPLICATION_DEADLINE_MISSING",

    JOB_APPLICATION_DEADLINE_INVALID:
      "JOB_APPLICATION_DEADLINE_INVALID",

    JOB_APPLICATION_DEADLINE_EXPIRED:
      "JOB_APPLICATION_DEADLINE_EXPIRED"
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
    return entity.get(
      field
    );
  }

  return entity?.[field];
};

const parseApplicationDeadline = (
  value
) => {
  if (
    value instanceof Date
  ) {
    return value;
  }

  return new Date(
    value
  );
};

const isJobExpired = (
  job,
  {
    now = new Date()
  } = {}
) => {
  if (!job) {
    return false;
  }

  const deadline =
    getEntityValue(
      job,
      "applicationDeadline"
    );

  if (
    deadline === null ||
    deadline === undefined
  ) {
    return false;
  }

  const parsedDeadline =
    parseApplicationDeadline(
      deadline
    );

  if (
    Number.isNaN(
      parsedDeadline.getTime()
    )
  ) {
    return false;
  }

  return (
    parsedDeadline.getTime() <
    now.getTime()
  );
};

const collectJobApplicationIssues = (
  job,
  company,
  {
    now = new Date()
  } = {}
) => {
  const issues = [];

  if (!job) {
    issues.push({
      field:
        "job",

      code:
        APPLICATION_ELIGIBILITY_ERROR_CODES
          .JOB_REQUIRED,

      message:
        "Job is required for application eligibility validation.",

      value:
        null
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
      field:
        "status",

      code:
        APPLICATION_ELIGIBILITY_ERROR_CODES
          .JOB_NOT_PUBLISHED,

      message:
        "Applications are accepted only for published jobs.",

      value:
        status ?? null,

      requiredValue:
        JOB_STATUSES.PUBLISHED
    });
  }

  const deadline =
    getEntityValue(
      job,
      "applicationDeadline"
    );

  if (
    deadline === null ||
    deadline === undefined
  ) {
    issues.push({
      field:
        "applicationDeadline",

      code:
        APPLICATION_ELIGIBILITY_ERROR_CODES
          .JOB_APPLICATION_DEADLINE_MISSING,

      message:
        "Application deadline is required.",

      value:
        null
    });
  } else {
    const parsedDeadline =
      parseApplicationDeadline(
        deadline
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
          APPLICATION_ELIGIBILITY_ERROR_CODES
            .JOB_APPLICATION_DEADLINE_INVALID,

        message:
          "Application deadline is invalid.",

        value:
          deadline
      });
    } else if (
      parsedDeadline.getTime() <
      now.getTime()
    ) {
      issues.push({
        field:
          "applicationDeadline",

        code:
          APPLICATION_ELIGIBILITY_ERROR_CODES
            .JOB_APPLICATION_DEADLINE_EXPIRED,

        message:
          "The application deadline has expired.",

        value:
          parsedDeadline,

        currentTime:
          now
      });
    }
  }

  if (company) {
    try {
      validateCompanyJobEligibility(
        company
      );
    } catch (error) {
      issues.push({
        field:
          "company",

        code:
          error.code ??
          "COMPANY_NOT_ELIGIBLE",

        message:
          error.message,

        value:
          getEntityValue(
            company,
            "status"
          ) ?? null
      });
    }
  }

  return issues;
};

const validateJobApplicationEligibility =
  (
    job,
    company,
    options = {}
  ) => {
    if (!company) {
      throw new AppError(
        "Company not found.",
        404,
        "COMPANY_NOT_FOUND"
      );
    }

    const issues =
      collectJobApplicationIssues(
        job,
        company,
        options
      );

    if (
      issues.length > 0
    ) {
      throw new AppError(
        "Job is not accepting applications.",
        409,
        "JOB_APPLICATION_NOT_ALLOWED",
        issues
      );
    }

    return true;
  };

export {
  APPLICATION_ELIGIBILITY_ERROR_CODES,
  getEntityValue,
  parseApplicationDeadline,
  isJobExpired,
  collectJobApplicationIssues,
  validateJobApplicationEligibility
};