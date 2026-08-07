import { body } from "express-validator";

const updateRecruiterProfileValidator = [
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

  body("designation")
    .optional()
    .trim()
    .isLength({
      min: 1,
      max: 150
    })
    .withMessage(
      "Designation must be between 1 and 150 characters."
    ),

  body("phoneNumber")
    .optional()
    .trim()
    .isLength({
      min: 7,
      max: 20
    })
    .withMessage(
      "Phone number must be between 7 and 20 characters."
    )
    .matches(/^\+?[0-9\s()-]{7,20}$/)
    .withMessage(
      "Phone number format is invalid."
    ),

  body("biography")
    .optional()
    .trim()
    .isLength({
      max: 2000
    })
    .withMessage(
      "Biography must not exceed 2000 characters."
    ),

  body("linkedinUrl")
    .optional({
      nullable: true
    })
    .trim()
    .isLength({
      max: 500
    })
    .withMessage(
      "LinkedIn URL must not exceed 500 characters."
    )
    .isURL({
      protocols: [
        "http",
        "https"
      ],
      require_protocol: true
    })
    .withMessage(
      "LinkedIn URL must be a valid URL including http:// or https://."
    )
    .custom((value) => {
      if (!value) {
        return true;
      }

      let parsedUrl;

      try {
        parsedUrl = new URL(value);
      } catch {
        throw new Error(
          "LinkedIn URL must be a valid URL."
        );
      }

      const hostname =
        parsedUrl.hostname
          .toLowerCase()
          .replace(/^www\./, "");

      if (
        hostname !== "linkedin.com" &&
        !hostname.endsWith(".linkedin.com")
      ) {
        throw new Error(
          "LinkedIn URL must belong to linkedin.com."
        );
      }

      return true;
    }),

  body().custom((value) => {
    const allowedFields = [
      "firstName",
      "lastName",
      "designation",
      "phoneNumber",
      "biography",
      "linkedinUrl"
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
        `Unsupported recruiter profile fields: ${invalidFields.join(", ")}`
      );
    }

    if (receivedFields.length === 0) {
      throw new Error(
        "At least one recruiter profile field is required."
      );
    }

    return true;
  })
];

export default updateRecruiterProfileValidator;