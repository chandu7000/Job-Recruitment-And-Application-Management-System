import JobSeekerSkill from
  "../models/jobSeekerSkill.model.js";

const createJobSeekerSkill = async (
  skillData,
  { transaction } = {}
) => {
  return JobSeekerSkill.create(
    skillData,
    {
      transaction
    }
  );
};

const findJobSeekerSkillsByProfileId =
  async (
    jobSeekerProfileId,
    { transaction } = {}
  ) => {
    return JobSeekerSkill.findAll({
      where: {
        jobSeekerProfileId
      },
      order: [
        ["skillName", "ASC"]
      ],
      transaction
    });
  };

const findJobSeekerSkillByIdAndProfileId =
  async (
    skillId,
    jobSeekerProfileId,
    { transaction, lock } = {}
  ) => {
    return JobSeekerSkill.findOne({
      where: {
        id: skillId,
        jobSeekerProfileId
      },
      transaction,
      lock
    });
  };

const findJobSeekerSkillByNameAndProfileId =
  async (
    skillName,
    jobSeekerProfileId,
    { transaction } = {}
  ) => {
    return JobSeekerSkill.findOne({
      where: {
        skillName,
        jobSeekerProfileId
      },
      transaction
    });
  };

const updateJobSeekerSkill = async (
  skill,
  skillData,
  { transaction } = {}
) => {
  await skill.update(
    skillData,
    {
      transaction
    }
  );

  return skill;
};

const deleteJobSeekerSkill = async (
  skill,
  { transaction } = {}
) => {
  await skill.destroy({
    transaction
  });
};

const countJobSeekerSkillsByProfileId =
  async (
    jobSeekerProfileId,
    { transaction } = {}
  ) => {
    return JobSeekerSkill.count({
      where: {
        jobSeekerProfileId
      },
      transaction
    });
  };

export {
  createJobSeekerSkill,
  findJobSeekerSkillsByProfileId,
  findJobSeekerSkillByIdAndProfileId,
  findJobSeekerSkillByNameAndProfileId,
  updateJobSeekerSkill,
  deleteJobSeekerSkill,
  countJobSeekerSkillsByProfileId
};