import AppError from "../utils/AppError.js";

const PROJECT_FIELDS = [
  "title",
  "description",
  "technologies",
  "projectUrl",
  "repositoryUrl",
  "startDate",
  "endDate"
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}$/;

const createValidationError = (
  message,
  code
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

  const date =
    new Date(
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
        !PROJECT_FIELDS.includes(field)
    );

  if (unknownFields.length > 0) {
    throw createValidationError(
      `Unknown field(s): ${unknownFields.join(", ")}`,
      "UNKNOWN_PROJECT_FIELDS"
    );
  }
};

const normalizeOptionalString = (
  body,
  field
) => {
  if (
    Object.prototype.hasOwnProperty.call(
      body,
      field
    ) &&
    typeof body[field] === "string"
  ) {
    const normalizedValue =
      body[field].trim();

    body[field] =
      normalizedValue.length > 0
        ? normalizedValue
        : null;
  }
};

const validateTitle = (
  title,
  required
) => {
  if (title === undefined) {
    if (required) {
      throw createValidationError(
        "Project title is required",
        "PROJECT_TITLE_REQUIRED"
      );
    }

    return;
  }

  if (typeof title !== "string") {
    throw createValidationError(
      "Project title must be a string",
      "INVALID_PROJECT_TITLE_TYPE"
    );
  }

  const normalizedTitle =
    title.trim();

  if (normalizedTitle.length < 2) {
    throw createValidationError(
      "Project title must contain at least 2 characters",
      "PROJECT_TITLE_TOO_SHORT"
    );
  }

  if (normalizedTitle.length > 200) {
    throw createValidationError(
      "Project title cannot exceed 200 characters",
      "PROJECT_TITLE_TOO_LONG"
    );
  }
};

const validateDescription = (
  description
) => {
  if (
    description === undefined ||
    description === null
  ) {
    return;
  }

  if (typeof description !== "string") {
    throw createValidationError(
      "Project description must be a string",
      "INVALID_PROJECT_DESCRIPTION_TYPE"
    );
  }

  if (
    description.trim().length > 5000
  ) {
    throw createValidationError(
      "Project description cannot exceed 5000 characters",
      "PROJECT_DESCRIPTION_TOO_LONG"
    );
  }
};

const validateTechnologies = (
  technologies
) => {
  if (
    technologies === undefined ||
    technologies === null
  ) {
    return;
  }

  if (!Array.isArray(technologies)) {
    throw createValidationError(
      "Technologies must be an array",
      "INVALID_TECHNOLOGIES_TYPE"
    );
  }

  if (technologies.length > 30) {
    throw createValidationError(
      "A project cannot contain more than 30 technologies",
      "TOO_MANY_TECHNOLOGIES"
    );
  }

  const normalizedTechnologies =
    technologies.map(
      (technology) => {
        if (
          typeof technology !== "string"
        ) {
          throw createValidationError(
            "Every technology must be a string",
            "INVALID_TECHNOLOGY_TYPE"
          );
        }

        const normalizedTechnology =
          technology.trim();

        if (
          normalizedTechnology.length < 1 ||
          normalizedTechnology.length > 100
        ) {
          throw createValidationError(
            "Each technology must contain between 1 and 100 characters",
            "INVALID_TECHNOLOGY_LENGTH"
          );
        }

        return normalizedTechnology;
      }
    );

  const uniqueTechnologies =
    new Set(
      normalizedTechnologies.map(
        (technology) =>
          technology.toLowerCase()
      )
    );

  if (
    uniqueTechnologies.size !==
    normalizedTechnologies.length
  ) {
    throw createValidationError(
      "Technologies cannot contain duplicate values",
      "DUPLICATE_TECHNOLOGIES"
    );
  }
};

const validateUrl = (
  value,
  fieldName
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
      "INVALID_PROJECT_URL_TYPE"
    );
  }

  const normalizedUrl =
    value.trim();

  if (normalizedUrl.length === 0) {
    return;
  }

  if (normalizedUrl.length > 500) {
    throw createValidationError(
      `${fieldName} cannot exceed 500 characters`,
      "PROJECT_URL_TOO_LONG"
    );
  }

  if (!isValidHttpUrl(normalizedUrl)) {
    throw createValidationError(
      `${fieldName} must be a valid HTTP or HTTPS URL`,
      "INVALID_PROJECT_URL"
    );
  }
};

const validateDate = (
  value,
  fieldName
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return;
  }

  if (
    typeof value !== "string" ||
    !isValidDate(value)
  ) {
    throw createValidationError(
      `${fieldName} must use the YYYY-MM-DD format`,
      "INVALID_PROJECT_DATE"
    );
  }
};

const validateDateRange = (
  startDate,
  endDate
) => {
  if (!startDate || !endDate) {
    return;
  }

  if (
    new Date(endDate).getTime() <
    new Date(startDate).getTime()
  ) {
    throw createValidationError(
      "Project end date cannot be earlier than the start date",
      "INVALID_PROJECT_DATE_RANGE"
    );
  }
};

const normalizeProjectData = (
  body
) => {
  if (
    typeof body.title === "string"
  ) {
    body.title =
      body.title.trim();
  }

  normalizeOptionalString(
    body,
    "description"
  );

  normalizeOptionalString(
    body,
    "projectUrl"
  );

  normalizeOptionalString(
    body,
    "repositoryUrl"
  );

  if (
    Array.isArray(body.technologies)
  ) {
    body.technologies =
      body.technologies.map(
        (technology) =>
          technology.trim()
      );
  }

  if (body.startDate === "") {
    body.startDate = null;
  }

  if (body.endDate === "") {
    body.endDate = null;
  }
};

const validateProjectPayload = (
  body,
  { titleRequired = false } = {}
) => {
  validateUnknownFields(body);

  validateTitle(
    body.title,
    titleRequired
  );

  validateDescription(
    body.description
  );

  validateTechnologies(
    body.technologies
  );

  validateUrl(
    body.projectUrl,
    "Project URL"
  );

  validateUrl(
    body.repositoryUrl,
    "Repository URL"
  );

  validateDate(
    body.startDate,
    "Start date"
  );

  validateDate(
    body.endDate,
    "End date"
  );

  validateDateRange(
    body.startDate,
    body.endDate
  );

  normalizeProjectData(body);
};

export const validateProjectId = (
  req,
  _res,
  next
) => {
  try {
    const { projectId } =
      req.params;

    if (
      typeof projectId !== "string" ||
      !UUID_REGEX.test(projectId)
    ) {
      throw createValidationError(
        "A valid project ID is required",
        "INVALID_PROJECT_ID"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateCreateProject = (
  req,
  _res,
  next
) => {
  try {
    validateProjectPayload(
      req.body,
      {
        titleRequired: true
      }
    );

    next();
  } catch (error) {
    next(error);
  }
};

export const validateUpdateProject = (
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
        "At least one project field is required",
        "PROJECT_UPDATE_DATA_REQUIRED"
      );
    }

    validateProjectPayload(req.body);

    next();
  } catch (error) {
    next(error);
  }
};