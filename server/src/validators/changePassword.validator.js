import { body } from "express-validator";

import {
  passwordStrengthValidator
} from "./auth.validator.js";

const changePasswordValidator = [
  body("currentPassword")
    .exists({
      checkFalsy: true
    })
    .withMessage(
      "Current password is required."
    )
    .bail()
    .isString()
    .withMessage(
      "Current password must be a valid string."
    ),

  passwordStrengthValidator(
    "newPassword",
    "New password"
  ),

  body("newPassword").custom(
    (newPassword, { req }) => {
      if (
        newPassword ===
        req.body.currentPassword
      ) {
        throw new Error(
          "New password must be different from the current password."
        );
      }

      return true;
    }
  )
];

export default changePasswordValidator;