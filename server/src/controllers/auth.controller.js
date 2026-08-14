import {
  registerUser,
  loginUser,
  restoreSession,
  refreshAccessToken,
  logoutUser,
  logoutFromAllDevices,
  forgotPassword,
  resetPassword,
  changePassword,
  requestEmailChange,
  sendEmailVerification,
  verifyEmail,
  declineEmailVerification,
  verifyEmailChange,
  getCurrentUser
} from "../services/auth.service.js";

import {
  getUserSessions,
  revokeSpecificSession
} from "../services/userSession.service.js";

import { USER_ROLES } from "../constants/app.constants.js";

import { sendSuccess } from "../utils/apiResponse.js";

import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest
} from "../utils/cookie.util.js";

const registerJobSeeker = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await registerUser({
        ...req.body,
        role: USER_ROLES.JOB_SEEKER,
        req
      });

    if (result.refreshToken) {
      setRefreshTokenCookie(
        res,
        result.refreshToken
      );
    }

    return sendSuccess(
      res,
      result.existingPendingRegistration
        ? 200
        : 201,
      result.existingPendingRegistration
        ? "Registration already pending. A new verification email has been sent."
        : "Job seeker registered successfully.",
      {
        user: result.user,
        accessToken: result.accessToken,
        verificationEmailSent:
          result.verificationEmailSent,
        existingPendingRegistration:
          result.existingPendingRegistration
      }
    );
  } catch (error) {
    next(error);
  }
};

const registerRecruiter = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await registerUser({
        ...req.body,
        role: USER_ROLES.RECRUITER,
        req
      });

    if (result.refreshToken) {
      setRefreshTokenCookie(
        res,
        result.refreshToken
      );
    }

    return sendSuccess(
      res,
      result.existingPendingRegistration
        ? 200
        : 201,
      result.existingPendingRegistration
        ? "Registration already pending. A new verification email has been sent."
        : "Recruiter registered successfully.",
      {
        user: result.user,
        accessToken: result.accessToken,
        verificationEmailSent:
          result.verificationEmailSent,
        existingPendingRegistration:
          result.existingPendingRegistration
      }
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await loginUser({
      ...req.body,
      req
    });

    setRefreshTokenCookie(
      res,
      result.refreshToken
    );

    return sendSuccess(
      res,
      200,
      "Login successful.",
      {
        user: result.user,
        accessToken: result.accessToken
      }
    );
  } catch (error) {
    next(error);
  }
};

const restoreSessionController = async (
  req,
  res,
  next
) => {
  try {
    const existingRefreshToken =
      getRefreshTokenFromRequest(req);

    const result =
      await restoreSession({
        refreshToken:
          existingRefreshToken
      });

    return sendSuccess(
      res,
      200,
      "Session restored successfully.",
      {
        user: result.user,
        accessToken:
          result.accessToken
      }
    );
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (
  req,
  res,
  next
) => {
  try {
    const existingRefreshToken =
      getRefreshTokenFromRequest(req);

    const result =
      await refreshAccessToken({
        refreshToken:
          existingRefreshToken
      });

    setRefreshTokenCookie(
      res,
      result.refreshToken
    );

    return sendSuccess(
      res,
      200,
      "Access token refreshed successfully.",
      {
        accessToken:
          result.accessToken
      }
    );
  } catch (error) {
    clearRefreshTokenCookie(res);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const existingRefreshToken =
      getRefreshTokenFromRequest(req);

    if (existingRefreshToken) {
      await logoutUser({
        refreshToken:
          existingRefreshToken
      });
    }

    clearRefreshTokenCookie(res);

    return sendSuccess(
      res,
      200,
      "Logout successful.",
      {}
    );
  } catch (error) {
    clearRefreshTokenCookie(res);
    next(error);
  }
};

const logoutAll = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await logoutFromAllDevices({
        userId: req.user.id
      });

    clearRefreshTokenCookie(res);

    return sendSuccess(
      res,
      200,
      result.message,
      {}
    );
  } catch (error) {
    next(error);
  }
};

const forgotPasswordController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await forgotPassword({
        email: req.body.email
      });

    return sendSuccess(
      res,
      200,
      result.message,
      {}
    );
  } catch (error) {
    next(error);
  }
};

const resetPasswordController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await resetPassword(req.body);

    return sendSuccess(
      res,
      200,
      result.message,
      {}
    );
  } catch (error) {
    next(error);
  }
};

const changePasswordController = async (
  req,
  res,
  next
) => {
  try {
    const result = await changePassword({
      userId: req.user.id,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword
    });

    return sendSuccess(
      res,
      200,
      result.message,
      {}
    );
  } catch (error) {
    next(error);
  }
};

const requestEmailChangeController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await requestEmailChange({
        userId: req.user.id,
        newEmail: req.body.newEmail,
        currentPassword:
          req.body.currentPassword
      });

    return sendSuccess(
      res,
      200,
      result.message,
      {}
    );
  } catch (error) {
    next(error);
  }
};

const verifyEmailChangeController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await verifyEmailChange({
        token: req.body.token
      });

    /*
     * Email changes revoke every session,
     * including the current refresh-token session.
     */
    clearRefreshTokenCookie(res);

    return sendSuccess(
      res,
      200,
      result.message,
      {}
    );
  } catch (error) {
    next(error);
  }
};

const sendEmailVerificationController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await sendEmailVerification({
        email: req.body.email
      });

    return sendSuccess(
      res,
      200,
      result.message,
      {}
    );
  } catch (error) {
    next(error);
  }
};

const verifyEmailController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await verifyEmail(req.body);

    return sendSuccess(
      res,
      200,
      result.message,
      {}
    );
  } catch (error) {
    next(error);
  }
};

const declineEmailVerificationController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await declineEmailVerification(
        req.body
      );

    return sendSuccess(
      res,
      200,
      result.message,
      {}
    );
  } catch (error) {
    next(error);
  }
};

const me = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await getCurrentUser({
        userId: req.user.id
      });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const getSessions = async (
  req,
  res,
  next
) => {
  try {
    const sessions =
      await getUserSessions({
        userId: req.user.id
      });

    return sendSuccess(
      res,
      200,
      "Sessions fetched successfully.",
      sessions
    );
  } catch (error) {
    next(error);
  }
};

const revokeSessionController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await revokeSpecificSession({
        userId: req.user.id,
        sessionId: req.params.sessionId
      });

    return sendSuccess(
      res,
      200,
      result.message,
      {}
    );
  } catch (error) {
    next(error);
  }
};

export {
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
};