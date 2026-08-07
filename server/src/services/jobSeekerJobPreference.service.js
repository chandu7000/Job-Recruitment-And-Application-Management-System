import {
  findJobSeekerProfileByUserId
} from "../repositories/jobSeekerProfile.repository.js";

import jobSeekerJobPreferenceRepository
  from "../repositories/jobSeekerJobPreference.repository.js";

import AppError from "../utils/AppError.js";


const DEFAULT_JOB_PREFERENCE = {
  preferredJobRoles: [],
  preferredLocations: [],
  employmentTypes: [],
  workModes: [],
  expectedSalary: null,
  salaryCurrency: "INR",
  noticePeriodDays: null,
  willingToRelocate: false,
  availabilityStatus:
    "OPEN_TO_OPPORTUNITIES"
};


class JobSeekerJobPreferenceService {

  async getProfileByUserId(userId) {

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


  async getJobPreference(userId) {

    const profile =
      await this.getProfileByUserId(
        userId
      );


    const [jobPreference] =
      await jobSeekerJobPreferenceRepository
        .findOrCreateByProfileId(
          profile.id,
          DEFAULT_JOB_PREFERENCE
        );


    return jobPreference;
  }


  async updateJobPreference(
    userId,
    data
  ) {

    const profile =
      await this.getProfileByUserId(
        userId
      );


    const [jobPreference] =
      await jobSeekerJobPreferenceRepository
        .findOrCreateByProfileId(
          profile.id,
          DEFAULT_JOB_PREFERENCE
        );


    return jobSeekerJobPreferenceRepository.update(
      jobPreference,
      data
    );
  }


  async deleteJobPreference(userId) {

    const profile =
      await this.getProfileByUserId(
        userId
      );


    const jobPreference =
      await jobSeekerJobPreferenceRepository
        .findByProfileId(
          profile.id
        );


    if (!jobPreference) {
      throw new AppError(
        "Job preference not found.",
        404,
        "JOB_PREFERENCE_NOT_FOUND"
      );
    }


    await jobSeekerJobPreferenceRepository.delete(
      jobPreference
    );


    return {
      message:
        "Job preference deleted successfully"
    };
  }
}


export default new JobSeekerJobPreferenceService();