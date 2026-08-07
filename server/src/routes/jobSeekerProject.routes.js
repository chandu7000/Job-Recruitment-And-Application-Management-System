import { Router } from "express";

import jobSeekerProjectController
  from "../controllers/jobSeekerProject.controller.js";
import { authenticate }
  from "../middlewares/auth.middleware.js";
import {
  validateCreateProject,
  validateProjectId,
  validateUpdateProject
} from "../validators/jobSeekerProject.validator.js";

const router = Router();

router.use(authenticate);

router
  .route("/")
  .post(
    validateCreateProject,
    jobSeekerProjectController.createProject
  )
  .get(
    jobSeekerProjectController.getProjects
  );

router
  .route("/:projectId")
  .get(
    validateProjectId,
    jobSeekerProjectController.getProjectById
  )
  .patch(
    validateProjectId,
    validateUpdateProject,
    jobSeekerProjectController.updateProject
  )
  .delete(
    validateProjectId,
    jobSeekerProjectController.deleteProject
  );

export default router;