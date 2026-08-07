import { Router } from "express";

import authenticate, {
  authorize
} from "../middlewares/auth.middleware.js";

import {
  USER_ROLES
} from "../constants/app.constants.js";

import {
  recruiterDashboard,
  jobSeekerSummary
} from "../controllers/adminManagement.controller.js";

const router = Router();

router.get(
  "/recruiter",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  recruiterDashboard
);

router.get(
  "/job-seeker",
  authenticate,
  authorize(USER_ROLES.JOB_SEEKER),
  jobSeekerSummary
);

export default router;