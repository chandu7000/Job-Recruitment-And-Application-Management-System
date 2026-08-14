import { Router } from "express";

import authenticate from
  "../middlewares/auth.middleware.js";

import validateRequest from
  "../middlewares/validateRequest.middleware.js";

import {
  loginRateLimiter,
  registerRateLimiter,
  forgotPasswordRateLimiter,
  emailVerificationRateLimiter,
  emailChangeRequestRateLimiter,
  emailChangeVerificationRateLimiter,
  refreshTokenRateLimiter,
  resetPasswordRateLimiter
} from "../middlewares/rateLimit.middleware.js";

import originProtection from
  "../middlewares/originProtection.middleware.js";

import {
  registerJobSeeker,
  registerRecruiter,
  login,
  restoreSessionController,
  refreshToken,
  logout,
  logoutAll,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
  requestEmailChangeController,
  sendEmailVerificationController,
  verifyEmailController,
  declineEmailVerificationController,
  verifyEmailChangeController,
  me,
  getSessions,
  revokeSessionController
} from "../controllers/auth.controller.js";

import {
  registerValidator,
  loginValidator
} from "../validators/auth.validator.js";

import forgotPasswordValidator from
  "../validators/forgotPassword.validator.js";

import resetPasswordValidator from
  "../validators/resetPassword.validator.js";

import changePasswordValidator from
  "../validators/changePassword.validator.js";

import resendVerificationValidator from
  "../validators/resendVerification.validator.js";

import verifyEmailValidator from
  "../validators/verifyEmail.validator.js";

import requestEmailChangeValidator from
  "../validators/requestEmailChange.validator.js";

const router = Router();

/*
 * Public registration
 */
router.post(
  "/register/job-seeker",
  registerRateLimiter,
  registerValidator,
  validateRequest,
  registerJobSeeker
);

/*
 * Public recruiter registration
 */
router.post(
  "/register/recruiter",
  registerRateLimiter,
  registerValidator,
  validateRequest,
  registerRecruiter
);

/*
 * Login and token routes
 */
router.post(
  "/login",
  loginRateLimiter,
  loginValidator,
  validateRequest,
  login
);

router.post(
  "/restore-session",
  originProtection,
  restoreSessionController
);

router.post(
  "/refresh-token",
  originProtection,
  refreshTokenRateLimiter,
  refreshToken
);

/*
 * Logout routes
 */
router.post(
  "/logout",
  originProtection,
  authenticate,
  logout
);

router.post(
  "/logout-all",
  originProtection,
  authenticate,
  logoutAll
);

/*
 * Current-user routes
 */
router.get(
  "/me",
  authenticate,
  me
);

router.get(
  "/sessions",
  authenticate,
  getSessions
);

router.delete(
  "/sessions/:sessionId",
  authenticate,
  revokeSessionController
);

/*
 * Password routes
 */
router.post(
  "/forgot-password",
  forgotPasswordRateLimiter,
  forgotPasswordValidator,
  validateRequest,
  forgotPasswordController
);

router.post(
  "/reset-password",
  resetPasswordRateLimiter,
  resetPasswordValidator,
  validateRequest,
  resetPasswordController
);

router.post(
  "/change-password",
  originProtection,
  authenticate,
  changePasswordValidator,
  validateRequest,
  changePasswordController
);

router.post(
  "/request-email-change",
  originProtection,
  authenticate,
  emailChangeRequestRateLimiter,
  requestEmailChangeValidator,
  validateRequest,
  requestEmailChangeController
);

router.post(
  "/verify-email-change",
  emailChangeVerificationRateLimiter,
  verifyEmailValidator,
  validateRequest,
  verifyEmailChangeController
);

/*
 * Email-verification routes
 */
router.post(
  "/resend-verification",
  emailVerificationRateLimiter,
  resendVerificationValidator,
  validateRequest,
  sendEmailVerificationController
);

router.post(
  "/verify-email",
  verifyEmailValidator,
  validateRequest,
  verifyEmailController
);

router.post(
  "/decline-verification",
  verifyEmailValidator,
  validateRequest,
  declineEmailVerificationController
);

export default router;