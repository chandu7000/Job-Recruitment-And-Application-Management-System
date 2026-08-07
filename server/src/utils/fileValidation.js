import path from "node:path";

import {
  PROFILE_IMAGE,
  COMPANY_LOGO,
  RESUME
} from "../constants/upload.constants.js";

const normalizeExtension = (fileName) => {
  return path
    .extname(fileName || "")
    .toLowerCase();
};

const validateFile = (
  file,
  {
    allowedMimeTypes,
    allowedExtensions,
    maximumSize,
    fileLabel
  }
) => {
  if (!file) {
    const error = new Error(
      `${fileLabel} file is required`
    );

    error.statusCode = 400;
    error.code = "FILE_REQUIRED";

    throw error;
  }

  if (!Buffer.isBuffer(file.buffer)) {
    const error = new Error(
      `${fileLabel} file content is invalid`
    );

    error.statusCode = 400;
    error.code = "INVALID_FILE_CONTENT";

    throw error;
  }

  if (file.size <= 0) {
    const error = new Error(
      `${fileLabel} file cannot be empty`
    );

    error.statusCode = 400;
    error.code = "EMPTY_FILE";

    throw error;
  }

  if (file.size > maximumSize) {
    const error = new Error(
      `${fileLabel} exceeds the allowed size limit`
    );

    error.statusCode = 413;
    error.code = "FILE_TOO_LARGE";

    throw error;
  }

  const extension =
    normalizeExtension(file.originalname);

  if (
    !allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    const error = new Error(
      `${fileLabel} file type is not supported`
    );

    error.statusCode = 415;
    error.code = "UNSUPPORTED_FILE_TYPE";

    throw error;
  }

  if (
    !allowedExtensions.includes(
      extension
    )
  ) {
    const error = new Error(
      `${fileLabel} file extension is not supported`
    );

    error.statusCode = 415;
    error.code = "UNSUPPORTED_FILE_EXTENSION";

    throw error;
  }

  return {
    extension,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size
  };
};

export const validateProfileImage = (
  file
) => {
  return validateFile(file, {
    allowedMimeTypes:
      PROFILE_IMAGE.ALLOWED_MIME_TYPES,

    allowedExtensions:
      PROFILE_IMAGE.ALLOWED_EXTENSIONS,

    maximumSize:
      PROFILE_IMAGE.MAX_SIZE,

    fileLabel: "Profile image"
  });
};

export const validateResume = (
  file
) => {
  return validateFile(file, {
    allowedMimeTypes:
      RESUME.ALLOWED_MIME_TYPES,

    allowedExtensions:
      RESUME.ALLOWED_EXTENSIONS,

    maximumSize:
      RESUME.MAX_SIZE,

    fileLabel: "Resume"
  });
};

export const validateCompanyLogo = (
  file
) => {
  return validateFile(file, {
    allowedMimeTypes:
      COMPANY_LOGO.ALLOWED_MIME_TYPES,

    allowedExtensions:
      COMPANY_LOGO.ALLOWED_EXTENSIONS,

    maximumSize:
      COMPANY_LOGO.MAX_SIZE,

    fileLabel: "Company logo"
  });
};