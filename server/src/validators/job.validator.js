import {
  body,
  param,
  query
} from "express-validator";

import {
  JOB_STATUS_VALUES,
  JOB_WORK_MODE_VALUES,
  JOB_EMPLOYMENT_TYPE_VALUES,
  JOB_EXPERIENCE_LEVEL_VALUES,
  JOB_FIELD_LIMITS
} from "../constants/job.constants.js";

const JOB_SORT_VALUES =
  Object.freeze([
    "newest",
    "oldest",
    "deadlineSoon",
    "titleAscending",
    "titleDescending",
    "salaryAscending",
    "salaryDescending"
  ]);

const optionalTrimmedString = (
  field,
  {
    minimum = 1,
    maximum,
    label
  }
) => {
  return body(field)
    .optional({
      nullable: true
    })
    .isString()
    .withMessage(
      `${label} must be a string.`
    )
    .bail()
    .trim()
    .isLength({
      min: minimum,
      max: maximum
    })
    .withMessage(
      `${label} must be between ${minimum} and ${maximum} characters.`
    );
};

const buildEditableJobFieldValidators =
  () => [
    optionalTrimmedString(
      "title",
      {
        minimum:
          JOB_FIELD_LIMITS
            .TITLE_MIN_LENGTH,

        maximum:
          JOB_FIELD_LIMITS
            .TITLE_MAX_LENGTH,

        label:
          "Job title"
      }
    ),

    optionalTrimmedString(
      "description",
      {
        maximum:
          JOB_FIELD_LIMITS
            .DESCRIPTION_MAX_LENGTH,

        label:
          "Job description"
      }
    ),

    optionalTrimmedString(
      "responsibilities",
      {
        maximum:
          JOB_FIELD_LIMITS
            .RESPONSIBILITIES_MAX_LENGTH,

        label:
          "Job responsibilities"
      }
    ),

    optionalTrimmedString(
      "requirements",
      {
        maximum:
          JOB_FIELD_LIMITS
            .REQUIREMENTS_MAX_LENGTH,

        label:
          "Job requirements"
      }
    ),

    body("skills")
      .optional({
        nullable: true
      })
      .isArray({
        max:
          JOB_FIELD_LIMITS
            .SKILLS_MAX_COUNT
      })
      .withMessage(
        "Skills must be an array containing no more than 50 values."
      ),

    body("skills.*")
      .optional()
      .isString()
      .withMessage(
        "Every skill must be a string."
      )
      .bail()
      .trim()
      .isLength({
        min: 1,
        max:
          JOB_FIELD_LIMITS
            .SKILL_MAX_LENGTH
      })
      .withMessage(
        "Each skill must be between 1 and 100 characters."
      ),

    optionalTrimmedString(
      "location",
      {
        maximum:
          JOB_FIELD_LIMITS
            .LOCATION_MAX_LENGTH,

        label:
          "Job location"
      }
    ),

    body("workMode")
      .optional({
        nullable: true
      })
      .isIn(
        JOB_WORK_MODE_VALUES
      )
      .withMessage(
        "Invalid job work mode."
      ),

    body("employmentType")
      .optional({
        nullable: true
      })
      .isIn(
        JOB_EMPLOYMENT_TYPE_VALUES
      )
      .withMessage(
        "Invalid job employment type."
      ),

    body("experienceLevel")
      .optional({
        nullable: true
      })
      .isIn(
        JOB_EXPERIENCE_LEVEL_VALUES
      )
      .withMessage(
        "Invalid job experience level."
      ),

    body("minimumExperience")
      .optional({
        nullable: true
      })
      .isFloat({
        min: 0,
        max:
          JOB_FIELD_LIMITS
            .MAX_EXPERIENCE_YEARS
      })
      .withMessage(
        "Minimum experience must be between 0 and 60 years."
      )
      .toFloat(),

    body("maximumExperience")
      .optional({
        nullable: true
      })
      .isFloat({
        min: 0,
        max:
          JOB_FIELD_LIMITS
            .MAX_EXPERIENCE_YEARS
      })
      .withMessage(
        "Maximum experience must be between 0 and 60 years."
      )
      .toFloat(),

    body("minimumSalary")
      .optional({
        nullable: true
      })
      .isFloat({
        min: 0
      })
      .withMessage(
        "Minimum salary cannot be negative."
      )
      .toFloat(),

    body("maximumSalary")
      .optional({
        nullable: true
      })
      .isFloat({
        min: 0
      })
      .withMessage(
        "Maximum salary cannot be negative."
      )
      .toFloat(),

    body("salaryCurrency")
      .optional({
        nullable: true
      })
      .isString()
      .withMessage(
        "Salary currency must be a string."
      )
      .bail()
      .trim()
      .toUpperCase()
      .matches(
        /^[A-Z]{3}$/
      )
      .withMessage(
        "Salary currency must be a valid three-letter uppercase code."
      ),

    body("vacancies")
      .optional({
        nullable: true
      })
      .isInt({
        min: 1,
        max:
          JOB_FIELD_LIMITS
            .MAX_VACANCIES
      })
      .withMessage(
        "Vacancies must be between 1 and 100000."
      )
      .toInt(),

    body("applicationDeadline")
      .optional({
        nullable: true
      })
      .isISO8601({
        strict: true
      })
      .withMessage(
        "Application deadline must be a valid ISO 8601 date."
      )
      .toDate()
  ];

const createJobValidator = [
  body("companyId")
    .exists({
      checkFalsy: true
    })
    .withMessage(
      "Company ID is required."
    )
    .bail()
    .isUUID()
    .withMessage(
      "Valid company ID is required."
    ),

  ...buildEditableJobFieldValidators()
];

const updateJobValidator =
  buildEditableJobFieldValidators();

const recruiterJobIdValidator = [
  param("jobId")
    .isUUID()
    .withMessage(
      "Valid job ID is required."
    )
];

const closeJobValidator = [
  body("closureReason")
    .optional()
    .isString()
    .withMessage(
      "Closure reason must be a string."
    )
    .bail()
    .trim()
    .isLength({
      min: 1,
      max:
        JOB_FIELD_LIMITS
          .CLOSURE_REASON_MAX_LENGTH
    })
    .withMessage(
      `Closure reason must be between 1 and ${JOB_FIELD_LIMITS.CLOSURE_REASON_MAX_LENGTH} characters.`
    )
];

const validateDateRange = (
  fromField,
  toField,
  label
) => {
  return query(toField)
    .optional()
    .custom(
      (
        toValue,
        {
          req
        }
      ) => {
        const fromValue =
          req.query[
          fromField
          ];

        if (
          fromValue ===
          undefined ||
          fromValue === null ||
          fromValue === ""
        ) {
          return true;
        }

        const parsedFrom =
          fromValue
            instanceof Date
            ? fromValue
            : new Date(
              fromValue
            );

        const parsedTo =
          toValue
            instanceof Date
            ? toValue
            : new Date(
              toValue
            );

        if (
          Number.isNaN(
            parsedFrom.getTime()
          ) ||
          Number.isNaN(
            parsedTo.getTime()
          )
        ) {
          return true;
        }

        if (
          parsedFrom.getTime() >
          parsedTo.getTime()
        ) {
          throw new Error(
            `${label} start date cannot be after end date.`
          );
        }

        return true;
      }
    );
};

const recruiterJobListValidator = [
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
      max: 200
    })
    .withMessage(
      "Search must be between 1 and 200 characters."
    ),

  query("status")
    .optional()
    .isIn(
      JOB_STATUS_VALUES
    )
    .withMessage(
      "Invalid job status."
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
        JOB_FIELD_LIMITS
          .LOCATION_MAX_LENGTH
    })
    .withMessage(
      "Location filter is invalid."
    ),

  query("employmentType")
    .optional()
    .isIn(
      JOB_EMPLOYMENT_TYPE_VALUES
    )
    .withMessage(
      "Invalid employment type."
    ),

  query("workMode")
    .optional()
    .isIn(
      JOB_WORK_MODE_VALUES
    )
    .withMessage(
      "Invalid work mode."
    ),

  query("experienceLevel")
    .optional()
    .isIn(
      JOB_EXPERIENCE_LEVEL_VALUES
    )
    .withMessage(
      "Invalid experience level."
    ),

  query("dateFrom")
    .optional()
    .isISO8601({
      strict: true
    })
    .withMessage(
      "dateFrom must be a valid ISO 8601 date."
    )
    .toDate(),

  query("dateTo")
    .optional()
    .isISO8601({
      strict: true
    })
    .withMessage(
      "dateTo must be a valid ISO 8601 date."
    )
    .toDate(),

  query("publishedFrom")
    .optional()
    .isISO8601({
      strict: true
    })
    .withMessage(
      "publishedFrom must be a valid ISO 8601 date."
    )
    .toDate(),

  query("publishedTo")
    .optional()
    .isISO8601({
      strict: true
    })
    .withMessage(
      "publishedTo must be a valid ISO 8601 date."
    )
    .toDate(),

  query("deadlineFrom")
    .optional()
    .isISO8601({
      strict: true
    })
    .withMessage(
      "deadlineFrom must be a valid ISO 8601 date."
    )
    .toDate(),

  query("deadlineTo")
    .optional()
    .isISO8601({
      strict: true
    })
    .withMessage(
      "deadlineTo must be a valid ISO 8601 date."
    )
    .toDate(),

  query("minimumSalary")
    .optional()
    .isFloat({
      min: 0
    })
    .withMessage(
      "Minimum salary cannot be negative."
    )
    .toFloat(),

  query("maximumSalary")
    .optional()
    .isFloat({
      min: 0
    })
    .withMessage(
      "Maximum salary cannot be negative."
    )
    .toFloat(),

  query("sort")
    .optional()
    .isIn(
      JOB_SORT_VALUES
    )
    .withMessage(
      "Invalid job sorting option."
    ),

  validateDateRange(
    "dateFrom",
    "dateTo",
    "Creation date"
  ),

  validateDateRange(
    "publishedFrom",
    "publishedTo",
    "Publication date"
  ),

  validateDateRange(
    "deadlineFrom",
    "deadlineTo",
    "Deadline"
  )
];


export {
  JOB_SORT_VALUES,
  createJobValidator,
  recruiterJobListValidator,
  recruiterJobIdValidator,
  updateJobValidator,
  closeJobValidator
};