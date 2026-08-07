import {
  body
} from "express-validator";

const updateCompanyValidator = [
  body("description")
    .optional()
    .trim()
    .isLength({
      max: 10000
    })
    .withMessage(
      "Description must not exceed 10000 characters."
    ),

  body("website")
    .optional({
      nullable: true
    })
    .trim()
    .isURL({
      protocols: [
        "http",
        "https"
      ],
      require_protocol: true
    })
    .withMessage(
      "Website must be a valid URL including http:// or https://."
    )
    .isLength({
      max: 500
    })
    .withMessage(
      "Website must not exceed 500 characters."
    ),

  body("industry")
    .optional()
    .trim()
    .isLength({
      min: 1,
      max: 150
    })
    .withMessage(
      "Industry must be between 1 and 150 characters."
    ),

  body("location")
    .optional()
    .trim()
    .isLength({
      min: 1,
      max: 255
    })
    .withMessage(
      "Location must be between 1 and 255 characters."
    ),

  body("companySize")
    .optional()
    .trim()
    .isLength({
      min: 1,
      max: 50
    })
    .withMessage(
      "Company size must be between 1 and 50 characters."
    ),

  body().custom((value) => {
    const allowedFields = [
      "description",
      "website",
      "industry",
      "location",
      "companySize"
    ];

    const receivedFields =
      Object.keys(value);

    const invalidFields =
      receivedFields.filter(
        (field) =>
          !allowedFields.includes(field)
      );

    if (
      invalidFields.length > 0
    ) {
      throw new Error(
        `Unsupported company fields: ${invalidFields.join(", ")}`
      );
    }

    if (
      receivedFields.length === 0
    ) {
      throw new Error(
        "At least one company field is required."
      );
    }

    return true;
  })
];

export default updateCompanyValidator;