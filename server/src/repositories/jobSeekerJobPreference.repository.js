import JobSeekerJobPreference
  from "../models/jobSeekerJobPreference.model.js";

class JobSeekerJobPreferenceRepository {
  async create(data, options = {}) {
    return JobSeekerJobPreference.create(
      data,
      options
    );
  }

  async findById(id, options = {}) {
    return JobSeekerJobPreference.findByPk(
      id,
      options
    );
  }

  async findByProfileId(
    jobSeekerProfileId,
    options = {}
  ) {
    return JobSeekerJobPreference.findOne({
      where: {
        jobSeekerProfileId
      },
      ...options
    });
  }

  async findOrCreateByProfileId(
    jobSeekerProfileId,
    defaults = {},
    options = {}
  ) {
    return JobSeekerJobPreference.findOrCreate({
      where: {
        jobSeekerProfileId
      },
      defaults: {
        jobSeekerProfileId,
        ...defaults
      },
      ...options
    });
  }

  async update(jobPreference, data, options = {}) {
    return jobPreference.update(
      data,
      options
    );
  }

  async delete(jobPreference, options = {}) {
    return jobPreference.destroy(options);
  }
}

export default new JobSeekerJobPreferenceRepository();