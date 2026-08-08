import { rateLimit } from "express-rate-limit";
import env from "../config/env.js";

const createRateLimitHandler =
  ({ code, message }) =>
  (req, res) =>
    res.status(429).json({
      success: false,
      message,
      code,
      errors: [],
      requestId:
        req.requestId || null,
      timestamp:
        new Date().toISOString()
    });

const createRateLimiter = ({
  windowMinutes,
  maxRequests,
  code,
  message,
  skipSuccessfulRequests = false
}) =>
  rateLimit({
    windowMs:
      windowMinutes * 60 * 1000,

    limit:
      maxRequests,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,

    skipSuccessfulRequests,

    handler:
      createRateLimitHandler({
        code,
        message
      })
  });

const loginRateLimiter =
  createRateLimiter({
    ...env.authRateLimit.login,

    code:
      "LOGIN_RATE_LIMIT_EXCEEDED",

    message:
      "Too many login attempts. Please try again later.",

    skipSuccessfulRequests:
      true
  });

const registerRateLimiter =
  createRateLimiter({
    ...env.authRateLimit.register,

    code:
      "REGISTER_RATE_LIMIT_EXCEEDED",

    message:
      "Too many registration attempts. Please try again later."
  });

const forgotPasswordRateLimiter =
  createRateLimiter({
    ...env.authRateLimit.forgotPassword,

    code:
      "PASSWORD_RESET_RATE_LIMIT_EXCEEDED",

    message:
      "Too many password reset requests. Please try again later."
  });

const resetPasswordRateLimiter =
  createRateLimiter({
    ...env.authRateLimit.resetPassword,

    code:
      "RESET_PASSWORD_RATE_LIMIT_EXCEEDED",

    message:
      "Too many password reset attempts. Please try again later."
  });

const emailVerificationRateLimiter =
  createRateLimiter({
    ...env.authRateLimit.emailVerification,

    code:
      "EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED",

    message:
      "Too many email verification requests. Please try again later."
  });

const emailChangeRequestRateLimiter =
  createRateLimiter({
    ...env.authRateLimit.emailChangeRequest,

    code:
      "EMAIL_CHANGE_REQUEST_RATE_LIMIT_EXCEEDED",

    message:
      "Too many email change requests. Please try again later."
  });

const emailChangeVerificationRateLimiter =
  createRateLimiter({
    ...env.authRateLimit.emailChangeVerification,

    code:
      "EMAIL_CHANGE_VERIFICATION_RATE_LIMIT_EXCEEDED",

    message:
      "Too many email change verification attempts. Please try again later."
  });

const refreshTokenRateLimiter =
  createRateLimiter({
    ...env.authRateLimit.refreshToken,

    code:
      "TOKEN_REFRESH_RATE_LIMIT_EXCEEDED",

    message:
      "Too many token refresh requests. Please try again later."
  });

const reportRateLimiter =
  createRateLimiter({
    ...env.sensitiveRouteRateLimit.report,

    code:
      "REPORT_RATE_LIMIT_EXCEEDED",

    message:
      "Too many reports submitted. Please try again later."
  });

const uploadRateLimiter =
  createRateLimiter({
    ...env.sensitiveRouteRateLimit.upload,

    code:
      "UPLOAD_RATE_LIMIT_EXCEEDED",

    message:
      "Too many upload requests. Please try again later."
  });

export {
  createRateLimiter,
  loginRateLimiter,
  registerRateLimiter,
  forgotPasswordRateLimiter,
  resetPasswordRateLimiter,
  emailVerificationRateLimiter,
  emailChangeRequestRateLimiter,
  emailChangeVerificationRateLimiter,
  refreshTokenRateLimiter,
  reportRateLimiter,
  uploadRateLimiter
};