import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import AppError from "./AppError.js";

const JWT_ALGORITHM = "HS256";

const signOptions = (expiresIn) => ({
  expiresIn,
  algorithm: JWT_ALGORITHM
});

const verifyOptions = {
  algorithms: [JWT_ALGORITHM]
};

const generateAccessToken = (payload) =>
  jwt.sign(payload, env.jwt.accessSecret, signOptions(env.jwt.accessExpiresIn));

const generateRefreshToken = (payload) =>
  jwt.sign({ ...payload, jti: crypto.randomUUID() }, env.jwt.refreshSecret, signOptions(env.jwt.refreshExpiresIn));

const verifyToken = (token, secret, expiredCode, invalidCode, tokenName) => {
  try {
    return jwt.verify(token, secret, verifyOptions);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(`${tokenName} has expired.`, 401, expiredCode);
    }
    throw new AppError(`Invalid ${tokenName.toLowerCase()}.`, 401, invalidCode);
  }
};

const verifyAccessToken = (token) => verifyToken(token, env.jwt.accessSecret, "ACCESS_TOKEN_EXPIRED", "INVALID_ACCESS_TOKEN", "Access token");
const verifyRefreshToken = (token) => verifyToken(token, env.jwt.refreshSecret, "REFRESH_TOKEN_EXPIRED", "INVALID_REFRESH_TOKEN", "Refresh token");

export {
  JWT_ALGORITHM,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
