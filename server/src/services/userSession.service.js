import crypto from "crypto";

import {
  createSession,
  findSessionByRefreshTokenHash,
  updateSession,
  revokeSession,
  revokeAllUserSessions,
  findActiveSessionsByUserId,
  findSessionById
} from "../repositories/userSession.repository.js";

import AppError from "../utils/AppError.js";

const hashRefreshToken = (refreshToken) => {
  return crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
};

const createUserSession = async (
  {
    userId,
    refreshToken,
    userAgent = null,
    ipAddress = null,
    deviceName = null,
    browser = null,
    operatingSystem = null,
    expiresAt
  },
  { transaction } = {}
) => {
  const refreshTokenHash =
    hashRefreshToken(refreshToken);

  return createSession(
    {
      userId,
      refreshTokenHash,
      userAgent,
      ipAddress,
      deviceName,
      browser,
      operatingSystem,
      expiresAt,
      lastUsedAt: new Date()
    },
    {
      transaction
    }
  );
};

const getSessionByRefreshToken = async (
  refreshToken,
  {
    transaction,
    lock
  } = {}
) => {
  if (!refreshToken) {
    throw new AppError(
      "Refresh token is required.",
      401,
      "REFRESH_TOKEN_REQUIRED"
    );
  }

  const refreshTokenHash =
    hashRefreshToken(refreshToken);

  const session =
    await findSessionByRefreshTokenHash(
      refreshTokenHash,
      {
        transaction,
        lock
      }
    );

  if (!session) {
    throw new AppError(
      "Session is invalid.",
      401,
      "INVALID_SESSION"
    );
  }

  if (session.revokedAt) {
    const isRotatedTokenReuse =
      session.revocationReason ===
      "TOKEN_ROTATED";

    if (isRotatedTokenReuse) {
      const error = new AppError(
        "Refresh token reuse detected. All sessions have been revoked.",
        401,
        "REFRESH_TOKEN_REUSE_DETECTED"
      );

      error.userId = session.userId;
      error.sessionId = session.id;

      throw error;
    }

    throw new AppError(
      "Session has been revoked.",
      401,
      "SESSION_REVOKED"
    );
  }

  if (session.expiresAt < new Date()) {
    throw new AppError(
      "Session has expired.",
      401,
      "SESSION_EXPIRED"
    );
  }

  await updateSession(
    session,
    {
      lastUsedAt: new Date()
    },
    {
      transaction
    }
  );

  return session;
};

const revokeUserSession = async (
  {
    sessionId,
    reason = "LOGOUT"
  },
  { transaction } = {}
) => {
  return revokeSession(
    sessionId,
    reason,
    {
      transaction
    }
  );
};

const revokeEveryUserSession = async (
  {
    userId,
    reason = "LOGOUT_ALL"
  },
  { transaction } = {}
) => {
  return revokeAllUserSessions(
    userId,
    reason,
    {
      transaction
    }
  );
};

const getUserSessions = async (
  {
    userId
  },
  { transaction } = {}
) => {
  return findActiveSessionsByUserId(
    userId,
    {
      transaction
    }
  );
};

const revokeSpecificSession = async (
  {
    userId,
    sessionId
  },
  { transaction } = {}
) => {
  const session =
    await findSessionById(
      sessionId,
      {
        transaction
      }
    );

  if (!session) {
    throw new AppError(
      "Session not found.",
      404,
      "SESSION_NOT_FOUND"
    );
  }

  if (session.userId !== userId) {
    throw new AppError(
      "You are not authorized to revoke this session.",
      403,
      "FORBIDDEN"
    );
  }

  if (session.revokedAt) {
    throw new AppError(
      "Session already revoked.",
      400,
      "SESSION_ALREADY_REVOKED"
    );
  }

  await revokeSession(
    sessionId,
    "LOGOUT",
    {
      transaction
    }
  );

  return {
    message:
      "Session revoked successfully."
  };
};

export {
  hashRefreshToken,
  createUserSession,
  getSessionByRefreshToken,
  revokeUserSession,
  revokeEveryUserSession,
  getUserSessions,
  revokeSpecificSession
};