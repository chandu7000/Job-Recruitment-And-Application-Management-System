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
  getMyRecruiterProfile,
  updateMyRecruiterProfile
} from "../controllers/recruiterProfile.controller.js";

import updateRecruiterProfileValidator from
  "../validators/recruiterProfile.validator.js";

const router = Router();

router.use(
  authenticate,
  authorize(USER_ROLES.RECRUITER)
);

router.get(
  "/profile",
  getMyRecruiterProfile
);

router.put(
  "/profile",
  originProtection,
  updateRecruiterProfileValidator,
  validateRequest,
  updateMyRecruiterProfile
);

export default router;