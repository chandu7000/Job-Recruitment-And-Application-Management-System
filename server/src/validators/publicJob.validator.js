import {
  query,
  param
} from "express-validator";

import {
  PUBLIC_JOB_SORT_VALUES
} from "../constants/publicJob.constants.js";

import {
  JOB_WORK_MODE_VALUES,
  JOB_EMPLOYMENT_TYPE_VALUES,
  JOB_EXPERIENCE_LEVEL_VALUES
} from "../constants/job.constants.js";

const PUBLIC_SIMILAR_JOB_DEFAULT_LIMIT =
  5;

const PUBLIC_SIMILAR_JOB_MAX_LIMIT =
  10;

const PUBLIC_JOB_SEARCH_MAX_LENGTH =
  200;

const PUBLIC_JOB_LOCATION_MAX_LENGTH =
  255;

const PUBLIC_JOB_SKILLS_MAX_LENGTH =
  1000;

const PUBLIC_JOB_SKILLS_MAX_COUNT =
  20;

const PUBLIC_JOB_SLUG_MAX_LENGTH =
  180;

const PUBLIC_JOB_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const validateSkills = (
  value
) => {
  const skills =
    value
      .split(",")
      .map((skill) =>
        skill.trim()
      )
      .filter(Boolean);

  if (skills.length === 0) {
    throw new Error(
      "At least one skill is required."
    );
  }

  if (
    skills.length >
    PUBLIC_JOB_SKILLS_MAX_COUNT
  ) {
    throw new Error(
      "A maximum of 20 skills is allowed."
    );
  }

  if (
    skills.some(
      (skill) =>
        skill.length > 100
    )
  ) {
    throw new Error(
      "Each skill must not exceed 100 characters."
    );
  }

  return true;
};

const validateSalaryRange = (
  value,
  {
    req
  }
) => {
  if (
    req.query.minimumSalary ===
    undefined ||
    value === undefined
  ) {
    return true;
  }

  if (
    Number(
      req.query.minimumSalary
    ) >
    Number(value)
  ) {
    throw new Error(
      "Minimum salary must not exceed maximum salary."
    );
  }

  return true;
};

const validateDateRange = (
  fromField,
  message
) => {
  return (
    value,
    {
      req
    }
  ) => {
    const fromValue =
      req.query[fromField];

    if (
      !fromValue ||
      !value
    ) {
      return true;
    }

    if (
      new Date(
        fromValue
      ).getTime() >
      new Date(
        value
      ).getTime()
    ) {
      throw new Error(
        message
      );
    }

    return true;
  };
};

const publicJobListValidator = [
  query("page")
    .optional()
    .isInt({
      min: 1
    })
    .withMessage(
      "Page must be a positive integer."
    )
    .toInt(),

  query("limit")
    .optional()
    .isInt({
      min: 1,
      max: 100
    })
    .withMessage(
      "Limit must be between 1 and 100."
    )
    .toInt(),

  query("sort")
    .optional()
    .isIn(
      PUBLIC_JOB_SORT_VALUES
    )
    .withMessage(
      `Sort must be one of: ${PUBLIC_JOB_SORT_VALUES.join(
        ", "
      )}.`
    ),

  query("search")
    .optional()
    .isString()
    .withMessage(
      "Search must be a string."
    )
    .bail()
    .trim()
    .isLength({
      min: 1,
      max:
        PUBLIC_JOB_SEARCH_MAX_LENGTH
    })
    .withMessage(
      "Search must be between 1 and 200 characters."
    ),

  query("location")
    .optional()
    .isString()
    .withMessage(
      "Location must be a string."
    )
    .bail()
    .trim()
    .isLength({
      min: 1,
      max:
        PUBLIC_JOB_LOCATION_MAX_LENGTH
    })
    .withMessage(
      "Location must be between 1 and 255 characters."
    ),

  query("workMode")
    .optional()
    .isIn(
      JOB_WORK_MODE_VALUES
    )
    .withMessage(
      `Work mode must be one of: ${JOB_WORK_MODE_VALUES.join(
        ", "
      )}.`
    ),

  query("employmentType")
    .optional()
    .isIn(
      JOB_EMPLOYMENT_TYPE_VALUES
    )
    .withMessage(
      `Employment type must be one of: ${JOB_EMPLOYMENT_TYPE_VALUES.join(
        ", "
      )}.`
    ),

  query("experienceLevel")
    .optional()
    .isIn(
      JOB_EXPERIENCE_LEVEL_VALUES
    )
    .withMessage(
      `Experience level must be one of: ${JOB_EXPERIENCE_LEVEL_VALUES.join(
        ", "
      )}.`
    ),

  query("skills")
    .optional()
    .isString()
    .withMessage(
      "Skills must be a comma-separated string."
    )
    .bail()
    .trim()
    .isLength({
      min: 1,
      max:
        PUBLIC_JOB_SKILLS_MAX_LENGTH
    })
    .withMessage(
      "Skills must be between 1 and 1000 characters."
    )
    .bail()
    .custom(
      validateSkills
    ),

  query("minimumSalary")
    .optional()
    .isFloat({
      min: 0
    })
    .withMessage(
      "Minimum salary must be a non-negative number."
    )
    .toFloat(),

  query("maximumSalary")
    .optional()
    .isFloat({
      min: 0
    })
    .withMessage(
      "Maximum salary must be a non-negative number."
    )
    .bail()
    .custom(
      validateSalaryRange
    )
    .toFloat(),

  query("companyId")
    .optional()
    .isUUID()
    .withMessage(
      "Company ID must be a valid UUID."
    ),

  query("publishedFrom")
    .optional()
    .isISO8601({
      strict: true
    })
    .withMessage(
      "Published-from date must be a valid ISO 8601 date."
    )
    .toDate(),

  query("publishedTo")
    .optional()
    .isISO8601({
      strict: true
    })
    .withMessage(
      "Published-to date must be a valid ISO 8601 date."
    )
    .bail()
    .custom(
      validateDateRange(
        "publishedFrom",
        "Published-from date must not be after published-to date."
      )
    )
    .toDate(),

  query("deadlineFrom")
    .optional()
    .isISO8601({
      strict: true
    })
    .withMessage(
      "Deadline-from date must be a valid ISO 8601 date."
    )
    .toDate(),

  query("deadlineTo")
    .optional()
    .isISO8601({
      strict: true
    })
    .withMessage(
      "Deadline-to date must be a valid ISO 8601 date."
    )
    .bail()
    .custom(
      validateDateRange(
        "deadlineFrom",
        "Deadline-from date must not be after deadline-to date."
      )
    )
    .toDate()
];

const publicJobIdValidator = [
  param("jobId")
    .isUUID()
    .withMessage(
      "Job ID must be a valid UUID."
    )
];

const publicJobSlugValidator = [
  param("slug")
    .isString()
    .withMessage(
      "Job slug must be a string."
    )
    .bail()
    .trim()
    .isLength({
      min: 1,
      max:
        PUBLIC_JOB_SLUG_MAX_LENGTH
    })
    .withMessage(
      "Job slug must be between 1 and 180 characters."
    )
    .bail()
    .matches(
      PUBLIC_JOB_SLUG_PATTERN
    )
    .withMessage(
      "Job slug must contain lowercase letters, numbers, and hyphens only."
    )
];

const publicSimilarJobValidator = [
  param("jobId")
    .isUUID()
    .withMessage(
      "Job ID must be a valid UUID."
    ),

  query("limit")
    .optional()
    .isInt({
      min: 1,
      max:
        PUBLIC_SIMILAR_JOB_MAX_LIMIT
    })
    .withMessage(
      "Similar-job limit must be between 1 and 10."
    )
    .toInt()
];

export {
  PUBLIC_JOB_SEARCH_MAX_LENGTH,
  PUBLIC_JOB_LOCATION_MAX_LENGTH,
  PUBLIC_JOB_SKILLS_MAX_LENGTH,
  PUBLIC_JOB_SKILLS_MAX_COUNT,
  PUBLIC_JOB_SLUG_MAX_LENGTH,
  PUBLIC_JOB_SLUG_PATTERN,
  PUBLIC_SIMILAR_JOB_DEFAULT_LIMIT,
  PUBLIC_SIMILAR_JOB_MAX_LIMIT,
  validateSkills,
  validateSalaryRange,
  validateDateRange,
  publicJobListValidator,
  publicJobIdValidator,
  publicJobSlugValidator,
  publicSimilarJobValidator
};