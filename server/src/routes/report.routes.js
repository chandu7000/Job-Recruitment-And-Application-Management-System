import { Router } from "express";

import authenticate from "../middlewares/auth.middleware.js";
import { reportRateLimiter } from "../middlewares/rateLimit.middleware.js";

import {
  createReport
} from "../controllers/adminManagement.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  reportRateLimiter,
  createReport
);

export default router;