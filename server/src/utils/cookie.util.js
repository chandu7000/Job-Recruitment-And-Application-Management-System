import {
  REFRESH_TOKEN_COOKIE_NAME,
  refreshTokenCookieOptions,
  clearRefreshTokenCookieOptions
} from "../config/cookie.config.js";

const setRefreshTokenCookie = (
  res,
  refreshToken
) => {
  res.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    refreshTokenCookieOptions
  );
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(
    REFRESH_TOKEN_COOKIE_NAME,
    clearRefreshTokenCookieOptions
  );
};

const getRefreshTokenFromRequest = (req) => {
  return (
    req.cookies?.[
      REFRESH_TOKEN_COOKIE_NAME
    ] || null
  );
};

export {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest
};