import { body } from "express-validator";

const createCompanyValidator = [
  body("companyName")
    .trim()
    .notEmpty()
    .withMessage(
      "Company name is required."
    )
    .isLength({
      min: 2,
      max: 200
    })
    .withMessage(
      "Company name must be between 2 and 200 characters."
    ),

  body("companyEmail")
    .optional({
      nullable: true
    })
    .trim()
    .isEmail()
    .withMessage(
      "Company email must be valid."
    )
    .isLength({
      max: 255
    })
    .withMessage(
      "Company email must not exceed 255 characters."
    ),

  body("companyPhone")
    .optional({
      nullable: true
    })
    .trim()
    .isLength({
      min: 7,
      max: 30
    })
    .withMessage(
      "Company phone number must be between 7 and 30 characters."
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
    .optional({
      nullable: true
    })
    .trim()
    .isLength({
      min: 1,
      max: 150
    })
    .withMessage(
      "Industry must not exceed 150 characters."
    ),

  body("companySize")
    .optional({
      nullable: true
    })
    .trim()
    .isLength({
      min: 1,
      max: 50
    })
    .withMessage(
      "Company size must not exceed 50 characters."
    ),

  body("foundedYear")
    .optional({
      nullable: true
    })
    .isInt({
      min: 1000,
      max:
        new Date().getUTCFullYear()
    })
    .withMessage(
      "Founded year must be valid and cannot be in the future."
    )
    .toInt(),

  body("description")
    .optional({
      nullable: true
    })
    .trim()
    .isLength({
      max: 10000
    })
    .withMessage(
      "Description must not exceed 10000 characters."
    ),

  body("location")
    .optional({
      nullable: true
    })
    .trim()
    .isLength({
      min: 1,
      max: 255
    })
    .withMessage(
      "Location must not exceed 255 characters."
    ),

  body("address")
    .optional({
      nullable: true
    })
    .trim()
    .isLength({
      min: 1,
      max: 500
    })
    .withMessage(
      "Address must not exceed 500 characters."
    ),

  body("city")
    .optional({
      nullable: true
    })
    .trim()
    .isLength({
      max: 100
    })
    .withMessage(
      "City must not exceed 100 characters."
    ),

  body("state")
    .optional({
      nullable: true
    })
    .trim()
    .isLength({
      max: 100
    })
    .withMessage(
      "State must not exceed 100 characters."
    ),

  body("country")
    .optional({
      nullable: true
    })
    .trim()
    .isLength({
      max: 100
    })
    .withMessage(
      "Country must not exceed 100 characters."
    ),

  body("postalCode")
    .optional({
      nullable: true
    })
    .trim()
    .isLength({
      max: 20
    })
    .withMessage(
      "Postal code must not exceed 20 characters."
    ),

  body().custom((value) => {
    const allowedFields = [
      "companyName",
      "companyEmail",
      "companyPhone",
      "website",
      "industry",
      "companySize",
      "foundedYear",
      "description",
      "location",
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

    return true;
  })
];

export default createCompanyValidator;