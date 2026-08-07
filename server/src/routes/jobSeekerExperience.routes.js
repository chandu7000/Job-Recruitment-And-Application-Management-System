import { Router } from "express";

import {
  USER_ROLES
} from "../constants/app.constants.js";

import authenticate, {
  authorize
} from "../middlewares/auth.middleware.js";

import originProtection from
  "../middlewares/originProtection.middleware.js";

import validateRequest from
  "../middlewares/validateRequest.middleware.js";

import {
  getMyJobSeekerExperiences,
  addMyJobSeekerExperience,
  updateMyJobSeekerExperience,
  deleteMyJobSeekerExperience
} from "../controllers/jobSeekerExperience.controller.js";

import {
  createJobSeekerExperienceValidator,
  updateJobSeekerExperienceValidator,
  deleteJobSeekerExperienceValidator
} from "../validators/jobSeekerExperience.validator.js";

const router = Router();

router.use(
  authenticate,
  authorize(USER_ROLES.JOB_SEEKER)
);

router.get(
  "/",
  getMyJobSeekerExperiences
);

router.post(
  "/",
  originProtection,
  createJobSeekerExperienceValidator,
  validateRequest,
  addMyJobSeekerExperience
);

router.put(
  "/:experienceId",
  originProtection,
  updateJobSeekerExperienceValidator,
  validateRequest,
  updateMyJobSeekerExperience
);

router.delete(
  "/:experienceId",
  originProtection,
  deleteJobSeekerExperienceValidator,
  validateRequest,
  deleteMyJobSeekerExperience
);

export default router;