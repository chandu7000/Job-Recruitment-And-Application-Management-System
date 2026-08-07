import {
  uploadJobSeekerProfileImage,
  uploadJobSeekerResume,
  deleteJobSeekerProfileImage,
  deleteJobSeekerResume
} from "../services/jobSeekerUpload.service.js";

import { sendSuccess } from "../utils/apiResponse.js";

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
  deleteProfileImage,
  deleteResume
};