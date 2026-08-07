import RefreshToken from "../models/refreshToken.model.js";

const createRefreshToken = async ({
  userId,
  token,
  expiresAt
}) => {
  return RefreshToken.create({
    userId,
    token,
    expiresAt
  });
};

const findRefreshToken = async (token) => {
  return RefreshToken.findOne({
    where: {
      token,
      revoked: false
    }
  });
};

const revokeRefreshToken = async (token) => {
  return RefreshToken.update(
    {
      revoked: true
    },
    {
      where: {
        token
      }
    }
  );
};

const revokeAllUserRefreshTokens = async (
  userId
) => {
  return RefreshToken.update(
    {
      revoked: true
    },
    {
      where: {
        userId
      }
    }
  );
};

export {
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens
};