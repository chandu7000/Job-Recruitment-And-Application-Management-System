import {
  createRecruiterProfile,
  findRecruiterProfileByUserId,
  updateRecruiterProfileByUserId
} from "../repositories/recruiterProfile.repository.js";

import AppError from "../utils/AppError.js";

const getRecruiterProfile = async ({
  userId
}) => {
  const existingProfile =
    await findRecruiterProfileByUserId(
      userId
    );

  if (existingProfile) {
    return existingProfile;
  }

  try {
    return await createRecruiterProfile({
      userId
    });
  } catch (error) {
    if (
      error.name ===
      "SequelizeUniqueConstraintError"
    ) {
      const profile =
        await findRecruiterProfileByUserId(
          userId
        );

      if (profile) {
        return profile;
      }
    }

    throw new AppError(
      "Unable to create recruiter profile.",
      500,
      "RECRUITER_PROFILE_CREATION_FAILED"
    );
  }
};

const updateRecruiterProfile = async ({
  userId,
  profileData
}) => {
  let profile =
    await updateRecruiterProfileByUserId(
      userId,
      profileData
    );

  if (!profile) {
    try {
      await createRecruiterProfile({
        userId
      });
    } catch (error) {
      if (
        error.name !==
        "SequelizeUniqueConstraintError"
      ) {
        throw new AppError(
          "Unable to create recruiter profile.",
          500,
          "RECRUITER_PROFILE_CREATION_FAILED"
        );
      }
    }

    profile =
      await updateRecruiterProfileByUserId(
        userId,
        profileData
      );
  }

  if (!profile) {
    throw new AppError(
      "Unable to create or update recruiter profile.",
      500,
      "RECRUITER_PROFILE_UPDATE_FAILED"
    );
  }

  return profile;
};

const validateRecruiterProfileOwnership = ({
  authenticatedUserId,
  profileUserId
}) => {
  if (
    Number(authenticatedUserId) !==
    Number(profileUserId)
  ) {
    throw new AppError(
      "You are not allowed to access this recruiter profile.",
      403,
      "RECRUITER_PROFILE_ACCESS_FORBIDDEN"
    );
  }

  return true;
};

export {
  getRecruiterProfile,
  updateRecruiterProfile,
  validateRecruiterProfileOwnership
};