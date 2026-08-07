import { sequelize } from "../config/database.js";

import {
  findOrCreateJobSeekerProfile
} from "../repositories/jobSeekerProfile.repository.js";

import {
  createJobSeekerSkill,
  findJobSeekerSkillsByProfileId,
  findJobSeekerSkillByIdAndProfileId,
  findJobSeekerSkillByNameAndProfileId,
  updateJobSeekerSkill,
  deleteJobSeekerSkill,
  countJobSeekerSkillsByProfileId
} from "../repositories/jobSeekerSkill.repository.js";

import AppError from "../utils/AppError.js";

const MAX_SKILLS = 30;

const normalizeSkillName = (skillName) => {
  return skillName
    .trim()
    .replace(/\s+/g, " ");
};

const getMySkills = async ({
  userId
}) => {
  const result =
    await findOrCreateJobSeekerProfile(
      userId
    );

  return findJobSeekerSkillsByProfileId(
    result.profile.id
  );
};

const addMySkill = async ({
  userId,
  skillName
}) => {
  const normalizedSkillName =
    normalizeSkillName(skillName);

  return sequelize.transaction(
    async (transaction) => {
      const result =
        await findOrCreateJobSeekerProfile(
          userId,
          {
            transaction
          }
        );

      const profileId =
        result.profile.id;

      const skillCount =
        await countJobSeekerSkillsByProfileId(
          profileId,
          {
            transaction
          }
        );

      if (skillCount >= MAX_SKILLS) {
        throw new AppError(
          `A job seeker can have a maximum of ${MAX_SKILLS} skills.`,
          400,
          "JOB_SEEKER_SKILL_LIMIT_REACHED"
        );
      }

      const existingSkill =
        await findJobSeekerSkillByNameAndProfileId(
          normalizedSkillName,
          profileId,
          {
            transaction
          }
        );

      if (existingSkill) {
        throw new AppError(
          "This skill already exists in your profile.",
          409,
          "JOB_SEEKER_SKILL_ALREADY_EXISTS"
        );
      }

      return createJobSeekerSkill(
        {
          jobSeekerProfileId: profileId,
          skillName: normalizedSkillName
        },
        {
          transaction
        }
      );
    }
  );
};

const updateMySkill = async ({
  userId,
  skillId,
  skillName
}) => {
  const normalizedSkillName =
    normalizeSkillName(skillName);

  return sequelize.transaction(
    async (transaction) => {
      const result =
        await findOrCreateJobSeekerProfile(
          userId,
          {
            transaction
          }
        );

      const profileId =
        result.profile.id;

      const skill =
        await findJobSeekerSkillByIdAndProfileId(
          skillId,
          profileId,
          {
            transaction,
            lock: transaction.LOCK.UPDATE
          }
        );

      if (!skill) {
        throw new AppError(
          "Skill not found.",
          404,
          "JOB_SEEKER_SKILL_NOT_FOUND"
        );
      }

      const duplicateSkill =
        await findJobSeekerSkillByNameAndProfileId(
          normalizedSkillName,
          profileId,
          {
            transaction
          }
        );

      if (
        duplicateSkill &&
        duplicateSkill.id !== skill.id
      ) {
        throw new AppError(
          "This skill already exists in your profile.",
          409,
          "JOB_SEEKER_SKILL_ALREADY_EXISTS"
        );
      }

      return updateJobSeekerSkill(
        skill,
        {
          skillName: normalizedSkillName
        },
        {
          transaction
        }
      );
    }
  );
};

const removeMySkill = async ({
  userId,
  skillId
}) => {
  return sequelize.transaction(
    async (transaction) => {
      const result =
        await findOrCreateJobSeekerProfile(
          userId,
          {
            transaction
          }
        );

      const skill =
        await findJobSeekerSkillByIdAndProfileId(
          skillId,
          result.profile.id,
          {
            transaction,
            lock: transaction.LOCK.UPDATE
          }
        );

      if (!skill) {
        throw new AppError(
          "Skill not found.",
          404,
          "JOB_SEEKER_SKILL_NOT_FOUND"
        );
      }

      await deleteJobSeekerSkill(
        skill,
        {
          transaction
        }
      );
    }
  );
};

export {
  getMySkills,
  addMySkill,
  updateMySkill,
  removeMySkill
};