import {
  body,
  param
} from "express-validator";

const companyIdValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage(
      "Company ID is required."
    )
    .isUUID()
    .withMessage(
      "Company ID must be a valid UUID."
    )
];

const verifyCompanyValidator = [
  ...companyIdValidator
];

const rejectCompanyValidator = [
  ...companyIdValidator,

  body("reason")
    .trim()
    .notEmpty()
    .withMessage(
      "Rejection reason is required."
    )
    .isLength({
      min: 5,
      max: 2000
    })
    .withMessage(
      "Rejection reason must be between 5 and 2000 characters."
    ),

  body().custom((value) => {
    const allowedFields = [
      "reason"
    ];

    const receivedFields =
      Object.keys(
        value || {}
      );

    const invalidFields =
      receivedFields.filter(
        (field) =>
          !allowedFields.includes(
            field
          )
      );

    if (
      invalidFields.length > 0
    ) {
      throw new Error(
        `Unsupported rejection fields: ${invalidFields.join(", ")}`
      );
    }

    return true;
  })
];

export {
  verifyCompanyValidator,
  rejectCompanyValidator
};