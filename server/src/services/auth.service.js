import { sequelize } from "../config/database.js";

import { logAuthEvent } from "./authAudit.service.js";

import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendEmailChangeVerificationEmail
} from "../utils/email.js";

import { getDeviceInfo } from "../utils/deviceInfo.js";

import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByIdWithPassword,
  savePasswordResetToken,
  findUserByPasswordResetToken,
  updatePassword,
  updateUserPassword,
  saveEmailVerificationToken,
  findUserByEmailVerificationToken,
  verifyUserEmail,
  incrementFailedLoginAttempts,
  resetFailedLoginAttempts,
  updateLastLogin,
  clearPasswordResetToken,
  saveEmailChangeRequest,
  findUserByEmailChangeToken,
  completeEmailChange,
  clearEmailChangeRequest,
  deletePendingUserById
} from "../repositories/auth.repository.js";

import {
  createJobSeekerProfile
} from "../repositories/jobSeekerProfile.repository.js";

import {
  createRecruiterProfile
} from "../repositories/recruiterProfile.repository.js";

import {
  createUserSession,
  getSessionByRefreshToken,
  revokeUserSession,
  revokeEveryUserSession
} from "./userSession.service.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../utils/jwt.js";

import AppError from "../utils/AppError.js";

import {
  hashPassword,
  comparePassword
} from "../utils/password.util.js";

import {
  generateSecureToken,
  hashToken
} from "../utils/token.util.js";

import {
  USER_ROLES,
  ACCOUNT_STATUS
} from "../constants/app.constants.js";

const REFRESH_TOKEN_EXPIRY_MS =
  7 * 24 * 60 * 60 * 1000;

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCK_DURATION_MINUTES = 15;


const sendRegistrationVerification = async ({
  user,
  verificationToken,
  event = "EMAIL_VERIFICATION_SENT"
}) => {
  let verificationEmailSent =
    process.env.NODE_ENV === "test";

  if (process.env.NODE_ENV !== "test") {
    try {
      const delivery =
        await sendVerificationEmail(
          user.email,
          verificationToken
        );

      verificationEmailSent =
        delivery?.success === true;

      await logAuthEvent({
        userId: user.id,
        email: user.email,
        event,
        status: verificationEmailSent
          ? "SUCCESS"
          : "FAILED",
        metadata: verificationEmailSent
          ? undefined
          : {
              reason:
                delivery?.errorCategory ||
                "EMAIL_DELIVERY_FAILED"
            }
      });
    } catch (error) {
      verificationEmailSent = false;

      await logAuthEvent({
        userId: user.id,
        email: user.email,
        event,
        status: "FAILED",
        metadata: {
          reason:
            error?.message ||
            "EMAIL_DELIVERY_FAILED"
        }
      });
    }
  }

  return verificationEmailSent;
};

const refreshPendingRegistration = async ({
  user,
  role
}) => {
  if (
    user.role !== role ||
    user.status !==
      ACCOUNT_STATUS.PENDING_VERIFICATION ||
    user.emailVerifiedAt
  ) {
    throw new AppError(
      "Email already registered.",
      409,
      "EMAIL_ALREADY_EXISTS"
    );
  }

  const verificationToken =
    generateSecureToken();

  await saveEmailVerificationToken({
    userId: user.id,
    token: hashToken(verificationToken),
    expiresAt: new Date(
      Date.now() +
      24 * 60 * 60 * 1000
    )
  });

  const verificationEmailSent =
    await sendRegistrationVerification({
      user,
      verificationToken,
      event: "EMAIL_VERIFICATION_RESENT"
    });

  return {
    user,
    accessToken: null,
    refreshToken: null,
    verificationEmailSent,
    existingPendingRegistration: true
  };
};

const registerUser = async ({
  firstName,
  lastName,
  phoneNumber,
  email,
  password,
  role = USER_ROLES.JOB_SEEKER,
  req
}) => {
  const existingUser =
    await findUserByEmail(email);

  if (existingUser) {
    return refreshPendingRegistration({
      user: existingUser,
      role
    });
  }

  const passwordHash =
    await hashPassword(password);

  const deviceInfo =
    getDeviceInfo(req);

  let user;
  let accessToken;
  let refreshToken;

  const verificationToken =
    generateSecureToken();
  const hashedVerificationToken =
    hashToken(verificationToken);

  try {
    await sequelize.transaction(
      async (transaction) => {
        user = await createUser(
          {
            email,
            passwordHash,
            role,
            status:
              ACCOUNT_STATUS.PENDING_VERIFICATION
          },
          {
            transaction
          }
        );

        if (
          role === USER_ROLES.JOB_SEEKER
        ) {
          await createJobSeekerProfile(
            {
              userId: user.id,
              firstName,
              lastName,
              phoneNumber
            },
            {
              transaction
            }
          );
        } else if (role === USER_ROLES.RECRUITER) {
          await createRecruiterProfile(
            {
              userId: user.id,
              firstName,
              lastName,
              phoneNumber
            },
            { transaction }
          );
        }

        await saveEmailVerificationToken(
          {
            userId: user.id,
            token:
              hashedVerificationToken,
            expiresAt: new Date(
              Date.now() +
              24 * 60 * 60 * 1000
            )
          },
          {
            transaction
          }
        );

        const payload = {
          id: user.id,
          email: user.email,
          role: user.role
        };

        accessToken =
          generateAccessToken(payload);

        refreshToken =
          generateRefreshToken(payload);

        await createUserSession(
          {
            userId: user.id,
            refreshToken,
            ...deviceInfo,
            expiresAt: new Date(
              Date.now() +
              REFRESH_TOKEN_EXPIRY_MS
            )
          },
          {
            transaction
          }
        );
      }
    );
  } catch (error) {
    if (
      error?.name ===
      "SequelizeUniqueConstraintError"
    ) {
      const concurrentUser =
        await findUserByEmail(email);

      if (concurrentUser) {
        return refreshPendingRegistration({
          user: concurrentUser,
          role
        });
      }
    }

    throw error;
  }

  const verificationEmailSent =
    await sendRegistrationVerification({
      user,
      verificationToken
    });

  await logAuthEvent({
    userId: user.id,
    email: user.email,
    event: "REGISTER",
    status: "SUCCESS",
    ipAddress: deviceInfo.ipAddress,
    userAgent: deviceInfo.userAgent
  });

  return {
    user,
    accessToken,
    refreshToken,
    verificationEmailSent,
    existingPendingRegistration: false
  };
};
const loginUser = async ({
  email,
  password,
  req
}) => {
  const deviceInfo =
    getDeviceInfo(req);

  const user = await findUserByEmail(
    email,
    true
  );

  if (!user) {
    await logAuthEvent({
      email,
      event: "LOGIN",
      status: "FAILED",
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent
    });

    throw new AppError(
      "Invalid email or password.",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  if (user.isLocked()) {
    await logAuthEvent({
      userId: user.id,
      email: user.email,
      event: "ACCOUNT_LOCKED",
      status: "FAILED",
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      metadata: {
        lockedUntil: user.lockedUntil
      }
    });

    throw new AppError(
      "Your account is temporarily locked. Please try again later.",
      423,
      "ACCOUNT_TEMPORARILY_LOCKED"
    );
  }

  if (
    user.status ===
    ACCOUNT_STATUS.PENDING_VERIFICATION
  ) {
    await logAuthEvent({
      userId: user.id,
      email: user.email,
      event: "LOGIN",
      status: "FAILED",
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      metadata: {
        reason: "EMAIL_NOT_VERIFIED"
      }
    });

    throw new AppError(
      "Please verify your email before logging in.",
      403,
      "EMAIL_NOT_VERIFIED"
    );
  }

  if (
    user.status ===
    ACCOUNT_STATUS.DISABLED
  ) {
    await logAuthEvent({
      userId: user.id,
      email: user.email,
      event: "LOGIN",
      status: "FAILED",
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      metadata: {
        reason: "ACCOUNT_DISABLED"
      }
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
    await logAuthEvent({
      userId: user.id,
      email: user.email,
      event: "LOGIN",
      status: "FAILED",
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      metadata: {
        reason: "ACCOUNT_SUSPENDED"
      }
    });

    throw new AppError(
      "Your account has been suspended.",
      403,
      "ACCOUNT_SUSPENDED"
    );
  }

  const passwordMatched =
    await comparePassword(
      password,
      user.passwordHash
    );

  if (!passwordMatched) {
    const failedAttemptResult =
      await incrementFailedLoginAttempts({
        userId: user.id,
        maximumAttempts:
          MAX_FAILED_LOGIN_ATTEMPTS,
        lockDurationMinutes:
          ACCOUNT_LOCK_DURATION_MINUTES
      });

    if (
      failedAttemptResult?.accountLocked
    ) {
      await logAuthEvent({
        userId: user.id,
        email: user.email,
        event: "ACCOUNT_LOCKED",
        status: "FAILED",
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
        metadata: {
          reason:
            "MAX_FAILED_LOGIN_ATTEMPTS",
          failedLoginAttempts:
            failedAttemptResult
              .failedLoginAttempts,
          lockedUntil:
            failedAttemptResult.lockedUntil
        }
      });

      throw new AppError(
        "Your account is temporarily locked. Please try again later.",
        423,
        "ACCOUNT_TEMPORARILY_LOCKED"
      );
    }

    await logAuthEvent({
      userId: user.id,
      email: user.email,
      event: "LOGIN",
      status: "FAILED",
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      metadata: {
        reason: "INVALID_CREDENTIALS",
        failedLoginAttempts:
          failedAttemptResult
            ?.failedLoginAttempts
      }
    });

    throw new AppError(
      "Invalid email or password.",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken =
    generateAccessToken(payload);

  const refreshToken =
    generateRefreshToken(payload);

  await sequelize.transaction(
    async (transaction) => {
      await resetFailedLoginAttempts(
        user.id,
        {
          transaction
        }
      );

      await updateLastLogin(
        user.id,
        {
          transaction
        }
      );

      await createUserSession(
        {
          userId: user.id,
          refreshToken,
          ...deviceInfo,
          expiresAt: new Date(
            Date.now() +
            REFRESH_TOKEN_EXPIRY_MS
          )
        },
        {
          transaction
        }
      );
    }
  );

  await logAuthEvent({
    userId: user.id,
    email: user.email,
    event: "LOGIN",
    status: "SUCCESS",
    ipAddress: deviceInfo.ipAddress,
    userAgent: deviceInfo.userAgent,
    metadata: {
      deviceName:
        deviceInfo.deviceName,
      browser:
        deviceInfo.browser,
      operatingSystem:
        deviceInfo.operatingSystem
    }
  });

  return {
    user,
    accessToken,
    refreshToken
  };
};

const refreshAccessToken = async ({
  refreshToken
}) => {
  if (!refreshToken) {
    throw new AppError(
      "Refresh token is required.",
      401,
      "REFRESH_TOKEN_REQUIRED"
    );
  }

  const payload =
    verifyRefreshToken(refreshToken);

  let existingSession;
  let user;
  let newAccessToken;
  let newRefreshToken;

  try {
    await sequelize.transaction(
      async (transaction) => {
        /*
         * SELECT ... FOR UPDATE
         *
         * This locks the current refresh-token session row.
         * A second concurrent request using the same token
         * must wait until this transaction finishes.
         */
        existingSession =
          await getSessionByRefreshToken(
            refreshToken,
            {
              transaction,
              lock:
                transaction.LOCK.UPDATE
            }
          );

        user = await findUserByEmail(
          payload.email,
          false,
          {
            transaction
          }
        );

        if (!user) {
          throw new AppError(
            "User not found.",
            401,
            "USER_NOT_FOUND"
          );
        }

        if (
          user.status !==
          ACCOUNT_STATUS.ACTIVE
        ) {
          throw new AppError(
            "User account is not active.",
            403,
            "ACCOUNT_NOT_ACTIVE"
          );
        }

        const newPayload = {
          id: user.id,
          email: user.email,
          role: user.role
        };

        newAccessToken =
          generateAccessToken(newPayload);

        newRefreshToken =
          generateRefreshToken(newPayload);

        const revokeResult =
          await revokeUserSession(
            {
              sessionId:
                existingSession.id,
              reason: "TOKEN_ROTATED"
            },
            {
              transaction
            }
          );

        /*
         * Sequelize update returns:
         * [affectedRowCount]
         *
         * Exactly one active session must be revoked.
         */
        const affectedRows =
          Array.isArray(revokeResult)
            ? revokeResult[0]
            : revokeResult;

        if (affectedRows !== 1) {
          throw new AppError(
            "Session has already been used.",
            401,
            "REFRESH_TOKEN_REUSE_DETECTED"
          );
        }

        await createUserSession(
          {
            userId: user.id,
            refreshToken:
              newRefreshToken,
            userAgent:
              existingSession.userAgent,
            ipAddress:
              existingSession.ipAddress,
            deviceName:
              existingSession.deviceName,
            browser:
              existingSession.browser,
            operatingSystem:
              existingSession.operatingSystem,
            expiresAt: new Date(
              Date.now() +
              REFRESH_TOKEN_EXPIRY_MS
            )
          },
          {
            transaction
          }
        );
      }
    );
  } catch (error) {
    if (
      error.code ===
      "REFRESH_TOKEN_REUSE_DETECTED"
    ) {
      const reuseUserId =
        error.userId ||
        existingSession?.userId;

      const reuseSessionId =
        error.sessionId ||
        existingSession?.id;

      /*
       * Run this in a separate transaction.
       * It must commit even though the refresh request fails.
       */
      if (reuseUserId) {
        await sequelize.transaction(
          async (transaction) => {
            await revokeEveryUserSession(
              {
                userId: reuseUserId,
                reason:
                  "REFRESH_TOKEN_REUSE_DETECTED"
              },
              {
                transaction
              }
            );
          }
        );
      }

      await logAuthEvent({
        userId: reuseUserId,
        event:
          "REFRESH_TOKEN_REUSE_DETECTED",
        status: "FAILED",
        metadata: {
          sessionId: reuseSessionId
        }
      });
    }

    throw error;
  }

  await logAuthEvent({
    userId: user.id,
    email: user.email,
    event: "TOKEN_REFRESH",
    status: "SUCCESS",
    ipAddress:
      existingSession.ipAddress,
    userAgent:
      existingSession.userAgent
  });

  return {
    accessToken:
      newAccessToken,
    refreshToken:
      newRefreshToken
  };
};

const logoutUser = async ({
  refreshToken
}) => {
  if (!refreshToken) {
    throw new AppError(
      "Refresh token is required.",
      400,
      "REFRESH_TOKEN_REQUIRED"
    );
  }

  const session =
    await getSessionByRefreshToken(
      refreshToken
    );

  await revokeUserSession({
    sessionId: session.id,
    reason: "LOGOUT"
  });

  await logAuthEvent({
    userId: session.userId,
    event: "LOGOUT",
    status: "SUCCESS",
    ipAddress:
      session.ipAddress,
    userAgent:
      session.userAgent
  });

  return {
    message:
      "Logout successful."
  };
};

const logoutFromAllDevices = async ({
  userId
}) => {
  if (!userId) {
    throw new AppError(
      "User ID is required.",
      400,
      "USER_ID_REQUIRED"
    );
  }

  await revokeEveryUserSession({
    userId,
    reason: "LOGOUT_ALL"
  });

  await logAuthEvent({
    userId,
    event: "LOGOUT_ALL",
    status: "SUCCESS"
  });

  return {
    message:
      "Logged out from all devices successfully."
  };
};

const forgotPassword = async ({
  email
}) => {
  const genericResponse = {
    message:
      "If an account exists for this email, a password reset link has been sent."
  };

  const user =
    await findUserByEmail(email);

  /*
   * Always return the same response.
   * This prevents attackers from checking
   * whether an email is registered.
   */
  if (!user) {
    return genericResponse;
  }

  /*
   * Do not send password-reset emails for
   * accounts that cannot currently log in.
   */
  if (
    user.status !==
    ACCOUNT_STATUS.ACTIVE
  ) {
    return genericResponse;
  }

  const resetToken =
    generateSecureToken();

  const hashedResetToken =
    hashToken(resetToken);

  await savePasswordResetToken({
    email: user.email,
    passwordResetToken:
      hashedResetToken,
    passwordResetExpiresAt:
      new Date(
        Date.now() +
        15 * 60 * 1000
      )
  });

  await sendPasswordResetEmail(
    user.email,
    resetToken
  );

  await logAuthEvent({
    userId: user.id,
    email: user.email,
    event:
      "PASSWORD_RESET_REQUESTED",
    status: "SUCCESS"
  });

  /*
   * Never return the raw reset token
   * through the API response.
   */
  return genericResponse;
};

const resetPassword = async ({
  token,
  password
}) => {
  const hashedToken =
    hashToken(token);

  const user =
    await findUserByPasswordResetToken(
      hashedToken
    );

  if (!user) {
    throw new AppError(
      "Invalid password reset token.",
      400,
      "INVALID_RESET_TOKEN"
    );
  }

  if (
    !user.passwordResetExpiresAt ||
    user.passwordResetExpiresAt <
    new Date()
  ) {
    throw new AppError(
      "Password reset token has expired.",
      400,
      "RESET_TOKEN_EXPIRED"
    );
  }

  const passwordHash =
    await hashPassword(password);

  await sequelize.transaction(
    async (transaction) => {
      await updatePassword(
        {
          userId: user.id,
          passwordHash
        },
        {
          transaction
        }
      );

      await clearPasswordResetToken(
        user.id,
        {
          transaction
        }
      );

      await revokeEveryUserSession(
        {
          userId: user.id,
          reason: "PASSWORD_RESET"
        },
        {
          transaction
        }
      );
    }
  );

  await logAuthEvent({
    userId: user.id,
    email: user.email,
    event: "PASSWORD_RESET",
    status: "SUCCESS"
  });

  return {
    message:
      "Password reset successful."
  };
};

const changePassword = async ({
  userId,
  currentPassword,
  newPassword
}) => {
  const user =
    await findUserByIdWithPassword(
      userId
    );

  if (!user) {
    throw new AppError(
      "User not found.",
      404,
      "USER_NOT_FOUND"
    );
  }

  const passwordMatched =
    await comparePassword(
      currentPassword,
      user.passwordHash
    );

  const samePassword =
    await comparePassword(
      newPassword,
      user.passwordHash
    );

  if (samePassword) {
    throw new AppError(
      "New password must be different from the current password.",
      400,
      "PASSWORD_REUSE_NOT_ALLOWED"
    );
  }

  if (!passwordMatched) {
    await logAuthEvent({
      userId: user.id,
      email: user.email,
      event:
        "PASSWORD_CHANGE",
      status: "FAILED",
      metadata: {
        reason:
          "INVALID_CURRENT_PASSWORD"
      }
    });

    throw new AppError(
      "Current password is incorrect.",
      400,
      "INVALID_CURRENT_PASSWORD"
    );
  }

  const passwordHash =
    await hashPassword(newPassword);

  await sequelize.transaction(
    async (transaction) => {
      await updateUserPassword(
        {
          userId,
          passwordHash
        },
        {
          transaction
        }
      );

      await revokeEveryUserSession(
        {
          userId,
          reason:
            "PASSWORD_CHANGED"
        },
        {
          transaction
        }
      );
    }
  );

  await logAuthEvent({
    userId: user.id,
    email: user.email,
    event:
      "PASSWORD_CHANGED",
    status: "SUCCESS"
  });

  return {
    message:
      "Password changed successfully."
  };
};

const requestEmailChange = async ({
  userId,
  newEmail,
  currentPassword
}) => {
  const normalizedEmail =
    newEmail.trim().toLowerCase();

  const user =
    await findUserByIdWithPassword(userId);

  if (!user) {
    throw new AppError(
      "User not found.",
      404,
      "USER_NOT_FOUND"
    );
  }

  const passwordMatched =
    await comparePassword(
      currentPassword,
      user.passwordHash
    );

  if (!passwordMatched) {
    await logAuthEvent({
      userId: user.id,
      email: user.email,
      event: "EMAIL_CHANGE_REQUEST",
      status: "FAILED",
      metadata: {
        reason: "INVALID_CURRENT_PASSWORD"
      }
    });

    throw new AppError(
      "Current password is incorrect.",
      400,
      "INVALID_CURRENT_PASSWORD"
    );
  }

  if (
    normalizedEmail ===
    user.email.trim().toLowerCase()
  ) {
    throw new AppError(
      "New email must be different from the current email.",
      400,
      "EMAIL_CHANGE_SAME_AS_CURRENT"
    );
  }

  const existingUser =
    await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new AppError(
      "Email is already registered.",
      409,
      "EMAIL_ALREADY_EXISTS"
    );
  }

  const verificationToken =
    generateSecureToken();

  const hashedToken =
    hashToken(verificationToken);

  const expiresAt =
    new Date(
      Date.now() +
      30 * 60 * 1000
    );

  await saveEmailChangeRequest({
    userId: user.id,
    pendingEmail: normalizedEmail,
    emailChangeToken: hashedToken,
    emailChangeExpiresAt: expiresAt
  });

  try {
    await sendEmailChangeVerificationEmail(
      normalizedEmail,
      verificationToken
    );
  } catch {
    await clearEmailChangeRequest(user.id);

    throw new AppError(
      "Unable to send email-change verification email.",
      500,
      "EMAIL_CHANGE_EMAIL_FAILED"
    );
  }

  await logAuthEvent({
    userId: user.id,
    email: user.email,
    event: "EMAIL_CHANGE_REQUESTED",
    status: "SUCCESS",
    metadata: {
      pendingEmail: normalizedEmail
    }
  });

  return {
    message:
      "A verification link has been sent to your new email address."
  };
};

const sendEmailVerification =
  async ({
    email
  }) => {
    const genericResponse = {
      message:
        "If an account exists and requires verification, a verification email has been sent."
    };

    const user =
      await findUserByEmail(email);

    if (!user) {
      return genericResponse;
    }

    if (
      user.status ===
      ACCOUNT_STATUS.ACTIVE &&
      user.emailVerifiedAt
    ) {
      return genericResponse;
    }

    const verificationToken =
      generateSecureToken();

    const hashedToken =
      hashToken(verificationToken);

    await saveEmailVerificationToken({
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(
        Date.now() +
        24 * 60 * 60 * 1000
      )
    });

    await sendVerificationEmail(
      user.email,
      verificationToken
    );

    await logAuthEvent({
      userId: user.id,
      email: user.email,
      event:
        "EMAIL_VERIFICATION_SENT",
      status: "SUCCESS"
    });

    return genericResponse;
  };

const verifyEmail = async ({
  token
}) => {
  const hashedToken =
    hashToken(token);

  const user =
    await findUserByEmailVerificationToken(
      hashedToken
    );

  if (!user) {
    throw new AppError(
      "Invalid verification token.",
      400,
      "INVALID_VERIFICATION_TOKEN"
    );
  }

  if (
    !user.emailVerificationExpiresAt ||
    user.emailVerificationExpiresAt <
    new Date()
  ) {
    throw new AppError(
      "Verification token expired.",
      400,
      "VERIFICATION_TOKEN_EXPIRED"
    );
  }

  await sequelize.transaction(
    async (transaction) => {
      await verifyUserEmail(
        user.id,
        {
          transaction
        }
      );

      await revokeEveryUserSession(
        {
          userId: user.id,
          reason: "EMAIL_VERIFIED"
        },
        {
          transaction
        }
      );
    }
  );

  await logAuthEvent({
    userId: user.id,
    email: user.email,
    event: "EMAIL_VERIFIED",
    status: "SUCCESS"
  });

  return {
    message:
      "Email verified successfully."
  };
};

const declineEmailVerification = async ({
  token
}) => {
  const hashedToken =
    hashToken(token);

  const user =
    await findUserByEmailVerificationToken(
      hashedToken
    );

  if (!user) {
    throw new AppError(
      "This registration link is invalid, expired, or has already been used.",
      400,
      "INVALID_VERIFICATION_TOKEN"
    );
  }

  if (
    !user.emailVerificationExpiresAt ||
    user.emailVerificationExpiresAt <
    new Date()
  ) {
    throw new AppError(
      "Verification token expired.",
      400,
      "VERIFICATION_TOKEN_EXPIRED"
    );
  }

  const email = user.email;
  const userId = user.id;

  const deletedCount =
    await deletePendingUserById(userId);

  if (!deletedCount) {
    throw new AppError(
      "This registration can no longer be cancelled.",
      409,
      "REGISTRATION_NOT_PENDING"
    );
  }

  await logAuthEvent({
    email,
    event: "EMAIL_VERIFICATION_DECLINED",
    status: "SUCCESS",
    metadata: {
      cancelledUserId: userId
    }
  });

  return {
    message:
      "Pending registration cancelled successfully."
  };
};

const verifyEmailChange = async ({
  token
}) => {
  const hashedToken =
    hashToken(token);

  const user =
    await findUserByEmailChangeToken(
      hashedToken
    );

  if (!user) {
    throw new AppError(
      "Invalid email change token.",
      400,
      "INVALID_EMAIL_CHANGE_TOKEN"
    );
  }

  if (
    !user.emailChangeExpiresAt ||
    user.emailChangeExpiresAt <
    new Date()
  ) {
    await clearEmailChangeRequest(
      user.id
    );

    throw new AppError(
      "Email change token has expired.",
      400,
      "EMAIL_CHANGE_TOKEN_EXPIRED"
    );
  }

  if (!user.pendingEmail) {
    throw new AppError(
      "No email change request was found.",
      400,
      "EMAIL_CHANGE_REQUEST_NOT_FOUND"
    );
  }

  const newEmail =
    user.pendingEmail
      .trim()
      .toLowerCase();

  const existingUser =
    await findUserByEmail(newEmail);

  if (
    existingUser &&
    existingUser.id !== user.id
  ) {
    await clearEmailChangeRequest(
      user.id
    );

    throw new AppError(
      "Email is already registered.",
      409,
      "EMAIL_ALREADY_EXISTS"
    );
  }

  const oldEmail =
    user.email;

  try {
    await sequelize.transaction(
      async (transaction) => {
        await completeEmailChange(
          {
            userId: user.id,
            newEmail
          },
          {
            transaction
          }
        );

        await revokeEveryUserSession(
          {
            userId: user.id,
            reason:
              "EMAIL_CHANGED"
          },
          {
            transaction
          }
        );
      }
    );
  } catch (error) {
    if (
      error.name ===
      "SequelizeUniqueConstraintError"
    ) {
      throw new AppError(
        "Email is already registered.",
        409,
        "EMAIL_ALREADY_EXISTS"
      );
    }

    throw error;
  }

  await logAuthEvent({
    userId: user.id,
    email: newEmail,
    event: "EMAIL_CHANGED",
    status: "SUCCESS",
    metadata: {
      oldEmail,
      newEmail
    }
  });

  return {
    message:
      "Email changed successfully. Please log in again using your new email."
  };
};

const getCurrentUser = async ({
  userId
}) => {
  const user =
    await findUserById(userId);

  if (!user) {
    throw new AppError(
      "User not found.",
      404,
      "USER_NOT_FOUND"
    );
  }

  return user;
};

export {
  registerUser,
  loginUser,
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
};