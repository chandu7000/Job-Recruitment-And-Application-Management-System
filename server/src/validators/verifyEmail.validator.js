import { body } from "express-validator";

const verifyEmailValidator = [
  body("token")
    .exists({
      checkFalsy: true
    })
    .withMessage(
      "Verification token is required."
    )
    .bail()
    .isString()
    .withMessage(
      "Verification token must be a valid string."
    )
    .bail()
    .trim()
    .isLength({
      min: 64,
      max: 64
    })
    .withMessage(
      "Verification token must be a valid 64-character token."
    )
    .bail()
    .isHexadecimal()
    .withMessage(
      "Verification token must contain only hexadecimal characters."
    )
];

export default verifyEmailValidator;