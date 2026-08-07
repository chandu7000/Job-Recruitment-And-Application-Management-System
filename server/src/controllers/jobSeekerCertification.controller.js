import jobSeekerCertificationService
  from "../services/jobSeekerCertification.service.js";

class JobSeekerCertificationController {
  async createCertification(req, res, next) {
    try {
      const certification =
        await jobSeekerCertificationService
          .createCertification(
            req.user.id,
            req.body
          );

      return res.status(201).json({
        success: true,
        message:
          "Certification created successfully",
        data: {
          certification
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async getCertifications(req, res, next) {
    try {
      const certifications =
        await jobSeekerCertificationService
          .getCertifications(req.user.id);

      return res.status(200).json({
        success: true,
        message:
          "Certifications retrieved successfully",
        data: {
          certifications,
          total: certifications.length
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async getCertificationById(
    req,
    res,
    next
  ) {
    try {
      const certification =
        await jobSeekerCertificationService
          .getCertificationById(
            req.user.id,
            req.params.certificationId
          );

      return res.status(200).json({
        success: true,
        message:
          "Certification retrieved successfully",
        data: {
          certification
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateCertification(req, res, next) {
    try {
      const certification =
        await jobSeekerCertificationService
          .updateCertification(
            req.user.id,
            req.params.certificationId,
            req.body
          );

      return res.status(200).json({
        success: true,
        message:
          "Certification updated successfully",
        data: {
          certification
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteCertification(req, res, next) {
    try {
      const result =
        await jobSeekerCertificationService
          .deleteCertification(
            req.user.id,
            req.params.certificationId
          );

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new JobSeekerCertificationController();