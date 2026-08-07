import AppError from "./AppError.js";

import validateCompanyJobEligibility from
  "./companyJobEligibility.js";

import {
  JOB_STATUSES,
  JOB_WORK_MODES
} from "../constants/job.constants.js";

const PUBLICATION_REQUIRED_FIELDS =
  Object.freeze([
    "companyId",
    "title",
    "description",
    "requirements",
    "workMode",
    "employmentType",
    "experienceLevel",
    "vacancies",
    "applicationDeadline"
  ]);

const getEntityValue = (
  entity,
  field
) => {
  if (
    entity &&
    typeof entity.get === "function"
  ) {
    return entity.get(field);
  }

  return entity?.[field];
};

const isMissingText = (
  value
) => {
  return (
    typeof value !== "string" ||
    value.trim().length === 0
  );
};

const addIssue = (
  issues,
  field,
  message,
  value
) => {
  issues.push({
    field,
    message,
    value:
      value ?? null
  });
};

const validateRequiredFields = (
  job,
  issues
) => {
  for (
    const field of
    PUBLICATION_REQUIRED_FIELDS
  ) {
    const value =
      getEntityValue(
        job,
        field
      );

    if (
      field === "vacancies" ||
      field ===
        "applicationDeadline"
    ) {
      if (
        value === null ||
        value === undefined
      ) {
        addIssue(
          issues,
          field,
          `${field} is required before publication.`,
          value
        );
      }

      continue;
    }

    if (
      isMissingText(
        value
      )
    ) {
      addIssue(
        issues,
        field,
        `${field} is required before publication.`,
        value
      );
    }
  }
};

const validateJobLocation = (
  job,
  issues
) => {
  const workMode =
    getEntityValue(
      job,
      "workMode"
    );

  const location =
    getEntityValue(
      job,
      "location"
    );

  if (
    workMode !==
      JOB_WORK_MODES.REMOTE &&
    isMissingText(
      location
    )
  ) {
    addIssue(
      issues,
      "location",
      "Job location is required unless the work mode is REMOTE.",
      location
    );
  }
};

const validateVacancies = (
  job,
  issues
) => {
  const vacancies =
    getEntityValue(
      job,
      "vacancies"
    );

  if (
    vacancies === null ||
    vacancies === undefined
  ) {
    return;
  }

  const numericVacancies =
    Number(
      vacancies
    );

  if (
    !Number.isInteger(
      numericVacancies
    ) ||
    numericVacancies < 1
  ) {
    addIssue(
      issues,
      "vacancies",
      "Vacancies must be a positive integer.",
      vacancies
    );
  }
};

const validateDeadline = (
  job,
  issues,
  now
) => {
  const deadline =
    getEntityValue(
      job,
      "applicationDeadline"
    );

  if (
    deadline === null ||
    deadline === undefined
  ) {
    return;
  }

  const parsedDeadline =
    deadline instanceof Date
      ? deadline
      : new Date(
        deadline
      );

  if (
    Number.isNaN(
      parsedDeadline.getTime()
    )
  ) {
    addIssue(
      issues,
      "applicationDeadline",
      "Application deadline must be a valid date.",
      deadline
    );

    return;
  }

  if (
    parsedDeadline.getTime() <=
    now.getTime()
  ) {
    addIssue(
      issues,
      "applicationDeadline",
      "Application deadline must be in the future.",
      parsedDeadline
    );
  }
};

const validateOptionalRange = ({
  job,
  issues,
  minimumField,
  maximumField,
  label
}) => {
  const minimumValue =
    getEntityValue(
      job,
      minimumField
    );

  const maximumValue =
    getEntityValue(
      job,
      maximumField
    );

  const hasMinimum =
    minimumValue !== null &&
    minimumValue !== undefined;

  const hasMaximum =
    maximumValue !== null &&
    maximumValue !== undefined;

  if (
    !hasMinimum &&
    !hasMaximum
  ) {
    return;
  }

  if (
    hasMinimum !== hasMaximum
  ) {
    addIssue(
      issues,
      hasMinimum
        ? maximumField
        : minimumField,
      `Both minimum and maximum ${label} values are required when specifying a ${label} range.`,
      hasMinimum
        ? maximumValue
        : minimumValue
    );

    return;
  }

  const numericMinimum =
    Number(
      minimumValue
    );

  const numericMaximum =
    Number(
      maximumValue
    );

  if (
    !Number.isFinite(
      numericMinimum
    ) ||
    !Number.isFinite(
      numericMaximum
    ) ||
    numericMinimum < 0 ||
    numericMaximum < 0
  ) {
    addIssue(
      issues,
      minimumField,
      `${label} values must be non-negative numbers.`,
      {
        minimum:
          minimumValue,
        maximum:
          maximumValue
      }
    );

    return;
  }

  if (
    numericMinimum >
    numericMaximum
  ) {
    addIssue(
      issues,
      minimumField,
      `Minimum ${label} cannot exceed maximum ${label}.`,
      {
        minimum:
          minimumValue,
        maximum:
          maximumValue
      }
    );
  }
};

const collectJobPublicationIssues = (
  job,
  {
    now = new Date()
  } = {}
) => {
  const issues = [];

  if (!job) {
    addIssue(
      issues,
      "job",
      "Job is required for publication validation.",
      null
    );

    return issues;
  }

  const status =
    getEntityValue(
      job,
      "status"
    );

  if (
    status !==
    JOB_STATUSES.DRAFT
  ) {
    addIssue(
      issues,
      "status",
      "Only a DRAFT job can be published.",
      status
    );
  }

  validateRequiredFields(
    job,
    issues
  );

  validateJobLocation(
    job,
    issues
  );

  validateVacancies(
    job,
    issues
  );

  validateDeadline(
    job,
    issues,
    now
  );

  validateOptionalRange({
    job,
    issues,
    minimumField:
      "minimumSalary",
    maximumField:
      "maximumSalary",
    label:
      "salary"
  });

  validateOptionalRange({
    job,
    issues,
    minimumField:
      "minimumExperience",
    maximumField:
      "maximumExperience",
    label:
      "experience"
  });

  return issues;
};

const validateJobPublicationEligibility =
  (
    job,
    company,
    options = {}
  ) => {
    /*
     * Reuse the existing company verification rule.
     * This throws COMPANY_NOT_VERIFIED when the
     * company is not VERIFIED.
     */
    validateCompanyJobEligibility(
      company
    );

    const issues =
      collectJobPublicationIssues(
        job,
        options
      );

    if (
      issues.length > 0
    ) {
      throw new AppError(
        "Job is not ready for publication.",
        409,
        "JOB_NOT_READY_FOR_PUBLICATION",
        issues
      );
    }

    return true;
  };

export {
  PUBLICATION_REQUIRED_FIELDS,
  collectJobPublicationIssues,
  validateJobPublicationEligibility
};