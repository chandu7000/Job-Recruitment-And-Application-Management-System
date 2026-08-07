import {
  findJobSeekerProfileByUserId
} from "../repositories/jobSeekerProfile.repository.js";

import jobSeekerCertificationRepository
  from "../repositories/jobSeekerCertification.repository.js";

import AppError from "../utils/AppError.js";

class JobSeekerCertificationService {
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

  validateCertificationDates(
    issueDate,
    expiryDate,
    doesNotExpire
  ) {
    if (
      doesNotExpire &&
      expiryDate
    ) {
      throw new AppError(
        "Expiry date must be empty when certification does not expire.",
        400,
        "CERTIFICATION_EXPIRY_NOT_ALLOWED"
      );
    }

    if (
      issueDate &&
      expiryDate &&
      new Date(expiryDate).getTime() <
        new Date(issueDate).getTime()
    ) {
      throw new AppError(
        "Certification expiry date cannot be earlier than the issue date.",
        400,
        "INVALID_CERTIFICATION_DATE_RANGE"
      );
    }
  }

  async createCertification(
    userId,
    certificationData
  ) {
    const profile =
      await this.getProfileByUserId(
        userId
      );

    const normalizedData = {
      ...certificationData
    };

    if (
      normalizedData.doesNotExpire
    ) {
      normalizedData.expiryDate = null;
    }

    this.validateCertificationDates(
      normalizedData.issueDate,
      normalizedData.expiryDate,
      normalizedData.doesNotExpire
    );

    return jobSeekerCertificationRepository.create({
      jobSeekerProfileId: profile.id,
      ...normalizedData
    });
  }

  async getCertifications(userId) {
    const profile =
      await this.getProfileByUserId(
        userId
      );

    return jobSeekerCertificationRepository
      .findAllByProfileId(
        profile.id
      );
  }

  async getCertificationById(
    userId,
    certificationId
  ) {
    const profile =
      await this.getProfileByUserId(
        userId
      );

    const certification =
      await jobSeekerCertificationRepository
        .findByIdAndProfileId(
          certificationId,
          profile.id
        );

    if (!certification) {
      throw new AppError(
        "Certification not found.",
        404,
        "JOB_SEEKER_CERTIFICATION_NOT_FOUND"
      );
    }

    return certification;
  }

  async updateCertification(
    userId,
    certificationId,
    certificationData
  ) {
    const certification =
      await this.getCertificationById(
        userId,
        certificationId
      );

    const currentData =
      certification.get({
        plain: true
      });

    const normalizedData = {
      ...certificationData
    };

    const issueDate =
      normalizedData.issueDate ??
      currentData.issueDate;

    const doesNotExpire =
      normalizedData.doesNotExpire ??
      currentData.doesNotExpire;

    let expiryDate =
      normalizedData.expiryDate !==
      undefined
        ? normalizedData.expiryDate
        : currentData.expiryDate;

    if (doesNotExpire) {
      expiryDate = null;
      normalizedData.expiryDate = null;
    }

    this.validateCertificationDates(
      issueDate,
      expiryDate,
      doesNotExpire
    );

    return jobSeekerCertificationRepository.update(
      certification,
      normalizedData
    );
  }

  async deleteCertification(
    userId,
    certificationId
  ) {
    const certification =
      await this.getCertificationById(
        userId,
        certificationId
      );

    await jobSeekerCertificationRepository.delete(
      certification
    );

    return {
      message:
        "Certification deleted successfully"
    };
  }
}

export default new JobSeekerCertificationService();