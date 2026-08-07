import { body } from "express-validator";

const updateJobSeekerProfileValidator = [
  body("firstName")
    .optional()
    .trim()
    .isLength({
      min: 1,
      max: 100
    })
    .withMessage(
      "First name must be between 1 and 100 characters."
    ),

  body("lastName")
    .optional()
    .trim()
    .isLength({
      min: 1,
      max: 100
    })
    .withMessage(
      "Last name must be between 1 and 100 characters."
    ),

  body("phoneNumber")
    .optional()
    .trim()
    .isLength({
      min: 7,
      max: 30
    })
    .withMessage(
      "Phone number must be between 7 and 30 characters."
    ),

  body("location")
    .optional()
    .trim()
    .isLength({
      max: 255
    })
    .withMessage(
      "Location must not exceed 255 characters."
    ),

  body("addressLine1")
    .optional()
    .trim()
    .isLength({
      max: 255
    })
    .withMessage(
      "Address line 1 must not exceed 255 characters."
    ),

  body("addressLine2")
    .optional()
    .trim()
    .isLength({
      max: 255
    })
    .withMessage(
      "Address line 2 must not exceed 255 characters."
    ),

  body("city")
    .optional()
    .trim()
    .isLength({
      max: 100
    })
    .withMessage(
      "City must not exceed 100 characters."
    ),

  body("state")
    .optional()
    .trim()
    .isLength({
      max: 100
    })
    .withMessage(
      "State must not exceed 100 characters."
    ),

  body("country")
    .optional()
    .trim()
    .isLength({
      max: 100
    })
    .withMessage(
      "Country must not exceed 100 characters."
    ),

  body("postalCode")
    .optional()
    .trim()
    .isLength({
      max: 20
    })
    .withMessage(
      "Postal code must not exceed 20 characters."
    ),

  body("headline")
    .optional()
    .trim()
    .isLength({
      max: 255
    })
    .withMessage(
      "Headline must not exceed 255 characters."
    ),

  body("biography")
    .optional()
    .trim()
    .isLength({
      max: 5000
    })
    .withMessage(
      "Biography must not exceed 5000 characters."
    ),

  body().custom((value) => {
    const allowedFields = [
      "firstName",
      "lastName",
      "phoneNumber",
      "location",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "country",
      "postalCode",
      "headline",
      "biography"
    ];

    const receivedFields =
      Object.keys(value);

    const invalidFields =
      receivedFields.filter(
        (field) =>
          !allowedFields.includes(field)
      );

    if (invalidFields.length > 0) {
      throw new Error(
        `Unsupported profile fields: ${invalidFields.join(", ")}`
      );
    }

    if (receivedFields.length === 0) {
      throw new Error(
        "At least one profile field is required."
      );
    }

    return true;
  })
];

export default updateJobSeekerProfileValidator;