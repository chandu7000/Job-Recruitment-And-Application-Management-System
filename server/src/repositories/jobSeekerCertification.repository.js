import JobSeekerCertification
  from "../models/jobSeekerCertification.model.js";

class JobSeekerCertificationRepository {
  async create(certificationData, options = {}) {
    return JobSeekerCertification.create(
      certificationData,
      options
    );
  }

  async findById(certificationId, options = {}) {
    return JobSeekerCertification.findByPk(
      certificationId,
      options
    );
  }

  async findByIdAndProfileId(
    certificationId,
    jobSeekerProfileId,
    options = {}
  ) {
    return JobSeekerCertification.findOne({
      ...options,
      where: {
        id: certificationId,
        jobSeekerProfileId
      }
    });
  }

  async findAllByProfileId(
    jobSeekerProfileId,
    options = {}
  ) {
    return JobSeekerCertification.findAll({
      ...options,
      where: {
        jobSeekerProfileId
      },
      order: [
        ["issueDate", "DESC"],
        ["createdAt", "DESC"]
      ]
    });
  }

  async update(
    certification,
    certificationData,
    options = {}
  ) {
    return certification.update(
      certificationData,
      options
    );
  }

  async delete(certification, options = {}) {
    return certification.destroy(options);
  }
}

export default new JobSeekerCertificationRepository();