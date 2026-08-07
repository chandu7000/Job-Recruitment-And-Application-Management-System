import { Op } from "sequelize";

import UserSession from "../models/userSession.model.js";

const createSession = async (
  sessionData,
  { transaction } = {}
) => {
  return UserSession.create(
    sessionData,
    {
      transaction
    }
  );
};

const findSessionByRefreshTokenHash = async (
  refreshTokenHash,
  { transaction, lock } = {}
) => {
  return UserSession
    .scope("withRefreshTokenHash")
    .findOne({
      where: {
        refreshTokenHash
      },
      transaction,
      lock
    });
};

const findSessionById = async (
  id,
  { transaction, lock } = {}
) => {
  return UserSession.findByPk(id, {
    transaction,
    lock
  });
};

const findActiveSessionsByUserId = async (
  userId,
  { transaction } = {}
) => {
  return UserSession.findAll({
    where: {
      userId,
      revokedAt: null
    },
    order: [
      ["createdAt", "DESC"]
    ],
    transaction
  });
};

const updateSession = async (
  session,
  updates,
  { transaction } = {}
) => {
  return session.update(
    updates,
    {
      transaction
    }
  );
};

const revokeSession = async (
  sessionId,
  reason = "LOGOUT",
  { transaction } = {}
) => {
  return UserSession.update(
    {
      revokedAt: new Date(),
      revocationReason: reason
    },
    {
      where: {
        id: sessionId,
        revokedAt: null
      },
      transaction
    }
  );
};

const revokeAllUserSessions = async (
  userId,
  reason = "LOGOUT_ALL",
  { transaction } = {}
) => {
  return UserSession.update(
    {
      revokedAt: new Date(),
      revocationReason: reason
    },
    {
      where: {
        userId,
        revokedAt: null
      },
      transaction
    }
  );
};

const deleteStaleSessions = async (
  {
    currentTime = new Date(),
    revokedBefore
  },
  { transaction } = {}
) => {
  return UserSession.destroy({
    where: {
      [Op.or]: [
        {
          expiresAt: {
            [Op.lt]: currentTime
          }
        },
        {
          revokedAt: {
            [Op.ne]: null,
            [Op.lt]: revokedBefore
          }
        }
      ]
    },
    transaction
  });
};

export {
  createSession,
  findSessionByRefreshTokenHash,
  findSessionById,
  findActiveSessionsByUserId,
  updateSession,
  revokeSession,
  revokeAllUserSessions,
  deleteStaleSessions,
};