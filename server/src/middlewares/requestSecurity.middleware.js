import AppError from "../utils/AppError.js";
import { hasDangerousKey } from "../utils/securityPolicy.js";

const MAX_QUERY_KEYS = 50;
const MAX_BODY_KEYS = 200;

const JOB_MANAGED_FIELDS = new Set([
  "status",
  "createdBy",
  "applicationCount",
  "viewCount",
  "publishedAt",
  "closedAt",
  "closureReason"
]);

const countKeys = (value, depth = 0) => {
  if (
    depth > 12 ||
    value === null ||
    typeof value !== "object"
  ) {
    return 0;
  }

  return Object.entries(value).reduce(
    (total, [, nestedValue]) =>
      total + 1 + countKeys(nestedValue, depth + 1),
    0
  );
};

const isJobRoute = (req) => {
  const requestPath =
    req.originalUrl ||
    req.url ||
    "";

  return (
    requestPath.includes("/job") ||
    requestPath.includes("/jobs")
  );
};

const omitManagedFields = (
  value,
  ignoredFields
) => {
  if (Array.isArray(value)) {
    return value.map((item) =>
      omitManagedFields(item, ignoredFields)
    );
  }

  if (
    value === null ||
    typeof value !== "object"
  ) {
    return value;
  }

  return Object.entries(value).reduce(
    (result, [key, nestedValue]) => {
      if (ignoredFields.has(key)) {
        return result;
      }

      result[key] = omitManagedFields(
        nestedValue,
        ignoredFields
      );

      return result;
    },
    {}
  );
};

const requestSecurityMiddleware = (
  req,
  res,
  next
) => {
  void res;

  const bodyForSecurityCheck =
    isJobRoute(req)
      ? omitManagedFields(
        req.body,
        JOB_MANAGED_FIELDS
      )
      : req.body;

  const containsUnsafeFields =
    hasDangerousKey(bodyForSecurityCheck) ||
    hasDangerousKey(req.query) ||
    hasDangerousKey(req.params);

  if (containsUnsafeFields) {
    return next(
      new AppError(
        "Request contains protected or unsafe fields.",
        400,
        "UNSAFE_REQUEST_FIELDS"
      )
    );
  }

  const requestIsTooComplex =
    countKeys(req.query) > MAX_QUERY_KEYS ||
    countKeys(req.body) > MAX_BODY_KEYS;

  if (requestIsTooComplex) {
    return next(
      new AppError(
        "Request payload is too complex.",
        413,
        "REQUEST_TOO_COMPLEX"
      )
    );
  }

  return next();
};

export default requestSecurityMiddleware;