import {
  findUserById
} from "../repositories/auth.repository.js";

import {
  revokeEveryUserSession
} from "../services/userSession.service.js";

import {
  verifyAccessToken
} from "../utils/jwt.js";

import {
  ACCOUNT_STATUS,
  SESSION_REVOCATION_REASONS
} from "../constants/app.constants.js";

import AppError from "../utils/AppError.js";

const authenticate = async (
  req,
  res,
  next
) => {
  try {
    const authorizationHeader =
      req.headers.authorization;

    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith(
        "Bearer "
      )
    ) {
      throw new AppError(
        "Authentication token is required.",
        401,
        "AUTHENTICATION_REQUIRED"
      );
    }

    const token =
      authorizationHeader.split(" ")[1];

    const payload =
      verifyAccessToken(token);

    const user =
      await findUserById(payload.id);

    if (!user) {
      throw new AppError(
        "User not found.",
        401,
        "USER_NOT_FOUND"
      );
    }

    if (
      user.status ===
      ACCOUNT_STATUS.PENDING_VERIFICATION
    ) {
      throw new AppError(
        "Please verify your email before accessing this resource.",
        403,
        "EMAIL_NOT_VERIFIED"
      );
    }

    if (
      user.status ===
      ACCOUNT_STATUS.DISABLED
    ) {
      await revokeEveryUserSession({
        userId: user.id,
        reason:
          SESSION_REVOCATION_REASONS
            .ACCOUNT_DISABLED
      });

      throw new AppError(
        "Your account has been disabled.",
        403,
        "ACCOUNT_DISABLED"
      );
    }

    if (
      user.status ===
      ACCOUNT_STATUS.SUSPENDED
    ) {
      await revokeEveryUserSession({
        userId: user.id,
        reason:
          SESSION_REVOCATION_REASONS
            .ACCOUNT_SUSPENDED
      });

      throw new AppError(
        "Your account has been suspended.",
        403,
        "ACCOUNT_SUSPENDED"
      );
    }

    if (
      user.status !==
      ACCOUNT_STATUS.ACTIVE
    ) {
      throw new AppError(
        "Your account is not active.",
        403,
        "ACCOUNT_NOT_ACTIVE"
      );
    }

    if (
      user.passwordChangedAt &&
      payload.iat
    ) {
      const passwordChangedAtSeconds =
        Math.floor(
          user.passwordChangedAt.getTime() /
            1000
        );

      if (
        passwordChangedAtSeconds >
        payload.iat
      ) {
        throw new AppError(
          "Your password was changed after this token was issued. Please log in again.",
          401,
          "TOKEN_INVALIDATED_BY_PASSWORD_CHANGE"
        );
      }
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError(
          "Authentication required.",
          401,
          "AUTHENTICATION_REQUIRED"
        )
      );
    }

    if (
      !allowedRoles.includes(req.user.role)
    ) {
      return next(
        new AppError(
          "You are not authorized to access this resource.",
          403,
          "FORBIDDEN"
        )
      );
    }

    next();
  };
};

export {
  authenticate,
  authorize
};

export default authenticate;