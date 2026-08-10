import multer from "multer";

const storage = multer.memoryStorage();

const createUploadMiddleware = ({
  maximumFileSize,
  allowedFieldName
}) => {
  return multer({
    storage,

    limits: {
      fileSize: maximumFileSize,
      files: 1,
      fields: 0
    },

    fileFilter(req, file, callback) {
      void req;

      if (file.fieldname !== allowedFieldName) {
        const error = new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          file.fieldname
        );

        return callback(error);
      }

      return callback(null, true);
    }
  });
};

export const uploadProfileImage =
  createUploadMiddleware({
    maximumFileSize: 5 * 1024 * 1024,
    allowedFieldName: "profileImage"
  }).single("profileImage");

export const uploadResume =
  createUploadMiddleware({
    maximumFileSize: 10 * 1024 * 1024,
    allowedFieldName: "resume"
  }).single("resume");

export const uploadCompanyLogo =
  createUploadMiddleware({
    maximumFileSize: 5 * 1024 * 1024,
    allowedFieldName: "companyLogo"
  }).single("companyLogo");