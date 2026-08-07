import JobSeekerSocialLink
  from "../models/jobSeekerSocialLink.model.js";

class JobSeekerSocialLinkRepository {
  async create(socialLinkData, options = {}) {
    return JobSeekerSocialLink.create(
      socialLinkData,
      options
    );
  }

  async findById(socialLinkId, options = {}) {
    return JobSeekerSocialLink.findByPk(
      socialLinkId,
      options
    );
  }

  async findByIdAndProfileId(
    socialLinkId,
    jobSeekerProfileId,
    options = {}
  ) {
    return JobSeekerSocialLink.findOne({
      ...options,
      where: {
        id: socialLinkId,
        jobSeekerProfileId
      }
    });
  }

  async findByProfileIdAndPlatform(
    jobSeekerProfileId,
    platform,
    options = {}
  ) {
    return JobSeekerSocialLink.findOne({
      ...options,
      where: {
        jobSeekerProfileId,
        platform
      }
    });
  }

  async findAllByProfileId(
    jobSeekerProfileId,
    options = {}
  ) {
    return JobSeekerSocialLink.findAll({
      ...options,
      where: {
        jobSeekerProfileId
      },
      order: [
        ["platform", "ASC"],
        ["createdAt", "DESC"]
      ]
    });
  }

  async update(
    socialLink,
    socialLinkData,
    options = {}
  ) {
    return socialLink.update(
      socialLinkData,
      options
    );
  }

  async delete(socialLink, options = {}) {
    return socialLink.destroy(options);
  }
}

export default new JobSeekerSocialLinkRepository();