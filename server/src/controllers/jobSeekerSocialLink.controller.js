import jobSeekerSocialLinkService
  from "../services/jobSeekerSocialLink.service.js";

class JobSeekerSocialLinkController {
  async createSocialLink(req, res, next) {
    try {
      const socialLink =
        await jobSeekerSocialLinkService
          .createSocialLink(
            req.user.id,
            req.body
          );

      return res.status(201).json({
        success: true,
        message: "Social link created successfully",
        data: {
          socialLink
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async getSocialLinks(req, res, next) {
    try {
      const socialLinks =
        await jobSeekerSocialLinkService
          .getSocialLinks(req.user.id);

      return res.status(200).json({
        success: true,
        message: "Social links retrieved successfully",
        data: {
          socialLinks,
          total: socialLinks.length
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async getSocialLinkById(req, res, next) {
    try {
      const socialLink =
        await jobSeekerSocialLinkService
          .getSocialLinkById(
            req.user.id,
            req.params.socialLinkId
          );

      return res.status(200).json({
        success: true,
        message: "Social link retrieved successfully",
        data: {
          socialLink
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateSocialLink(req, res, next) {
    try {
      const socialLink =
        await jobSeekerSocialLinkService
          .updateSocialLink(
            req.user.id,
            req.params.socialLinkId,
            req.body
          );

      return res.status(200).json({
        success: true,
        message: "Social link updated successfully",
        data: {
          socialLink
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteSocialLink(req, res, next) {
    try {
      const result =
        await jobSeekerSocialLinkService
          .deleteSocialLink(
            req.user.id,
            req.params.socialLinkId
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

export default new JobSeekerSocialLinkController();