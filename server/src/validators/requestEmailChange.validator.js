import { body } from "express-validator";

const requestEmailChangeValidator = [
  body("newEmail")
    .trim()
    .notEmpty()
    .withMessage("New email is required")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required")
    .isString()
    .withMessage("Current password must be a string")
];

export default requestEmailChangeValidator;