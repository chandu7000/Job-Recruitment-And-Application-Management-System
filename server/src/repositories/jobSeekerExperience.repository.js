import JobSeekerExperience from
  "../models/jobSeekerExperience.model.js";

const createJobSeekerExperience = async (
  experienceData,
  { transaction } = {}
) => {
  return JobSeekerExperience.create(
    experienceData,
    {
      transaction
    }
  );
};

const findJobSeekerExperiencesByProfileId =
  async (
    jobSeekerProfileId,
    { transaction } = {}
  ) => {
    return JobSeekerExperience.findAll({
      where: {
        jobSeekerProfileId
      },
      order: [
        ["isCurrent", "DESC"],
        ["startDate", "DESC"],
        ["createdAt", "DESC"]
      ],
      transaction
    });
  };

const findJobSeekerExperienceByIdAndProfileId =
  async (
    experienceId,
    jobSeekerProfileId,
    { transaction, lock } = {}
  ) => {
    return JobSeekerExperience.findOne({
      where: {
        id: experienceId,
        jobSeekerProfileId
      },
      transaction,
      lock
    });
  };

const updateJobSeekerExperience = async (
  experience,
  experienceData,
  { transaction } = {}
) => {
  await experience.update(
    experienceData,
    {
      transaction
    }
  );

  return experience;
};

const deleteJobSeekerExperience = async (
  experience,
  { transaction } = {}
) => {
  await experience.destroy({
    transaction
  });
};

export {
  createJobSeekerExperience,
  findJobSeekerExperiencesByProfileId,
  findJobSeekerExperienceByIdAndProfileId,
  updateJobSeekerExperience,
  deleteJobSeekerExperience
};