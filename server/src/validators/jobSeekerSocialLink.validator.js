import AppError from "../utils/AppError.js";

const SOCIAL_LINK_FIELDS = [
  "platform",
  "url",
  "displayName"
];

const ALLOWED_PLATFORMS = [
  "LINKEDIN",
  "GITHUB",
  "PORTFOLIO",
  "LEETCODE",
  "HACKERRANK",
  "STACK_OVERFLOW",
  "PERSONAL_WEBSITE",
  "OTHER"
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


const createValidationError = (
  message,
  code = "SOCIAL_LINK_VALIDATION_ERROR"
) => {
  return new AppError(
    message,
    400,
    code
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
        !SOCIAL_LINK_FIELDS.includes(field)
    );

  if (unknownFields.length > 0) {
    throw createValidationError(
      `Unknown field(s): ${unknownFields.join(", ")}`,
      "UNKNOWN_SOCIAL_LINK_FIELDS"
    );
  }
};


const validatePlatform = (
  platform,
  required = false
) => {
  if (platform === undefined) {
    if (required) {
      throw createValidationError(
        "Platform is required",
        "SOCIAL_LINK_PLATFORM_REQUIRED"
      );
    }

    return;
  }


  if (typeof platform !== "string") {
    throw createValidationError(
      "Platform must be a string",
      "INVALID_SOCIAL_LINK_PLATFORM_TYPE"
    );
  }


  const normalizedPlatform =
    platform.trim().toUpperCase();


  if (
    !ALLOWED_PLATFORMS.includes(
      normalizedPlatform
    )
  ) {
    throw createValidationError(
      `Platform must be one of: ${ALLOWED_PLATFORMS.join(", ")}`,
      "INVALID_SOCIAL_LINK_PLATFORM"
    );
  }
};


const validateUrl = (
  url,
  required = false
) => {
  if (url === undefined) {
    if (required) {
      throw createValidationError(
        "Social link URL is required",
        "SOCIAL_LINK_URL_REQUIRED"
      );
    }

    return;
  }


  if (typeof url !== "string") {
    throw createValidationError(
      "Social link URL must be a string",
      "INVALID_SOCIAL_LINK_URL_TYPE"
    );
  }


  const normalizedUrl =
    url.trim();


  if (normalizedUrl.length === 0) {
    throw createValidationError(
      "Social link URL cannot be empty",
      "EMPTY_SOCIAL_LINK_URL"
    );
  }


  if (normalizedUrl.length > 500) {
    throw createValidationError(
      "Social link URL cannot exceed 500 characters",
      "SOCIAL_LINK_URL_TOO_LONG"
    );
  }


  if (!isValidHttpUrl(normalizedUrl)) {
    throw createValidationError(
      "Social link URL must be a valid HTTP or HTTPS URL",
      "INVALID_SOCIAL_LINK_URL"
    );
  }
};


const validateDisplayName = (
  displayName
) => {
  if (
    displayName === undefined ||
    displayName === null
  ) {
    return;
  }


  if (typeof displayName !== "string") {
    throw createValidationError(
      "Display name must be a string",
      "INVALID_DISPLAY_NAME_TYPE"
    );
  }


  if (displayName.trim().length > 150) {
    throw createValidationError(
      "Display name cannot exceed 150 characters",
      "DISPLAY_NAME_TOO_LONG"
    );
  }
};


const normalizeSocialLinkData = (
  body
) => {
  if (
    typeof body.platform === "string"
  ) {
    body.platform =
      body.platform
        .trim()
        .toUpperCase();
  }


  if (
    typeof body.url === "string"
  ) {
    body.url =
      body.url.trim();
  }


  if (
    typeof body.displayName === "string"
  ) {
    const normalizedDisplayName =
      body.displayName.trim();

    body.displayName =
      normalizedDisplayName.length > 0
        ? normalizedDisplayName
        : null;
  }
};


const validateSocialLinkPayload = (
  body,
  {
    platformRequired = false,
    urlRequired = false
  } = {}
) => {
  validateUnknownFields(body);

  validatePlatform(
    body.platform,
    platformRequired
  );

  validateUrl(
    body.url,
    urlRequired
  );

  validateDisplayName(
    body.displayName
  );

  normalizeSocialLinkData(body);
};


export const validateSocialLinkId = (
  req,
  _res,
  next
) => {
  try {
    const {
      socialLinkId
    } = req.params;


    if (
      typeof socialLinkId !== "string" ||
      !UUID_REGEX.test(socialLinkId)
    ) {
      throw createValidationError(
        "A valid social link ID is required",
        "INVALID_SOCIAL_LINK_ID"
      );
    }


    next();

  } catch (error) {
    next(error);
  }
};


export const validateCreateSocialLink = (
  req,
  _res,
  next
) => {
  try {
    validateSocialLinkPayload(
      req.body,
      {
        platformRequired: true,
        urlRequired: true
      }
    );


    next();

  } catch (error) {
    next(error);
  }
};


export const validateUpdateSocialLink = (
  req,
  _res,
  next
) => {
  try {

    if (
      !req.body ||
      Object.keys(req.body).length === 0
    ) {
      throw createValidationError(
        "At least one social-link field is required",
        "SOCIAL_LINK_UPDATE_DATA_REQUIRED"
      );
    }


    validateSocialLinkPayload(
      req.body
    );


    next();

  } catch (error) {
    next(error);
  }
};