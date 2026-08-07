import {
  Router
} from "express";

import authenticate from
  "../middlewares/auth.middleware.js";

import authorize from
  "../middlewares/authorize.middleware.js";

import validateRequest from
  "../middlewares/validateRequest.middleware.js";

import {
  USER_ROLES
} from "../constants/app.constants.js";

import {
  createJob,
  getMyJobs,
  getMyJobById,
  updateJob,
  publishJob,
  closeJob,
  deleteJob
} from "../controllers/job.controller.js";

import {
  createJobValidator,
  recruiterJobListValidator,
  recruiterJobIdValidator,
  updateJobValidator,
  closeJobValidator
} from "../validators/job.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(
    USER_ROLES.RECRUITER
  ),
  createJobValidator,
  validateRequest,
  createJob
);

router.get(
  "/me",
  authenticate,
  authorize(
    USER_ROLES.RECRUITER
  ),
  recruiterJobListValidator,
  validateRequest,
  getMyJobs
);

router.patch(
  "/:jobId/publish",
  authenticate,
  authorize(
    USER_ROLES.RECRUITER
  ),
  recruiterJobIdValidator,
  validateRequest,
  publishJob
);

router.patch(
  "/:jobId/close",
  authenticate,
  authorize(
    USER_ROLES.RECRUITER
  ),
  recruiterJobIdValidator,
  closeJobValidator,
  validateRequest,
  closeJob
);

router.get(
  "/:jobId",
  authenticate,
  authorize(
    USER_ROLES.RECRUITER
  ),
  recruiterJobIdValidator,
  validateRequest,
  getMyJobById
);

router.put(
  "/:jobId",
  authenticate,
  authorize(
    USER_ROLES.RECRUITER
  ),
  recruiterJobIdValidator,
  updateJobValidator,
  validateRequest,
  updateJob
);

router.delete(
  "/:jobId",
  authenticate,
  authorize(
    USER_ROLES.RECRUITER
  ),
  recruiterJobIdValidator,
  validateRequest,
  deleteJob
);

export default router;