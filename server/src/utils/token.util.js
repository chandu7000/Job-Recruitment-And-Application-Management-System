import crypto from "crypto";

const DEFAULT_TOKEN_BYTES = 32;
const TOKEN_HASH_ALGORITHM = "sha256";

const generateSecureToken = (
  byteLength = DEFAULT_TOKEN_BYTES
) => {
  if (
    !Number.isInteger(byteLength) ||
    byteLength < 16 ||
    byteLength > 128
  ) {
    throw new TypeError(
      "Token byte length must be an integer between 16 and 128."
    );
  }

  return crypto
    .randomBytes(byteLength)
    .toString("hex");
};

const hashToken = (token) => {
  if (
    typeof token !== "string" ||
    token.trim().length === 0
  ) {
    throw new TypeError(
      "Token must be a non-empty string."
    );
  }

  return crypto
    .createHash(TOKEN_HASH_ALGORITHM)
    .update(token)
    .digest("hex");
};

const generateTokenId = () => {
  return crypto.randomUUID();
};

const generateTokenFamilyId = () => {
  return crypto.randomUUID();
};

export {
  DEFAULT_TOKEN_BYTES,
  TOKEN_HASH_ALGORITHM,
  generateSecureToken,
  hashToken,
  generateTokenId,
  generateTokenFamilyId
};