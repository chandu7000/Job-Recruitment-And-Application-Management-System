import { sequelize } from "../config/database.js";

import {
  findOrCreateJobSeekerProfile
} from "../repositories/jobSeekerProfile.repository.js";

import {
  createJobSeekerExperience,
  findJobSeekerExperiencesByProfileId,
  findJobSeekerExperienceByIdAndProfileId,
  updateJobSeekerExperience,
  deleteJobSeekerExperience
} from "../repositories/jobSeekerExperience.repository.js";

import AppError from "../utils/AppError.js";

const validateExperienceDates = ({
  startDate,
  endDate,
  isCurrent
}) => {
  if (isCurrent && endDate) {
    throw new AppError(
      "Current employment cannot have an end date.",
      400,
      "CURRENT_EXPERIENCE_END_DATE_NOT_ALLOWED"
    );
  }

  if (
    startDate &&
    endDate &&
    new Date(endDate) < new Date(startDate)
  ) {
    throw new AppError(
      "Experience end date cannot be earlier than the start date.",
      400,
      "INVALID_EXPERIENCE_DATE_RANGE"
    );
  }
};

const getMyExperiences = async ({
  userId
}) => {
  const result =
    await findOrCreateJobSeekerProfile(
      userId
    );

  return findJobSeekerExperiencesByProfileId(
    result.profile.id
  );
};

const addMyExperience = async ({
  userId,
  experienceData
}) => {
  const normalizedExperienceData = {
    ...experienceData,
    endDate: experienceData.isCurrent
      ? null
      : experienceData.endDate ?? null
  };

  validateExperienceDates(
    normalizedExperienceData
  );

  const result =
    await findOrCreateJobSeekerProfile(
      userId
    );

  return createJobSeekerExperience({
    ...normalizedExperienceData,
    jobSeekerProfileId:
      result.profile.id
  });
};

const updateMyExperience = async ({
  userId,
  experienceId,
  experienceData
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

      const experience =
        await findJobSeekerExperienceByIdAndProfileId(
          experienceId,
          result.profile.id,
          {
            transaction,
            lock: transaction.LOCK.UPDATE
          }
        );

      if (!experience) {
        throw new AppError(
          "Experience entry not found.",
          404,
          "JOB_SEEKER_EXPERIENCE_NOT_FOUND"
        );
      }

      const finalStartDate =
        experienceData.startDate ??
        experience.startDate;

      const finalIsCurrent =
        Object.prototype.hasOwnProperty.call(
          experienceData,
          "isCurrent"
        )
          ? experienceData.isCurrent
          : experience.isCurrent;

      let finalEndDate =
        Object.prototype.hasOwnProperty.call(
          experienceData,
          "endDate"
        )
          ? experienceData.endDate
          : experience.endDate;

      if (finalIsCurrent) {
        finalEndDate = null;
      }

      validateExperienceDates({
        startDate: finalStartDate,
        endDate: finalEndDate,
        isCurrent: finalIsCurrent
      });

      const normalizedExperienceData = {
        ...experienceData
      };

      if (finalIsCurrent) {
        normalizedExperienceData.endDate =
          null;
      }

      return updateJobSeekerExperience(
        experience,
        normalizedExperienceData,
        {
          transaction
        }
      );
    }
  );
};

const removeMyExperience = async ({
  userId,
  experienceId
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

      const experience =
        await findJobSeekerExperienceByIdAndProfileId(
          experienceId,
          result.profile.id,
          {
            transaction,
            lock: transaction.LOCK.UPDATE
          }
        );

      if (!experience) {
        throw new AppError(
          "Experience entry not found.",
          404,
          "JOB_SEEKER_EXPERIENCE_NOT_FOUND"
        );
      }

      await deleteJobSeekerExperience(
        experience,
        {
          transaction
        }
      );
    }
  );
};

export {
  getMyExperiences,
  addMyExperience,
  updateMyExperience,
  removeMyExperience
};