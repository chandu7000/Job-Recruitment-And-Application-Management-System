import {
  findJobSeekerProfileByUserId
} from "../repositories/jobSeekerProfile.repository.js";

import jobSeekerProjectRepository
  from "../repositories/jobSeekerProject.repository.js";

import AppError from "../utils/AppError.js";

class JobSeekerProjectService {
  async getProfileOrThrow(userId) {
    const profile =
      await findJobSeekerProfileByUserId(
        userId
      );

    if (!profile) {
      throw new AppError(
        "Job seeker profile not found.",
        404,
        "JOB_SEEKER_PROFILE_NOT_FOUND"
      );
    }

    return profile;
  }

  async createProject(
    userId,
    projectData
  ) {
    const profile =
      await this.getProfileOrThrow(
        userId
      );

    return jobSeekerProjectRepository.create({
      jobSeekerProfileId: profile.id,
      ...projectData
    });
  }

  async getProjects(userId) {
    const profile =
      await this.getProfileOrThrow(
        userId
      );

    return jobSeekerProjectRepository
      .findAllByProfileId(
        profile.id
      );
  }

  async getProjectById(
    userId,
    projectId
  ) {
    const profile =
      await this.getProfileOrThrow(
        userId
      );

    const project =
      await jobSeekerProjectRepository
        .findByIdAndProfileId(
          projectId,
          profile.id
        );

    if (!project) {
      throw new AppError(
        "Project not found.",
        404,
        "JOB_SEEKER_PROJECT_NOT_FOUND"
      );
    }

    return project;
  }

  async updateProject(
    userId,
    projectId,
    projectData
  ) {
    const project =
      await this.getProjectById(
        userId,
        projectId
      );

    return jobSeekerProjectRepository.update(
      project,
      projectData
    );
  }

  async deleteProject(
    userId,
    projectId
  ) {
    const project =
      await this.getProjectById(
        userId,
        projectId
      );

    await jobSeekerProjectRepository.delete(
      project
    );

    return {
      message:
        "Project deleted successfully"
    };
  }
}

export default new JobSeekerProjectService();