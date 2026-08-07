import jobSeekerProjectService
  from "../services/jobSeekerProject.service.js";

class JobSeekerProjectController {
  async createProject(req, res, next) {
    try {
      const project =
        await jobSeekerProjectService.createProject(
          req.user.id,
          req.body
        );

      return res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: {
          project
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async getProjects(req, res, next) {
    try {
      const projects =
        await jobSeekerProjectService.getProjects(
          req.user.id
        );

      return res.status(200).json({
        success: true,
        message: "Projects retrieved successfully",
        data: {
          projects,
          total: projects.length
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async getProjectById(req, res, next) {
    try {
      const project =
        await jobSeekerProjectService.getProjectById(
          req.user.id,
          req.params.projectId
        );

      return res.status(200).json({
        success: true,
        message: "Project retrieved successfully",
        data: {
          project
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateProject(req, res, next) {
    try {
      const project =
        await jobSeekerProjectService.updateProject(
          req.user.id,
          req.params.projectId,
          req.body
        );

      return res.status(200).json({
        success: true,
        message: "Project updated successfully",
        data: {
          project
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteProject(req, res, next) {
    try {
      const result =
        await jobSeekerProjectService.deleteProject(
          req.user.id,
          req.params.projectId
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

export default new JobSeekerProjectController();