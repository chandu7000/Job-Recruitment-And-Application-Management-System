import {
  getJobSeekerProfile,
  updateJobSeekerProfile
} from "../services/jobSeekerProfile.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";

const getMyJobSeekerProfile = async (
  req,
  res,
  next
) => {
  try {
    const profile =
      await getJobSeekerProfile({
        userId: req.user.id
      });

    return sendSuccess(
      res,
      200,
      "Job seeker profile fetched successfully.",
      profile
    );
  } catch (error) {
    next(error);
  }
};

const updateMyJobSeekerProfile = async (
  req,
  res,
  next
) => {
  try {
    const profile =
      await updateJobSeekerProfile({
        userId: req.user.id,
        profileData: req.body
      });

    return sendSuccess(
      res,
      200,
      "Job seeker profile updated successfully.",
      profile
    );
  } catch (error) {
    next(error);
  }
};

const updateMyHeadlineBiography = async (
  req,
  res,
  next
) => {
  try {
    const profile =
      await updateJobSeekerProfile({
        userId: req.user.id,
        profileData: req.body
      });

    return sendSuccess(
      res,
      200,
      "Headline and biography updated successfully.",
      profile
    );
  } catch (error) {
    next(error);
  }
};

export {
  getMyJobSeekerProfile,
  updateMyJobSeekerProfile,
  updateMyHeadlineBiography,
};