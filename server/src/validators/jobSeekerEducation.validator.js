import {
  body,
  param
} from "express-validator";

const allowedEducationFields = [
  "institution",
  "degree",
  "fieldOfStudy",
  "startDate",
  "endDate",
  "grade",
  "description"
];

const validateEducationBodyFields =
  body().custom((value) => {
    const receivedFields =
      Object.keys(value);

    const invalidFields =
      receivedFields.filter(
        (field) =>
          !allowedEducationFields.includes(
            field
          )
      );

    if (invalidFields.length > 0) {
      throw new Error(
        `Unsupported education fields: ${invalidFields.join(", ")}`
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

const createJobSeekerEducationValidator = [
  body("institution")
    .exists({
      checkFalsy: true
    })
    .withMessage(
      "Institution is required."
    )
    .bail()
    .isString()
    .withMessage(
      "Institution must be a string."
    )
    .bail()
    .trim()
    .isLength({
      min: 1,
      max: 200
    })
    .withMessage(
      "Institution must be between 1 and 200 characters."
    ),

  body("degree")
    .exists({
      checkFalsy: true
    })
    .withMessage(
      "Degree is required."
    )
    .bail()
    .isString()
    .withMessage(
      "Degree must be a string."
    )
    .bail()
    .trim()
    .isLength({
      min: 1,
      max: 150
    })
    .withMessage(
      "Degree must be between 1 and 150 characters."
    ),

  optionalNullableString(
    "fieldOfStudy",
    "Field of study",
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
    }),

  optionalNullableString(
    "grade",
    "Grade",
    50
  ),

  optionalNullableString(
    "description",
    "Description",
    5000
  ),

  validateEducationBodyFields
];

const updateJobSeekerEducationValidator = [
  param("educationId")
    .isUUID()
    .withMessage(
      "Education ID must be a valid UUID."
    ),

  body("institution")
    .optional()
    .isString()
    .withMessage(
      "Institution must be a string."
    )
    .bail()
    .trim()
    .isLength({
      min: 1,
      max: 200
    })
    .withMessage(
      "Institution must be between 1 and 200 characters."
    ),

  body("degree")
    .optional()
    .isString()
    .withMessage(
      "Degree must be a string."
    )
    .bail()
    .trim()
    .isLength({
      min: 1,
      max: 150
    })
    .withMessage(
      "Degree must be between 1 and 150 characters."
    ),

  optionalNullableString(
    "fieldOfStudy",
    "Field of study",
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

  body("endDate")
    .optional({
      nullable: true
    })
    .customSanitizer((value) => {
      if (value === "") {
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
    }),

  optionalNullableString(
    "grade",
    "Grade",
    50
  ),

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
          !allowedEducationFields.includes(
            field
          )
      );

    if (invalidFields.length > 0) {
      throw new Error(
        `Unsupported education fields: ${invalidFields.join(", ")}`
      );
    }

    if (receivedFields.length === 0) {
      throw new Error(
        "At least one education field is required."
      );
    }

    return true;
  })
];

const deleteJobSeekerEducationValidator = [
  param("educationId")
    .isUUID()
    .withMessage(
      "Education ID must be a valid UUID."
    )
];

export {
  createJobSeekerEducationValidator,
  updateJobSeekerEducationValidator,
  deleteJobSeekerEducationValidator
};