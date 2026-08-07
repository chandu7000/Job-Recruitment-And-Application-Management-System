import jobSeekerJobPreferenceService
  from "../services/jobSeekerJobPreference.service.js";

class JobSeekerJobPreferenceController {
  async getJobPreference(req, res, next) {
    try {
      const jobPreference =
        await jobSeekerJobPreferenceService.getJobPreference(
          req.user.id
        );

      return res.status(200).json({
        success: true,
        message: "Job preference retrieved successfully",
        data: {
          jobPreference
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateJobPreference(req, res, next) {
    try {
      const jobPreference =
        await jobSeekerJobPreferenceService.updateJobPreference(
          req.user.id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message: "Job preference updated successfully",
        data: {
          jobPreference
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteJobPreference(req, res, next) {
    try {
      const result =
        await jobSeekerJobPreferenceService.deleteJobPreference(
          req.user.id
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

export default new JobSeekerJobPreferenceController();