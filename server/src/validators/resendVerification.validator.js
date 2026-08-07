import { body } from "express-validator";

const resendVerificationValidator = [
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
    .withMessage(
      "Valid email is required."
    )
    .bail()
    .normalizeEmail()
];

export default resendVerificationValidator;