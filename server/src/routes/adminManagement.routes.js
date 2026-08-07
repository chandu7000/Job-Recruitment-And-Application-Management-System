import { Router } from "express";

import authenticate, {
  authorize
} from "../middlewares/auth.middleware.js";

import {
  USER_ROLES
} from "../constants/app.constants.js";

import {
  adminReports,
  adminReport,
  adminProcessReport,
  adminDashboard,
  adminUsers,
  adminModerateUser,
  adminJobs,
  adminJob,
  adminModerateJob,
  adminAudits,
  adminAudit
} from "../controllers/adminManagement.controller.js";

const router = Router();

router.use(
  authenticate,
  authorize(USER_ROLES.ADMIN)
);

router.get(
  "/dashboard",
  adminDashboard
);

router.get(
  "/reports",
  adminReports
);

router.get(
  "/reports/:id",
  adminReport
);

router.patch(
  "/reports/:id/process",
  adminProcessReport
);

router.get(
  "/users",
  adminUsers
);

router.patch(
  "/users/:id/status",
  adminModerateUser
);

router.get(
  "/jobs",
  adminJobs
);

router.get(
  "/jobs/:id",
  adminJob
);

router.patch(
  "/jobs/:id/moderate",
  adminModerateJob
);

router.get(
  "/audit-logs",
  adminAudits
);

router.get(
  "/audit-logs/:id",
  adminAudit
);

export default router;