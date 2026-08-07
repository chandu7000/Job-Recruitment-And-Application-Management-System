import AppError from "../utils/AppError.js";

const CERTIFICATION_FIELDS = [
  "name",
  "issuingOrganization",
  "credentialId",
  "credentialUrl",
  "issueDate",
  "expiryDate",
  "doesNotExpire"
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}$/;

const createValidationError = (
  message,
  code = "CERTIFICATION_VALIDATION_ERROR"
) => {
  return new AppError(
    message,
    400,
    code
  );
};

const isValidDate = (value) => {
  if (!DATE_REGEX.test(value)) {
    return false;
  }

  const date = new Date(
    `${value}T00:00:00.000Z`
  );

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) ===
      value
  );
};

const isValidHttpUrl = (value) => {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
};

const validateUnknownFields = (body) => {
  const unknownFields =
    Object.keys(body).filter(
      (field) =>
        !CERTIFICATION_FIELDS.includes(field)
    );

  if (unknownFields.length > 0) {
    throw createValidationError(
      `Unknown field(s): ${unknownFields.join(", ")}`,
      "UNKNOWN_CERTIFICATION_FIELDS"
    );
  }
};

const validateRequiredString = (
  value,
  fieldName,
  maxLength,
  required
) => {
  if (value === undefined) {
    if (required) {
      throw createValidationError(
        `${fieldName} is required`,
        "REQUIRED_CERTIFICATION_FIELD"
      );
    }

    return;
  }

  if (typeof value !== "string") {
    throw createValidationError(
      `${fieldName} must be a string`,
      "INVALID_CERTIFICATION_FIELD_TYPE"
    );
  }

  const normalizedValue =
    value.trim();

  if (normalizedValue.length < 2) {
    throw createValidationError(
      `${fieldName} must contain at least 2 characters`,
      "CERTIFICATION_FIELD_TOO_SHORT"
    );
  }

  if (
    normalizedValue.length >
    maxLength
  ) {
    throw createValidationError(
      `${fieldName} cannot exceed ${maxLength} characters`,
      "CERTIFICATION_FIELD_TOO_LONG"
    );
  }
};

const validateOptionalString = (
  value,
  fieldName,
  maxLength
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return;
  }

  if (typeof value !== "string") {
    throw createValidationError(
      `${fieldName} must be a string`,
      "INVALID_CERTIFICATION_FIELD_TYPE"
    );
  }

  if (
    value.trim().length >
    maxLength
  ) {
    throw createValidationError(
      `${fieldName} cannot exceed ${maxLength} characters`,
      "CERTIFICATION_FIELD_TOO_LONG"
    );
  }
};

const validateCredentialUrl = (
  value
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return;
  }

  if (typeof value !== "string") {
    throw createValidationError(
      "Credential URL must be a string",
      "INVALID_CREDENTIAL_URL_TYPE"
    );
  }

  const normalizedUrl =
    value.trim();

  if (normalizedUrl.length === 0) {
    return;
  }

  if (
    normalizedUrl.length > 500
  ) {
    throw createValidationError(
      "Credential URL cannot exceed 500 characters",
      "CREDENTIAL_URL_TOO_LONG"
    );
  }

  if (
    !isValidHttpUrl(normalizedUrl)
  ) {
    throw createValidationError(
      "Credential URL must be a valid HTTP or HTTPS URL",
      "INVALID_CREDENTIAL_URL"
    );
  }
};

const validateDate = (
  value,
  fieldName,
  required = false
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    if (required) {
      throw createValidationError(
        `${fieldName} is required`,
        "REQUIRED_CERTIFICATION_DATE"
      );
    }

    return;
  }

  if (
    typeof value !== "string" ||
    !isValidDate(value)
  ) {
    throw createValidationError(
      `${fieldName} must use the YYYY-MM-DD format`,
      "INVALID_CERTIFICATION_DATE"
    );
  }
};

const validateDoesNotExpire = (
  value
) => {
  if (value === undefined) {
    return;
  }

  if (typeof value !== "boolean") {
    throw createValidationError(
      "doesNotExpire must be a boolean",
      "INVALID_DOES_NOT_EXPIRE_TYPE"
    );
  }
};

const validateDateRules = ({
  issueDate,
  expiryDate,
  doesNotExpire
}) => {
  if (
    doesNotExpire === true &&
    expiryDate
  ) {
    throw createValidationError(
      "Expiry date must be empty when certification does not expire",
      "CERTIFICATION_EXPIRY_NOT_ALLOWED"
    );
  }

  if (
    issueDate &&
    expiryDate &&
    new Date(expiryDate).getTime() <
      new Date(issueDate).getTime()
  ) {
    throw createValidationError(
      "Certification expiry date cannot be earlier than the issue date",
      "INVALID_CERTIFICATION_DATE_RANGE"
    );
  }
};

const normalizeCertificationData = (
  body
) => {
  if (
    typeof body.name === "string"
  ) {
    body.name = body.name.trim();
  }

  if (
    typeof body.issuingOrganization ===
    "string"
  ) {
    body.issuingOrganization =
      body.issuingOrganization.trim();
  }

  if (
    typeof body.credentialId ===
    "string"
  ) {
    const credentialId =
      body.credentialId.trim();

    body.credentialId =
      credentialId.length > 0
        ? credentialId
        : null;
  }

  if (
    typeof body.credentialUrl ===
    "string"
  ) {
    const credentialUrl =
      body.credentialUrl.trim();

    body.credentialUrl =
      credentialUrl.length > 0
        ? credentialUrl
        : null;
  }

  if (body.expiryDate === "") {
    body.expiryDate = null;
  }

  if (
    body.doesNotExpire === true
  ) {
    body.expiryDate = null;
  }
};

const validateCertificationPayload = (
  body,
  {
    nameRequired = false,
    organizationRequired = false,
    issueDateRequired = false
  } = {}
) => {
  validateUnknownFields(body);

  validateRequiredString(
    body.name,
    "Certification name",
    200,
    nameRequired
  );

  validateRequiredString(
    body.issuingOrganization,
    "Issuing organization",
    200,
    organizationRequired
  );

  validateOptionalString(
    body.credentialId,
    "Credential ID",
    200
  );

  validateCredentialUrl(
    body.credentialUrl
  );

  validateDate(
    body.issueDate,
    "Issue date",
    issueDateRequired
  );

  validateDate(
    body.expiryDate,
    "Expiry date"
  );

  validateDoesNotExpire(
    body.doesNotExpire
  );

  validateDateRules(body);

  normalizeCertificationData(body);
};

export const validateCertificationId = (
  req,
  _res,
  next
) => {
  try {
    const { certificationId } =
      req.params;

    if (
      typeof certificationId !==
        "string" ||
      !UUID_REGEX.test(certificationId)
    ) {
      throw createValidationError(
        "A valid certification ID is required",
        "INVALID_CERTIFICATION_ID"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateCreateCertification = (
  req,
  _res,
  next
) => {
  try {
    validateCertificationPayload(
      req.body,
      {
        nameRequired: true,
        organizationRequired: true,
        issueDateRequired: true
      }
    );

    next();
  } catch (error) {
    next(error);
  }
};

export const validateUpdateCertification = (
  req,
  _res,
  next
) => {
  try {
    if (
      !req.body ||
      Object.keys(req.body).length ===
        0
    ) {
      throw createValidationError(
        "At least one certification field is required",
        "CERTIFICATION_UPDATE_DATA_REQUIRED"
      );
    }

    validateCertificationPayload(
      req.body
    );

    next();
  } catch (error) {
    next(error);
  }
};