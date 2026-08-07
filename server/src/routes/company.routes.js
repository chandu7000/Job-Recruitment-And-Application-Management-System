import { Router } from "express";

import {
  uploadCompanyLogo as uploadCompanyLogoMiddleware
} from "../config/multer.js";

import {
  USER_ROLES
} from "../constants/app.constants.js";

import { uploadRateLimiter } from "../middlewares/rateLimit.middleware.js";

import authenticate, {
  authorize
} from "../middlewares/auth.middleware.js";

import originProtection from
  "../middlewares/originProtection.middleware.js";

import validateRequest from
  "../middlewares/validateRequest.middleware.js";

import {
  uploadCompanyLogo,
  deleteCompanyLogo
} from "../controllers/companyLogo.controller.js";

import {
  createCompany,
  getMyCompanies,
  getCompany,
  updateMyCompany,
  submitMyCompanyVerification,
  updateCompany,
  deleteCompany
} from "../controllers/company.controller.js";

import createCompanyValidator from
  "../validators/company.validator.js";

import updateCompanyValidator from
  "../validators/updateCompany.validator.js";

const router = Router();

router.use(
  authenticate,
  authorize(USER_ROLES.RECRUITER)
);

router.post(
  "/",
  originProtection,
  createCompanyValidator,
  validateRequest,
  createCompany
);

router.get(
  "/me",
  getMyCompanies
);

router.put(
  "/me",
  originProtection,
  updateCompanyValidator,
  validateRequest,
  updateMyCompany
);

router.post(
  "/me/logo",
  originProtection,
  uploadRateLimiter,
  uploadCompanyLogoMiddleware,
  uploadCompanyLogo
);

router.delete(
  "/me/logo",
  originProtection,
  deleteCompanyLogo
);

router.post(
  "/me/submit-verification",
  originProtection,
  submitMyCompanyVerification
);

router.get(
  "/:companyId",
  getCompany
);

router.put(
  "/:companyId",
  originProtection,
  updateCompany
);

router.delete(
  "/:companyId",
  originProtection,
  deleteCompany
);

export default router;