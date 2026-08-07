import {
  getMySkills,
  addMySkill,
  updateMySkill,
  removeMySkill
} from "../services/jobSeekerSkill.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";

const getMyJobSeekerSkills = async (
  req,
  res,
  next
) => {
  try {
    const skills =
      await getMySkills({
        userId: req.user.id
      });

    return sendSuccess(
      res,
      200,
      "Job seeker skills fetched successfully.",
      skills
    );
  } catch (error) {
    next(error);
  }
};

const addMyJobSeekerSkill = async (
  req,
  res,
  next
) => {
  try {
    const skill =
      await addMySkill({
        userId: req.user.id,
        skillName: req.body.skillName
      });

    return sendSuccess(
      res,
      201,
      "Skill added successfully.",
      skill
    );
  } catch (error) {
    next(error);
  }
};

const updateMyJobSeekerSkill = async (
  req,
  res,
  next
) => {
  try {
    const skill =
      await updateMySkill({
        userId: req.user.id,
        skillId: req.params.skillId,
        skillName: req.body.skillName
      });

    return sendSuccess(
      res,
      200,
      "Skill updated successfully.",
      skill
    );
  } catch (error) {
    next(error);
  }
};

const deleteMyJobSeekerSkill = async (
  req,
  res,
  next
) => {
  try {
    await removeMySkill({
      userId: req.user.id,
      skillId: req.params.skillId
    });

    return sendSuccess(
      res,
      200,
      "Skill deleted successfully."
    );
  } catch (error) {
    next(error);
  }
};

export {
  getMyJobSeekerSkills,
  addMyJobSeekerSkill,
  updateMyJobSeekerSkill,
  deleteMyJobSeekerSkill
};