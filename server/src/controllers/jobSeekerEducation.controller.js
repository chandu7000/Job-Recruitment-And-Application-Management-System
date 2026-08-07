import {
  getMyEducations,
  addMyEducation,
  updateMyEducation,
  removeMyEducation
} from "../services/jobSeekerEducation.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";

const getMyJobSeekerEducations = async (
  req,
  res,
  next
) => {
  try {
    const educations =
      await getMyEducations({
        userId: req.user.id
      });

    return sendSuccess(
      res,
      200,
      "Education entries fetched successfully.",
      educations
    );
  } catch (error) {
    next(error);
  }
};

const addMyJobSeekerEducation = async (
  req,
  res,
  next
) => {
  try {
    const education =
      await addMyEducation({
        userId: req.user.id,
        educationData: req.body
      });

    return sendSuccess(
      res,
      201,
      "Education entry added successfully.",
      education
    );
  } catch (error) {
    next(error);
  }
};

const updateMyJobSeekerEducation = async (
  req,
  res,
  next
) => {
  try {
    const education =
      await updateMyEducation({
        userId: req.user.id,
        educationId:
          req.params.educationId,
        educationData: req.body
      });

    return sendSuccess(
      res,
      200,
      "Education entry updated successfully.",
      education
    );
  } catch (error) {
    next(error);
  }
};

const deleteMyJobSeekerEducation = async (
  req,
  res,
  next
) => {
  try {
    await removeMyEducation({
      userId: req.user.id,
      educationId:
        req.params.educationId
    });

    return sendSuccess(
      res,
      200,
      "Education entry deleted successfully."
    );
  } catch (error) {
    next(error);
  }
};

export {
  getMyJobSeekerEducations,
  addMyJobSeekerEducation,
  updateMyJobSeekerEducation,
  deleteMyJobSeekerEducation
};