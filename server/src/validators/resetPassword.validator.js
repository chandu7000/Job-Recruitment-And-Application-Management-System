import { body } from "express-validator";

import {
  passwordStrengthValidator
} from "./auth.validator.js";

const resetPasswordValidator = [
  body("token")
    .exists({
      checkFalsy: true
    })
    .withMessage(
      "Reset token is required."
    )
    .bail()
    .isString()
    .withMessage(
      "Reset token must be a valid string."
    )
    .bail()
    .trim()
    .isLength({
      min: 64,
      max: 64
    })
    .withMessage(
      "Reset token must be a valid 64-character token."
    )
    .bail()
    .isHexadecimal()
    .withMessage(
      "Reset token must contain only hexadecimal characters."
    ),

  passwordStrengthValidator("password")
];

export default resetPasswordValidator;