import {
  getMyExperiences,
  addMyExperience,
  updateMyExperience,
  removeMyExperience
} from "../services/jobSeekerExperience.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";

const getMyJobSeekerExperiences = async (
  req,
  res,
  next
) => {
  try {
    const experiences =
      await getMyExperiences({
        userId: req.user.id
      });

    return sendSuccess(
      res,
      200,
      "Experience entries fetched successfully.",
      experiences
    );
  } catch (error) {
    next(error);
  }
};

const addMyJobSeekerExperience = async (
  req,
  res,
  next
) => {
  try {
    const experience =
      await addMyExperience({
        userId: req.user.id,
        experienceData: req.body
      });

    return sendSuccess(
      res,
      201,
      "Experience entry added successfully.",
      experience
    );
  } catch (error) {
    next(error);
  }
};

const updateMyJobSeekerExperience = async (
  req,
  res,
  next
) => {
  try {
    const experience =
      await updateMyExperience({
        userId: req.user.id,
        experienceId:
          req.params.experienceId,
        experienceData: req.body
      });

    return sendSuccess(
      res,
      200,
      "Experience entry updated successfully.",
      experience
    );
  } catch (error) {
    next(error);
  }
};

const deleteMyJobSeekerExperience = async (
  req,
  res,
  next
) => {
  try {
    await removeMyExperience({
      userId: req.user.id,
      experienceId:
        req.params.experienceId
    });

    return sendSuccess(
      res,
      200,
      "Experience entry deleted successfully."
    );
  } catch (error) {
    next(error);
  }
};

export {
  getMyJobSeekerExperiences,
  addMyJobSeekerExperience,
  updateMyJobSeekerExperience,
  deleteMyJobSeekerExperience
};