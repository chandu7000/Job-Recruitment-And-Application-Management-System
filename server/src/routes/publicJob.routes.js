import {
  Router
} from "express";

import validateRequest from
  "../middlewares/validateRequest.middleware.js";

import {
  listPublicJobs,
  getPublicJobDetailsById,
  getPublicJobDetailsBySlug
} from "../controllers/publicJob.controller.js";

import {
  listSimilarPublicJobs
} from "../controllers/publicSimilarJob.controller.js";

import {
  publicJobListValidator,
  publicJobIdValidator,
  publicJobSlugValidator,
  publicSimilarJobValidator
} from "../validators/publicJob.validator.js";

const router = Router();

router.get(
  "/jobs",
  publicJobListValidator,
  validateRequest,
  listPublicJobs
);

router.get(
  "/jobs/slug/:slug",
  publicJobSlugValidator,
  validateRequest,
  getPublicJobDetailsBySlug
);

router.get(
  "/jobs/:jobId/similar",
  publicSimilarJobValidator,
  validateRequest,
  listSimilarPublicJobs
);

router.get(
  "/jobs/:jobId",
  publicJobIdValidator,
  validateRequest,
  getPublicJobDetailsById
);

export default router;