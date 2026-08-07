import bcrypt from "bcrypt";

import AppError from "./AppError.js";

const PASSWORD_SALT_ROUNDS = 12;

const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 72
};

const validatePasswordStrength = (password) => {
  if (typeof password !== "string") {
    throw new AppError(
      "Password must be a valid string.",
      400,
      "INVALID_PASSWORD"
    );
  }

  if (password.length < PASSWORD_RULES.minLength) {
    throw new AppError(
      `Password must contain at least ${PASSWORD_RULES.minLength} characters.`,
      400,
      "WEAK_PASSWORD"
    );
  }

  if (password.length > PASSWORD_RULES.maxLength) {
    throw new AppError(
      `Password must not exceed ${PASSWORD_RULES.maxLength} characters.`,
      400,
      "PASSWORD_TOO_LONG"
    );
  }

  if (!/[A-Z]/.test(password)) {
    throw new AppError(
      "Password must contain at least one uppercase letter.",
      400,
      "WEAK_PASSWORD"
    );
  }

  if (!/[a-z]/.test(password)) {
    throw new AppError(
      "Password must contain at least one lowercase letter.",
      400,
      "WEAK_PASSWORD"
    );
  }

  if (!/\d/.test(password)) {
    throw new AppError(
      "Password must contain at least one number.",
      400,
      "WEAK_PASSWORD"
    );
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    throw new AppError(
      "Password must contain at least one special character.",
      400,
      "WEAK_PASSWORD"
    );
  }

  return true;
};

const hashPassword = async (password) => {
  validatePasswordStrength(password);

  return bcrypt.hash(
    password,
    PASSWORD_SALT_ROUNDS
  );
};

const comparePassword = async (
  plainPassword,
  passwordHash
) => {
  if (
    typeof plainPassword !== "string" ||
    typeof passwordHash !== "string"
  ) {
    return false;
  }

  return bcrypt.compare(
    plainPassword,
    passwordHash
  );
};

export {
  PASSWORD_RULES,
  validatePasswordStrength,
  hashPassword,
  comparePassword
};