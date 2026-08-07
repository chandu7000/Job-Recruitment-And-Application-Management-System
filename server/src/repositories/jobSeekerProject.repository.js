import JobSeekerProject from "../models/jobSeekerProject.model.js";

class JobSeekerProjectRepository {
  async create(projectData, options = {}) {
    return JobSeekerProject.create(projectData, options);
  }

  async findById(projectId, options = {}) {
    return JobSeekerProject.findByPk(projectId, options);
  }

  async findByIdAndProfileId(
    projectId,
    jobSeekerProfileId,
    options = {}
  ) {
    return JobSeekerProject.findOne({
      ...options,
      where: {
        id: projectId,
        jobSeekerProfileId
      }
    });
  }

  async findAllByProfileId(
    jobSeekerProfileId,
    options = {}
  ) {
    return JobSeekerProject.findAll({
      ...options,
      where: {
        jobSeekerProfileId
      },
      order: [
        ["startDate", "DESC"],
        ["createdAt", "DESC"]
      ]
    });
  }

  async update(project, projectData, options = {}) {
    return project.update(projectData, options);
  }

  async delete(project, options = {}) {
    return project.destroy(options);
  }
}

export default new JobSeekerProjectRepository();