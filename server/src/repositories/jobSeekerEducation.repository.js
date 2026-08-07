import JobSeekerEducation from
  "../models/jobSeekerEducation.model.js";

const createJobSeekerEducation = async (
  educationData,
  { transaction } = {}
) => {
  return JobSeekerEducation.create(
    educationData,
    {
      transaction
    }
  );
};

const findJobSeekerEducationsByProfileId =
  async (
    jobSeekerProfileId,
    { transaction } = {}
  ) => {
    return JobSeekerEducation.findAll({
      where: {
        jobSeekerProfileId
      },
      order: [
        ["startDate", "DESC"],
        ["createdAt", "DESC"]
      ],
      transaction
    });
  };

const findJobSeekerEducationByIdAndProfileId =
  async (
    educationId,
    jobSeekerProfileId,
    { transaction, lock } = {}
  ) => {
    return JobSeekerEducation.findOne({
      where: {
        id: educationId,
        jobSeekerProfileId
      },
      transaction,
      lock
    });
  };

const updateJobSeekerEducation = async (
  education,
  educationData,
  { transaction } = {}
) => {
  await education.update(
    educationData,
    {
      transaction
    }
  );

  return education;
};

const deleteJobSeekerEducation = async (
  education,
  { transaction } = {}
) => {
  await education.destroy({
    transaction
  });
};

export {
  createJobSeekerEducation,
  findJobSeekerEducationsByProfileId,
  findJobSeekerEducationByIdAndProfileId,
  updateJobSeekerEducation,
  deleteJobSeekerEducation
};