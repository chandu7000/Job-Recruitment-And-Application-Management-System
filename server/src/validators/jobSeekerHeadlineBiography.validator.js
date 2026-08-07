import { body } from "express-validator";

const normalizeOptionalText = (value) => {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length === 0
    ? null
    : normalizedValue;
};

const updateHeadlineBiographyValidator = [
  body("headline")
    .optional({
      nullable: true
    })
    .customSanitizer(
      normalizeOptionalText
    )
    .custom((value) => {
      if (value === null) {
        return true;
      }

      if (typeof value !== "string") {
        throw new Error(
          "Headline must be a string or null."
        );
      }

      if (value.length > 255) {
        throw new Error(
          "Headline must not exceed 255 characters."
        );
      }

      if (/[\r\n]/.test(value)) {
        throw new Error(
          "Headline must contain only one line."
        );
      }

      return true;
    }),

  body("biography")
    .optional({
      nullable: true
    })
    .customSanitizer(
      normalizeOptionalText
    )
    .custom((value) => {
      if (value === null) {
        return true;
      }

      if (typeof value !== "string") {
        throw new Error(
          "Biography must be a string or null."
        );
      }

      if (value.length > 5000) {
        throw new Error(
          "Biography must not exceed 5000 characters."
        );
      }

      return true;
    }),

  body().custom((value) => {
    const allowedFields = [
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
        `Unsupported professional profile fields: ${invalidFields.join(", ")}`
      );
    }

    if (receivedFields.length === 0) {
      throw new Error(
        "Headline or biography is required."
      );
    }

    return true;
  })
];

export default updateHeadlineBiographyValidator;