const DANGEROUS_KEYS = new Set([
  "__proto__", "prototype", "constructor",
  "passwordHash", "refreshTokenHash", "tokenHash",
  "ownerId", "createdBy", "reporterId",
  "reviewedBy", "removedBy", "restoredBy",
  "emailVerified", "emailVerifiedAt", "applicationCount",
  "viewCount", "deletedAt", "createdAt", "updatedAt"
]);

const hasDangerousKey = (value, depth = 0) => {
  if (depth > 12 || value === null || typeof value !== "object") return false;
  for (const [key, nestedValue] of Object.entries(value)) {
    if (DANGEROUS_KEYS.has(key)) return true;
    if (hasDangerousKey(nestedValue, depth + 1)) return true;
  }
  return false;
};

const pickAllowedFields = (source = {}, allowedFields = []) =>
  allowedFields.reduce((result, field) => {
    if (Object.prototype.hasOwnProperty.call(source, field)) result[field] = source[field];
    return result;
  }, {});

const escapeLikePattern = (value = "") =>
  String(value).replace(/[\\%_]/g, "\\$&");

const normalizeSortDirection = (value, fallback = "DESC") => {
  const direction = String(value || fallback).toUpperCase();
  return direction === "ASC" || direction === "DESC" ? direction : fallback;
};

const normalizeSortField = (value, allowedFields, fallback) =>
  allowedFields.includes(value) ? value : fallback;

const SENSITIVE_RESPONSE_KEYS = new Set([
  "password", "passwordHash", "refreshTokenHash", "tokenHash",
  "emailVerificationToken", "emailVerificationTokenHash",
  "passwordResetToken", "passwordResetTokenHash",
  "emailChangeToken", "emailChangeTokenHash",
  "sessionHash", "cookie", "cookies", "smtpPassword",
  "apiSecret", "clientSecret"
]);

const removeSensitiveFields = (value) => {
  if (Array.isArray(value)) return value.map(removeSensitiveFields);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !SENSITIVE_RESPONSE_KEYS.has(key))
    .map(([key, nestedValue]) => [key, removeSensitiveFields(nestedValue)]));
};

export {
  DANGEROUS_KEYS,
  hasDangerousKey,
  pickAllowedFields,
  escapeLikePattern,
  normalizeSortDirection,
  normalizeSortField,
  removeSensitiveFields
};
