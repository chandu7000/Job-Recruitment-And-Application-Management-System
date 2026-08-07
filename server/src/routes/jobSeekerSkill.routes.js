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
  getMyJobSeekerSkills,
  addMyJobSeekerSkill,
  updateMyJobSeekerSkill,
  deleteMyJobSeekerSkill
} from "../controllers/jobSeekerSkill.controller.js";

import {
  createJobSeekerSkillValidator,
  updateJobSeekerSkillValidator,
  deleteJobSeekerSkillValidator
} from "../validators/jobSeekerSkill.validator.js";

const router = Router();

router.use(
  authenticate,
  authorize(USER_ROLES.JOB_SEEKER)
);

router.get(
  "/",
  getMyJobSeekerSkills
);

router.post(
  "/",
  originProtection,
  createJobSeekerSkillValidator,
  validateRequest,
  addMyJobSeekerSkill
);

router.put(
  "/:skillId",
  originProtection,
  updateJobSeekerSkillValidator,
  validateRequest,
  updateMyJobSeekerSkill
);

router.delete(
  "/:skillId",
  originProtection,
  deleteJobSeekerSkillValidator,
  validateRequest,
  deleteMyJobSeekerSkill
);

export default router;