import { sequelize } from "../config/database.js";

import {
  findOrCreateJobSeekerProfile
} from "../repositories/jobSeekerProfile.repository.js";

import {
  createJobSeekerEducation,
  findJobSeekerEducationsByProfileId,
  findJobSeekerEducationByIdAndProfileId,
  updateJobSeekerEducation,
  deleteJobSeekerEducation
} from "../repositories/jobSeekerEducation.repository.js";

import AppError from "../utils/AppError.js";

const validateEducationDates = ({
  startDate,
  endDate
}) => {
  if (
    startDate &&
    endDate &&
    new Date(endDate) < new Date(startDate)
  ) {
    throw new AppError(
      "Education end date cannot be earlier than the start date.",
      400,
      "INVALID_EDUCATION_DATE_RANGE"
    );
  }
};

const getMyEducations = async ({
  userId
}) => {
  const result =
    await findOrCreateJobSeekerProfile(
      userId
    );

  return findJobSeekerEducationsByProfileId(
    result.profile.id
  );
};

const addMyEducation = async ({
  userId,
  educationData
}) => {
  validateEducationDates(
    educationData
  );

  const result =
    await findOrCreateJobSeekerProfile(
      userId
    );

  return createJobSeekerEducation({
    ...educationData,
    jobSeekerProfileId:
      result.profile.id
  });
};

const updateMyEducation = async ({
  userId,
  educationId,
  educationData
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

      const education =
        await findJobSeekerEducationByIdAndProfileId(
          educationId,
          result.profile.id,
          {
            transaction,
            lock: transaction.LOCK.UPDATE
          }
        );

      if (!education) {
        throw new AppError(
          "Education entry not found.",
          404,
          "JOB_SEEKER_EDUCATION_NOT_FOUND"
        );
      }

      const finalStartDate =
        educationData.startDate ??
        education.startDate;

      const finalEndDate =
        Object.prototype.hasOwnProperty.call(
          educationData,
          "endDate"
        )
          ? educationData.endDate
          : education.endDate;

      validateEducationDates({
        startDate: finalStartDate,
        endDate: finalEndDate
      });

      return updateJobSeekerEducation(
        education,
        educationData,
        {
          transaction
        }
      );
    }
  );
};

const removeMyEducation = async ({
  userId,
  educationId
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

      const education =
        await findJobSeekerEducationByIdAndProfileId(
          educationId,
          result.profile.id,
          {
            transaction,
            lock: transaction.LOCK.UPDATE
          }
        );

      if (!education) {
        throw new AppError(
          "Education entry not found.",
          404,
          "JOB_SEEKER_EDUCATION_NOT_FOUND"
        );
      }

      await deleteJobSeekerEducation(
        education,
        {
          transaction
        }
      );
    }
  );
};

export {
  getMyEducations,
  addMyEducation,
  updateMyEducation,
  removeMyEducation
};