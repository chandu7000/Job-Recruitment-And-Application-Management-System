import {
  body
} from "express-validator";

const updateCompanyValidator = [
  body("companyName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Company name must be between 2 and 200 characters."),

  body("companyEmail")
    .optional({ nullable: true })
    .trim()
    .isEmail()
    .withMessage("Company email must be valid.")
    .isLength({ max: 255 }),

  body("companyPhone")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 7, max: 30 }),

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

  body("foundedYear")
    .optional({ nullable: true })
    .isInt({
      min: 1000,
      max: new Date().getUTCFullYear()
    })
    .withMessage(
      "Founded year must be valid and cannot be in the future."
    )
    .toInt(),

  ...[
    "address",
    "city",
    "state",
    "country",
    "postalCode"
  ].map((field) =>
    body(field)
      .optional({ nullable: true })
      .trim()
      .isLength({
        max:
          field === "address"
            ? 500
            : field === "postalCode"
              ? 20
              : 100
      })
  ),

  body().custom((value) => {
    const allowedFields = [
      "companyName",
      "companyEmail",
      "companyPhone",
      "description",
      "website",
      "industry",
      "location",
      "companySize",
      "foundedYear",
      "address",
      "city",
      "state",
      "country",
      "postalCode"
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
