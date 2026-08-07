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
  getMyJobSeekerEducations,
  addMyJobSeekerEducation,
  updateMyJobSeekerEducation,
  deleteMyJobSeekerEducation
} from "../controllers/jobSeekerEducation.controller.js";

import {
  createJobSeekerEducationValidator,
  updateJobSeekerEducationValidator,
  deleteJobSeekerEducationValidator
} from "../validators/jobSeekerEducation.validator.js";

const router = Router();

router.use(
  authenticate,
  authorize(USER_ROLES.JOB_SEEKER)
);

router.get(
  "/",
  getMyJobSeekerEducations
);

router.post(
  "/",
  originProtection,
  createJobSeekerEducationValidator,
  validateRequest,
  addMyJobSeekerEducation
);

router.put(
  "/:educationId",
  originProtection,
  updateJobSeekerEducationValidator,
  validateRequest,
  updateMyJobSeekerEducation
);

router.delete(
  "/:educationId",
  originProtection,
  deleteJobSeekerEducationValidator,
  validateRequest,
  deleteMyJobSeekerEducation
);

export default router;