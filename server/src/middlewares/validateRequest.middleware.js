import { validationResult } from "express-validator";

import { sendError } from "../utils/apiError.js";

const validateRequest = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (validationErrors.isEmpty()) {
    return next();
  }

  const errors = validationErrors.array().map((error) => ({
    field: error.path || null,
    location: error.location || null,
    message: error.msg,
    value: error.value ?? null
  }));

  return sendError(
    res,
    422,
    "Request validation failed",
    "VALIDATION_ERROR",
    errors
  );
};

export default validateRequest;