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
  uploadProfileImage,
  uploadResume
} from "../config/multer.js";

import {
  getMyJobSeekerProfile,
  updateMyJobSeekerProfile,
  updateMyHeadlineBiography
} from "../controllers/jobSeekerProfile.controller.js";

import {
  uploadProfileImage as uploadProfileImageController,
  uploadResume as uploadResumeController
} from "../controllers/jobSeekerUpload.controller.js";

import {
  getMyProfileCompletion
} from "../controllers/jobSeekerProfileCompletion.controller.js";

import updateJobSeekerProfileValidator from
  "../validators/jobSeekerProfile.validator.js";

import updateHeadlineBiographyValidator from
  "../validators/jobSeekerHeadlineBiography.validator.js";

const router = Router();

router.use(
  authenticate,
  authorize(USER_ROLES.JOB_SEEKER)
);

router.get(
  "/profile",
  getMyJobSeekerProfile
);

router.put(
  "/profile",
  originProtection,
  updateJobSeekerProfileValidator,
  validateRequest,
  updateMyJobSeekerProfile
);

router.get(
  "/profile/completion",
  getMyProfileCompletion
);

router.put(
  "/profile/headline-biography",
  originProtection,
  updateHeadlineBiographyValidator,
  validateRequest,
  updateMyHeadlineBiography
);

router.post(
  "/profile-image",
  originProtection,
  uploadProfileImage,
  uploadProfileImageController
);

router.post(
  "/resume",
  originProtection,
  uploadResume,
  uploadResumeController
);

export default router;