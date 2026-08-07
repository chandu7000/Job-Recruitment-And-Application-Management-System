import {
  param
} from "express-validator";

import {
  publicJobListValidator
} from "./publicJob.validator.js";

const PUBLIC_COMPANY_SLUG_MAX_LENGTH =
  220;

const PUBLIC_COMPANY_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const publicCompanyIdValidator = [
  param("companyId")
    .isUUID()
    .withMessage(
      "Company ID must be a valid UUID."
    )
];

const publicCompanySlugValidator = [
  param("slug")
    .isString()
    .withMessage(
      "Company slug must be a string."
    )
    .bail()
    .trim()
    .isLength({
      min: 2,
      max:
        PUBLIC_COMPANY_SLUG_MAX_LENGTH
    })
    .withMessage(
      "Company slug must be between 2 and 220 characters."
    )
    .bail()
    .matches(
      PUBLIC_COMPANY_SLUG_PATTERN
    )
    .withMessage(
      "Company slug must contain lowercase letters, numbers, and hyphens only."
    )
];

const publicCompanyJobIdValidator = [
  param("companyId")
    .isUUID()
    .withMessage(
      "Company ID must be a valid UUID."
    ),

  ...publicJobListValidator
];

const publicCompanyJobSlugValidator = [
  param("companySlug")
    .isString()
    .withMessage(
      "Company slug must be a string."
    )
    .bail()
    .trim()
    .isLength({
      min: 2,
      max:
        PUBLIC_COMPANY_SLUG_MAX_LENGTH
    })
    .withMessage(
      "Company slug must be between 2 and 220 characters."
    )
    .bail()
    .matches(
      PUBLIC_COMPANY_SLUG_PATTERN
    )
    .withMessage(
      "Company slug must contain lowercase letters, numbers, and hyphens only."
    ),

  ...publicJobListValidator
];

export {
  PUBLIC_COMPANY_SLUG_MAX_LENGTH,
  PUBLIC_COMPANY_SLUG_PATTERN,
  publicCompanyIdValidator,
  publicCompanySlugValidator,
  publicCompanyJobIdValidator,
  publicCompanyJobSlugValidator
};