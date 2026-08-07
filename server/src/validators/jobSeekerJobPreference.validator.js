import { body } from "express-validator";

const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
  "TEMPORARY"
];

const WORK_MODES = [
  "ONSITE",
  "REMOTE",
  "HYBRID"
];

const AVAILABILITY_STATUSES = [
  "IMMEDIATELY_AVAILABLE",
  "OPEN_TO_OPPORTUNITIES",
  "SERVING_NOTICE_PERIOD",
  "NOT_LOOKING"
];

const SALARY_CURRENCIES = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "CAD",
  "SGD",
  "AED"
];

const normalizeTextArray = (values) => {
  if (!Array.isArray(values)) {
    return values;
  }

  return [
    ...new Set(
      values.map((value) =>
        value.trim().replace(/\s+/g, " ")
      )
    )
  ];
};

const validateTextArray = (
  fieldName,
  label,
  maximumItems,
  maximumLength
) => [
  body(fieldName)
    .optional()
    .isArray({ max: maximumItems })
    .withMessage(
      `${label} must be an array with at most ${maximumItems} items`
    )
    .custom((values) => {
      if (
        values.some(
          (value) =>
            typeof value !== "string" ||
            value.trim().length === 0 ||
            value.trim().length > maximumLength
        )
      ) {
        throw new Error(
          `Each ${label.toLowerCase()} value must be a non-empty string with at most ${maximumLength} characters`
        );
      }

      return true;
    })
    .customSanitizer(normalizeTextArray)
];

const validateEnumArray = (
  fieldName,
  label,
  allowedValues
) =>
  body(fieldName)
    .optional()
    .isArray({ max: allowedValues.length })
    .withMessage(`${label} must be an array`)
    .custom((values) => {
      const invalidValues = values.filter(
        (value) => !allowedValues.includes(value)
      );

      if (invalidValues.length > 0) {
        throw new Error(
          `${label} contains invalid values: ${invalidValues.join(", ")}`
        );
      }

      return true;
    })
    .customSanitizer((values) => [
      ...new Set(values)
    ]);

const validateUnknownFields = body().custom((value) => {
  const allowedFields = new Set([
    "preferredJobRoles",
    "preferredLocations",
    "employmentTypes",
    "workModes",
    "expectedSalary",
    "salaryCurrency",
    "noticePeriodDays",
    "willingToRelocate",
    "availabilityStatus"
  ]);

  const unknownFields = Object.keys(value).filter(
    (field) => !allowedFields.has(field)
  );

  if (unknownFields.length > 0) {
    throw new Error(
      `Unknown fields are not allowed: ${unknownFields.join(", ")}`
    );
  }

  return true;
});

const validateAtLeastOneField = body().custom((value) => {
  if (Object.keys(value).length === 0) {
    throw new Error(
      "At least one job preference field must be provided"
    );
  }

  return true;
});

const validateExpectedSalary = body("expectedSalary")
  .optional({ nullable: true })
  .isFloat({
    min: 0,
    max: 9999999999.99
  })
  .withMessage(
    "Expected salary must be between 0 and 9999999999.99"
  )
  .toFloat();

const validateSalaryCurrency = body("salaryCurrency")
  .optional()
  .isIn(SALARY_CURRENCIES)
  .withMessage(
    `Salary currency must be one of: ${SALARY_CURRENCIES.join(", ")}`
  );

const validateNoticePeriodDays = body("noticePeriodDays")
  .optional({ nullable: true })
  .isInt({
    min: 0,
    max: 365
  })
  .withMessage(
    "Notice period days must be an integer between 0 and 365"
  )
  .toInt();

const validateWillingToRelocate = body("willingToRelocate")
  .optional()
  .isBoolean()
  .withMessage(
    "Willing to relocate must be a boolean"
  )
  .toBoolean();

const validateAvailabilityStatus = body(
  "availabilityStatus"
)
  .optional()
  .isIn(AVAILABILITY_STATUSES)
  .withMessage(
    `Availability status must be one of: ${AVAILABILITY_STATUSES.join(", ")}`
  );

export const validateUpdateJobPreference = [
  validateUnknownFields,
  validateAtLeastOneField,

  ...validateTextArray(
    "preferredJobRoles",
    "Preferred job roles",
    20,
    100
  ),

  ...validateTextArray(
    "preferredLocations",
    "Preferred locations",
    20,
    100
  ),

  validateEnumArray(
    "employmentTypes",
    "Employment types",
    EMPLOYMENT_TYPES
  ),

  validateEnumArray(
    "workModes",
    "Work modes",
    WORK_MODES
  ),

  validateExpectedSalary,
  validateSalaryCurrency,
  validateNoticePeriodDays,
  validateWillingToRelocate,
  validateAvailabilityStatus
];