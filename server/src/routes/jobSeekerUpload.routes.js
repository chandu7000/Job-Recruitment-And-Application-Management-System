import { Router } from "express";

import authenticate, {
  authorize
} from "../middlewares/auth.middleware.js";

import {
  USER_ROLES
} from "../constants/app.constants.js";

import { uploadRateLimiter } from "../middlewares/rateLimit.middleware.js";

import {
  uploadProfileImage,
  uploadResume
} from "../middlewares/upload.middleware.js";

import {
  uploadProfileImage as uploadProfileImageController,
  uploadResume as uploadResumeController,
  deleteProfileImage,
  deleteResume
} from "../controllers/jobSeekerUpload.controller.js";


const router = Router();


router.use(
  authenticate,
  authorize(
    USER_ROLES.JOB_SEEKER
  )
);


router.post(
  "/profile-image",
  uploadRateLimiter,
  uploadProfileImage,
  uploadProfileImageController
);


router.post(
  "/resume",
  uploadRateLimiter,
  uploadResume,
  uploadResumeController
);

router.delete(
  "/profile-image",
  deleteProfileImage
);

router.delete(
  "/resume",
  deleteResume
);

export default router;