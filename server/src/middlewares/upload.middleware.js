import multer from "multer";

const storage = multer.memoryStorage();


const profileImageFilter = (
  req,
  file,
  callback
) => {

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];


  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    return callback(
      null,
      true
    );
  }


  const error = new Error(
    "Only JPG, JPEG, PNG and WEBP images are allowed"
  );

  error.code =
    "INVALID_PROFILE_IMAGE_TYPE";

  callback(
    error,
    false
  );
};



const resumeFilter = (
  req,
  file,
  callback
) => {

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];


  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    return callback(
      null,
      true
    );
  }


  const error = new Error(
    "Only PDF, DOC and DOCX resume files are allowed"
  );

  error.code =
    "INVALID_RESUME_TYPE";

  callback(
    error,
    false
  );
};



const uploadProfileImage =
  multer({

    storage,

    limits: {
      fileSize:
        5 * 1024 * 1024,

      files: 1
    },

    fileFilter:
      profileImageFilter

  })
    .single(
      "profileImage"
    );



const uploadResume =
  multer({

    storage,

    limits: {
      fileSize:
        10 * 1024 * 1024,

      files: 1
    },

    fileFilter:
      resumeFilter

  })
    .single(
      "resume"
    );

export {
  uploadProfileImage,
  uploadResume
};