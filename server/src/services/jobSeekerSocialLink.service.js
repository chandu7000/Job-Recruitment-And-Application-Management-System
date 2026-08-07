import {
  findJobSeekerProfileByUserId
} from "../repositories/jobSeekerProfile.repository.js";

import jobSeekerSocialLinkRepository
  from "../repositories/jobSeekerSocialLink.repository.js";

import AppError from "../utils/AppError.js";

class JobSeekerSocialLinkService {

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


  async createSocialLink(
    userId,
    socialLinkData
  ) {
    const profile =
      await this.getProfileByUserId(
        userId
      );

    const existingSocialLink =
      await jobSeekerSocialLinkRepository
        .findByProfileIdAndPlatform(
          profile.id,
          socialLinkData.platform
        );

    if (existingSocialLink) {
      throw new AppError(
        `A ${socialLinkData.platform} social link already exists.`,
        409,
        "SOCIAL_LINK_ALREADY_EXISTS"
      );
    }

    return jobSeekerSocialLinkRepository.create({
      jobSeekerProfileId: profile.id,
      ...socialLinkData
    });
  }


  async getSocialLinks(userId) {
    const profile =
      await this.getProfileByUserId(
        userId
      );

    return jobSeekerSocialLinkRepository
      .findAllByProfileId(
        profile.id
      );
  }


  async getSocialLinkById(
    userId,
    socialLinkId
  ) {
    const profile =
      await this.getProfileByUserId(
        userId
      );

    const socialLink =
      await jobSeekerSocialLinkRepository
        .findByIdAndProfileId(
          socialLinkId,
          profile.id
        );

    if (!socialLink) {
      throw new AppError(
        "Social link not found.",
        404,
        "SOCIAL_LINK_NOT_FOUND"
      );
    }

    return socialLink;
  }


  async updateSocialLink(
    userId,
    socialLinkId,
    socialLinkData
  ) {
    const socialLink =
      await this.getSocialLinkById(
        userId,
        socialLinkId
      );


    if (
      socialLinkData.platform &&
      socialLinkData.platform !==
        socialLink.platform
    ) {
      const duplicateSocialLink =
        await jobSeekerSocialLinkRepository
          .findByProfileIdAndPlatform(
            socialLink.jobSeekerProfileId,
            socialLinkData.platform
          );


      if (duplicateSocialLink) {
        throw new AppError(
          `A ${socialLinkData.platform} social link already exists.`,
          409,
          "SOCIAL_LINK_ALREADY_EXISTS"
        );
      }
    }


    return jobSeekerSocialLinkRepository.update(
      socialLink,
      socialLinkData
    );
  }


  async deleteSocialLink(
    userId,
    socialLinkId
  ) {
    const socialLink =
      await this.getSocialLinkById(
        userId,
        socialLinkId
      );


    await jobSeekerSocialLinkRepository.delete(
      socialLink
    );


    return {
      message:
        "Social link deleted successfully"
    };
  }
}

export default new JobSeekerSocialLinkService();