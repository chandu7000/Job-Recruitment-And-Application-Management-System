import { body } from "express-validator";

import {
  PASSWORD_RULES
} from "../utils/password.util.js";

const passwordStrengthValidator = (
  fieldName,
  displayName = "Password"
) => {
  return body(fieldName)
    .notEmpty()
    .withMessage(`${displayName} is required.`)
    .bail()
    .isString()
    .withMessage(
      `${displayName} must be a valid string.`
    )
    .bail()
    .isLength({
      min: PASSWORD_RULES.minLength,
      max: PASSWORD_RULES.maxLength
    })
    .withMessage(
      `${displayName} must contain between ${PASSWORD_RULES.minLength} and ${PASSWORD_RULES.maxLength} characters.`
    )
    .bail()
    .matches(/[A-Z]/)
    .withMessage(
      `${displayName} must contain at least one uppercase letter.`
    )
    .bail()
    .matches(/[a-z]/)
    .withMessage(
      `${displayName} must contain at least one lowercase letter.`
    )
    .bail()
    .matches(/\d/)
    .withMessage(
      `${displayName} must contain at least one number.`
    )
    .bail()
    .matches(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/
    )
    .withMessage(
      `${displayName} must contain at least one special character.`
    );
};

const registerValidator = [
  body("firstName")
    .optional().isString().withMessage("First name must be a valid string.")
    .bail().trim().isLength({ min: 1, max: 100 }).withMessage("First name must contain between 1 and 100 characters."),

  body("lastName")
    .optional().isString().withMessage("Last name must be a valid string.")
    .bail().trim().isLength({ min: 1, max: 100 }).withMessage("Last name must contain between 1 and 100 characters."),

  body("phoneNumber")
    .optional().isString().withMessage("Phone number must be a valid string.")
    .bail().trim().isLength({ min: 7, max: 30 }).withMessage("Phone number must contain between 7 and 30 characters.")
    .bail().matches(/^\+?[0-9\s()-]{7,30}$/).withMessage("Phone number format is invalid."),

  body("email")
    .exists({
      checkFalsy: true
    })
    .withMessage("Email is required.")
    .bail()
    .isString()
    .withMessage(
      "Email must be a valid string."
    )
    .bail()
    .trim()
    .isEmail()
    .withMessage("Invalid email address.")
    .bail()
    .normalizeEmail(),

  passwordStrengthValidator("password"),

  body("role")
    .optional()
    .isString()
    .withMessage("Role must be a string.")
    .bail()
    .isIn([
      "RECRUITER",
      "JOB_SEEKER"
    ])
    .withMessage("Invalid role.")
];

const loginValidator = [
  body("email")
    .exists({
      checkFalsy: true
    })
    .withMessage("Email is required.")
    .bail()
    .isString()
    .withMessage(
      "Email must be a valid string."
    )
    .bail()
    .trim()
    .isEmail()
    .withMessage("Invalid email address.")
    .bail()
    .normalizeEmail(),

  body("password")
    .exists({
      checkFalsy: true
    })
    .withMessage("Password is required.")
    .bail()
    .isString()
    .withMessage(
      "Password must be a valid string."
    )
];

export {
  passwordStrengthValidator,
  registerValidator,
  loginValidator
};