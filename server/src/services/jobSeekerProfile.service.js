import {
  findJobSeekerProfileByUserId,
  findOrCreateJobSeekerProfile,
  updateJobSeekerProfileByUserId
} from "../repositories/jobSeekerProfile.repository.js";

import AppError from "../utils/AppError.js";

const getJobSeekerProfile = async ({
  userId
}) => {
  const existingProfile =
    await findJobSeekerProfileByUserId(
      userId
    );

  if (existingProfile) {
    return existingProfile;
  }

  const result =
    await findOrCreateJobSeekerProfile(
      userId
    );

  return result.profile;
};

const updateJobSeekerProfile = async ({
  userId,
  profileData
}) => {
  let profile =
    await updateJobSeekerProfileByUserId(
      userId,
      profileData
    );

  if (!profile) {
    const result =
      await findOrCreateJobSeekerProfile(
        userId
      );

    profile =
      await updateJobSeekerProfileByUserId(
        userId,
        profileData
      );

    if (!result.profile || !profile) {
      throw new AppError(
        "Unable to create or update job seeker profile.",
        500,
        "JOB_SEEKER_PROFILE_UPDATE_FAILED"
      );
    }
  }

  return profile;
};

export {
  getJobSeekerProfile,
  updateJobSeekerProfile
};