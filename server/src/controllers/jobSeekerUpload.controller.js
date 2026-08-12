import { Readable } from "node:stream";

import {
  uploadJobSeekerProfileImage,
  uploadJobSeekerResume,
  getJobSeekerResume,
  deleteJobSeekerProfileImage,
  deleteJobSeekerResume
} from "../services/jobSeekerUpload.service.js";

import { sendSuccess } from "../utils/apiResponse.js";

const getResumeContentType = (
  fileName
) => {
  const normalized =
    fileName.toLowerCase();

  if (
    normalized.endsWith(".pdf")
  ) {
    return "application/pdf";
  }

  if (
    normalized.endsWith(".doc")
  ) {
    return "application/msword";
  }

  if (
    normalized.endsWith(".docx")
  ) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  return "application/octet-stream";
};

const sanitizeFileName = (
  fileName
) => {
  return fileName
    .replace(/[\r\n"]/g, "")
    .trim() || "resume";
};

const streamResume = async (
  req,
  res,
  disposition
) => {
  const {
    resumeUrl,
    resumeOriginalName
  } = await getJobSeekerResume(
    req.user.id
  );

  const safeFileName =
    sanitizeFileName(
      resumeOriginalName
    );

  if (
    disposition === "inline" &&
    !safeFileName
      .toLowerCase()
      .endsWith(".pdf")
  ) {
    const error = new Error(
      "Only PDF resumes can be previewed in the browser"
    );

    error.statusCode = 415;
    error.code =
      "RESUME_PREVIEW_UNSUPPORTED";

    throw error;
  }

  const upstreamResponse =
    await fetch(resumeUrl);

  if (
    !upstreamResponse.ok ||
    !upstreamResponse.body
  ) {
    const error = new Error(
      "Unable to retrieve resume"
    );

    error.statusCode = 502;
    error.code =
      "RESUME_RETRIEVAL_FAILED";

    throw error;
  }

  const contentType =
    getResumeContentType(
      safeFileName
    );

  res.status(200);

  res.setHeader(
    "Content-Type",
    contentType
  );

  res.setHeader(
    "Content-Disposition",
    `${disposition}; filename="${safeFileName}"`
  );

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );

  const contentLength =
    upstreamResponse.headers.get(
      "content-length"
    );

  if (contentLength) {
    res.setHeader(
      "Content-Length",
      contentLength
    );
  }

  Readable.fromWeb(
    upstreamResponse.body
  ).pipe(res);
};

const uploadProfileImage = async (
  req,
  res,
  next
) => {
  try {
    const profile =
      await uploadJobSeekerProfileImage(
        req.user.id,
        req.file
      );

    return sendSuccess(
      res,
      200,
      "Profile image uploaded successfully",
      {
        profileImageUrl:
          profile.profileImageUrl,

        profileImagePublicId:
          profile.profileImagePublicId
      }
    );
  } catch (error) {
    return next(error);
  }
};

const uploadResume = async (
  req,
  res,
  next
) => {
  try {
    const profile =
      await uploadJobSeekerResume(
        req.user.id,
        req.file
      );

    return sendSuccess(
      res,
      200,
      "Resume uploaded successfully",
      {
        resumeUrl:
          profile.resumeUrl,

        resumePublicId:
          profile.resumePublicId,

        resumeOriginalName:
          profile.resumeOriginalName
      }
    );
  } catch (error) {
    return next(error);
  }
};

const viewResume = async (
  req,
  res,
  next
) => {
  try {
    await streamResume(
      req,
      res,
      "inline"
    );
  } catch (error) {
    return next(error);
  }
};

const downloadResume = async (
  req,
  res,
  next
) => {
  try {
    await streamResume(
      req,
      res,
      "attachment"
    );
  } catch (error) {
    return next(error);
  }
};

const deleteProfileImage = async (
  req,
  res,
  next
) => {
  try {
    await deleteJobSeekerProfileImage(
      req.user.id
    );

    return sendSuccess(
      res,
      200,
      "Profile image deleted successfully",
      {}
    );
  } catch (error) {
    return next(error);
  }
};

const deleteResume = async (
  req,
  res,
  next
) => {
  try {
    await deleteJobSeekerResume(
      req.user.id
    );

    return sendSuccess(
      res,
      200,
      "Resume deleted successfully",
      {}
    );
  } catch (error) {
    return next(error);
  }
};

export {
  uploadProfileImage,
  uploadResume,
  viewResume,
  downloadResume,
  deleteProfileImage,
  deleteResume
};