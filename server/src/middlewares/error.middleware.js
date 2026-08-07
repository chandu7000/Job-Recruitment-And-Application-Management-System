import multer from "multer";
import {
  ValidationError,
  UniqueConstraintError,
  DatabaseError
} from "sequelize";

import env from "../config/env.js";
import { sendError } from "../utils/apiError.js";

const formatSequelizeValidationErrors = (errors = []) => {
  return errors.map((error) => ({
    field: error.path || null,
    message: error.message,
    value: error.value ?? null
  }));
};

const getMulterErrorDetails = (error) => {
  switch (error.code) {
    case "LIMIT_FILE_SIZE":
      return {
        statusCode: 413,
        message:
          "Uploaded file exceeds the allowed size limit",
        code: "FILE_TOO_LARGE"
      };

    case "LIMIT_FILE_COUNT":
      return {
        statusCode: 400,
        message: "Only one file can be uploaded",
        code: "TOO_MANY_FILES"
      };

    case "LIMIT_FIELD_COUNT":
      return {
        statusCode: 400,
        message:
          "Unexpected form fields were provided",
        code: "TOO_MANY_FIELDS"
      };

    case "LIMIT_PART_COUNT":
      return {
        statusCode: 400,
        message:
          "Too many multipart form parts were provided",
        code: "TOO_MANY_MULTIPART_PARTS"
      };

    case "LIMIT_UNEXPECTED_FILE":
      return {
        statusCode: 400,
        message: error.field
          ? `Unexpected file field: ${error.field}`
          : "Unexpected file field",
        code: "UNEXPECTED_FILE_FIELD"
      };

    default:
      return {
        statusCode: 400,
        message:
          "Invalid multipart upload request",
        code: "MULTIPART_UPLOAD_ERROR"
      };
  }
};

const errorMiddleware = (
  error,
  req,
  res,
  next
) => {
  void next;

  let statusCode =
    error.statusCode || 500;

  let message =
    error.message || "Internal server error";

  let code =
    error.code || "INTERNAL_SERVER_ERROR";

  let errors =
    error.errors || [];

  if (error instanceof multer.MulterError) {
    const multerError =
      getMulterErrorDetails(error);

    statusCode = multerError.statusCode;
    message = multerError.message;
    code = multerError.code;

    errors = error.field
      ? [
        {
          field: error.field,
          message: multerError.message
        }
      ]
      : [];
  } else if (
    error instanceof UniqueConstraintError
  ) {
    statusCode = 409;
    message =
      "A record with the provided information already exists";
    code = "DUPLICATE_RESOURCE";
    errors =
      formatSequelizeValidationErrors(
        error.errors
      );
  } else if (
    error instanceof ValidationError
  ) {
    statusCode = 422;
    message = "Database validation failed";
    code = "DATABASE_VALIDATION_ERROR";
    errors =
      formatSequelizeValidationErrors(
        error.errors
      );
  } else if (
    error instanceof DatabaseError
  ) {
    statusCode = 500;
    message = "A database operation failed";
    code = "DATABASE_ERROR";
    errors = [];
  } else if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    "body" in error
  ) {
    statusCode = 400;
    message =
      "Request body contains invalid JSON";
    code = "INVALID_JSON";
    errors = [];
  }

  if (!env.isProduction) {
    console.error({
      requestId: req.requestId || null,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      code,
      message: error.message,
      stack: error.stack
    });
  } else if (statusCode >= 500) {
    console.error({
      requestId: req.requestId || null,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      code,
      message: "Internal server error"
    });
  }

  if (
    env.isProduction &&
    statusCode >= 500
  ) {
    message = "Internal server error";
    errors = [];
  }

  return sendError(
    res,
    statusCode,
    message,
    code,
    errors
  );
};

export default errorMiddleware;