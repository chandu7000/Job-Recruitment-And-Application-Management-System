import {
  Router
} from "express";

import validateRequest from
  "../middlewares/validateRequest.middleware.js";

import {
  getPublicCompanyDetailsById,
  getPublicCompanyDetailsBySlug
} from "../controllers/publicCompany.controller.js";

import {
  listPublicCompanyJobsById,
  listPublicCompanyJobsBySlug
} from "../controllers/publicCompanyJob.controller.js";

import {
  publicCompanyIdValidator,
  publicCompanySlugValidator,
  publicCompanyJobIdValidator,
  publicCompanyJobSlugValidator
} from "../validators/publicCompany.validator.js";

const router = Router();

/*
 * More-specific routes must appear before
 * the general company details routes.
 */

router.get(
  "/companies/slug/:companySlug/jobs",
  publicCompanyJobSlugValidator,
  validateRequest,
  listPublicCompanyJobsBySlug
);

router.get(
  "/companies/:companyId/jobs",
  publicCompanyJobIdValidator,
  validateRequest,
  listPublicCompanyJobsById
);

router.get(
  "/companies/slug/:slug",
  publicCompanySlugValidator,
  validateRequest,
  getPublicCompanyDetailsBySlug
);

router.get(
  "/companies/:companyId",
  publicCompanyIdValidator,
  validateRequest,
  getPublicCompanyDetailsById
);

export default router;