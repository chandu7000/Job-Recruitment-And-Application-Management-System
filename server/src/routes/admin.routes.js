import {
  Router
} from "express";

import authenticate, {
  authorize
} from "../middlewares/auth.middleware.js";

import originProtection from
  "../middlewares/originProtection.middleware.js";

import validateRequest from
  "../middlewares/validateRequest.middleware.js";

import {
  USER_ROLES
} from "../constants/app.constants.js";

import {
  getUsers,
  getUser,
  activate,
  disable,
  suspend
} from "../controllers/admin.controller.js";

import {
  getPendingCompanyList,
  verifyCompanyByAdmin,
  rejectCompanyByAdminController
} from "../controllers/adminCompany.controller.js";

import {
  verifyCompanyValidator,
  rejectCompanyValidator
} from "../validators/adminCompany.validator.js";

const router = Router();

router.use(
  authenticate,
  authorize(
    USER_ROLES.ADMIN
  )
);

// Company verification routes

router.get(
  "/companies/pending",
  getPendingCompanyList
);

router.patch(
  "/companies/:id/verify",
  originProtection,
  verifyCompanyValidator,
  validateRequest,
  verifyCompanyByAdmin
);

router.patch(
  "/companies/:id/reject",
  originProtection,
  rejectCompanyValidator,
  validateRequest,
  rejectCompanyByAdminController
);

// User administration routes

router.get(
  "/users",
  getUsers
);

router.get(
  "/users/:userId",
  getUser
);

router.patch(
  "/users/:userId/activate",
  originProtection,
  activate
);

router.patch(
  "/users/:userId/disable",
  originProtection,
  disable
);

router.patch(
  "/users/:userId/suspend",
  originProtection,
  suspend
);

export default router;