import {
  getRecruiterProfile,
  updateRecruiterProfile
} from "../services/recruiterProfile.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";

const getMyRecruiterProfile = async (
  req,
  res,
  next
) => {
  try {
    const profile =
      await getRecruiterProfile({
        userId: req.user.id
      });

    return sendSuccess(
      res,
      200,
      "Recruiter profile fetched successfully.",
      profile
    );
  } catch (error) {
    next(error);
  }
};

const updateMyRecruiterProfile = async (
  req,
  res,
  next
) => {
  try {
    const profile =
      await updateRecruiterProfile({
        userId: req.user.id,
        profileData: req.body
      });

    return sendSuccess(
      res,
      200,
      "Recruiter profile updated successfully.",
      profile
    );
  } catch (error) {
    next(error);
  }
};

export {
  getMyRecruiterProfile,
  updateMyRecruiterProfile
};