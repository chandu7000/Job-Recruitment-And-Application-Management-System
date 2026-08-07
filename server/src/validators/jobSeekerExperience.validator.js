import {
  body,
  param
} from "express-validator";

const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
  "TEMPORARY"
];

const allowedExperienceFields = [
  "company",
  "role",
  "employmentType",
  "location",
  "startDate",
  "endDate",
  "isCurrent",
  "description"
];

const validateExperienceBodyFields =
  body().custom((value) => {
    const receivedFields =
      Object.keys(value);

    const invalidFields =
      receivedFields.filter(
        (field) =>
          !allowedExperienceFields.includes(
            field
          )
      );

    if (invalidFields.length > 0) {
      throw new Error(
        `Unsupported experience fields: ${invalidFields.join(", ")}`
      );
    }

    return true;
  });

const optionalNullableString = (
  field,
  label,
  maxLength
) =>
  body(field)
    .optional({
      nullable: true
    })
    .customSanitizer((value) => {
      if (value === null) {
        return null;
      }

      if (typeof value !== "string") {
        return value;
      }

      const normalizedValue =
        value.trim();

      return normalizedValue.length === 0
        ? null
        : normalizedValue;
    })
    .custom((value) => {
      if (value === null) {
        return true;
      }

      if (typeof value !== "string") {
        throw new Error(
          `${label} must be a string or null.`
        );
      }

      if (value.length > maxLength) {
        throw new Error(
          `${label} must not exceed ${maxLength} characters.`
        );
      }

      return true;
    });

const optionalEndDateValidator =
  body("endDate")
    .optional({
      nullable: true
    })
    .customSanitizer((value) => {
      if (
        value === "" ||
        value === undefined
      ) {
        return null;
      }

      return value;
    })
    .custom((value) => {
      if (value === null) {
        return true;
      }

      if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
      ) {
        throw new Error(
          "End date must be a valid date in YYYY-MM-DD format or null."
        );
      }

      const parsedDate =
        new Date(`${value}T00:00:00.000Z`);

      if (
        Number.isNaN(parsedDate.getTime())
      ) {
        throw new Error(
          "End date must be a valid date in YYYY-MM-DD format or null."
        );
      }

      return true;
    });

const validateCurrentEmploymentState =
  body().custom((value) => {
    if (
      value.isCurrent === true &&
      value.endDate
    ) {
      throw new Error(
        "Current employment cannot have an end date."
      );
    }

    return true;
  });

const createJobSeekerExperienceValidator = [
  body("company")
    .exists({
      checkFalsy: true
    })
    .withMessage(
      "Company is required."
    )
    .bail()
    .isString()
    .withMessage(
      "Company must be a string."
    )
    .bail()
    .trim()
    .isLength({
      min: 1,
      max: 200
    })
    .withMessage(
      "Company must be between 1 and 200 characters."
    ),

  body("role")
    .exists({
      checkFalsy: true
    })
    .withMessage(
      "Role is required."
    )
    .bail()
    .isString()
    .withMessage(
      "Role must be a string."
    )
    .bail()
    .trim()
    .isLength({
      min: 1,
      max: 150
    })
    .withMessage(
      "Role must be between 1 and 150 characters."
    ),

  body("employmentType")
    .exists({
      checkFalsy: true
    })
    .withMessage(
      "Employment type is required."
    )
    .bail()
    .isIn(EMPLOYMENT_TYPES)
    .withMessage(
      `Employment type must be one of: ${EMPLOYMENT_TYPES.join(", ")}.`
    ),

  optionalNullableString(
    "location",
    "Location",
    150
  ),

  body("startDate")
    .exists({
      checkFalsy: true
    })
    .withMessage(
      "Start date is required."
    )
    .bail()
    .isISO8601({
      strict: true
    })
    .withMessage(
      "Start date must be a valid date in YYYY-MM-DD format."
    ),

  optionalEndDateValidator,

  body("isCurrent")
    .optional()
    .isBoolean({
      strict: true
    })
    .withMessage(
      "Current-employment flag must be a boolean."
    )
    .toBoolean(),

  optionalNullableString(
    "description",
    "Description",
    5000
  ),

  validateExperienceBodyFields,
  validateCurrentEmploymentState
];

const updateJobSeekerExperienceValidator = [
  param("experienceId")
    .isUUID()
    .withMessage(
      "Experience ID must be a valid UUID."
    ),

  body("company")
    .optional()
    .isString()
    .withMessage(
      "Company must be a string."
    )
    .bail()
    .trim()
    .isLength({
      min: 1,
      max: 200
    })
    .withMessage(
      "Company must be between 1 and 200 characters."
    ),

  body("role")
    .optional()
    .isString()
    .withMessage(
      "Role must be a string."
    )
    .bail()
    .trim()
    .isLength({
      min: 1,
      max: 150
    })
    .withMessage(
      "Role must be between 1 and 150 characters."
    ),

  body("employmentType")
    .optional()
    .isIn(EMPLOYMENT_TYPES)
    .withMessage(
      `Employment type must be one of: ${EMPLOYMENT_TYPES.join(", ")}.`
    ),

  optionalNullableString(
    "location",
    "Location",
    150
  ),

  body("startDate")
    .optional()
    .isISO8601({
      strict: true
    })
    .withMessage(
      "Start date must be a valid date in YYYY-MM-DD format."
    ),

  optionalEndDateValidator,

  body("isCurrent")
    .optional()
    .isBoolean({
      strict: true
    })
    .withMessage(
      "Current-employment flag must be a boolean."
    )
    .toBoolean(),

  optionalNullableString(
    "description",
    "Description",
    5000
  ),

  body().custom((value) => {
    const receivedFields =
      Object.keys(value);

    const invalidFields =
      receivedFields.filter(
        (field) =>
          !allowedExperienceFields.includes(
            field
          )
      );

    if (invalidFields.length > 0) {
      throw new Error(
        `Unsupported experience fields: ${invalidFields.join(", ")}`
      );
    }

    if (receivedFields.length === 0) {
      throw new Error(
        "At least one experience field is required."
      );
    }

    return true;
  }),

  validateCurrentEmploymentState
];

const deleteJobSeekerExperienceValidator = [
  param("experienceId")
    .isUUID()
    .withMessage(
      "Experience ID must be a valid UUID."
    )
];

export {
  createJobSeekerExperienceValidator,
  updateJobSeekerExperienceValidator,
  deleteJobSeekerExperienceValidator
};