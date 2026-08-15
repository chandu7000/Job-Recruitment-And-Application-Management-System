import {
  AUTH_TAB_ID_HEADER,
  REFRESH_TOKEN_COOKIE_NAME,
  refreshTokenCookieOptions,
  clearRefreshTokenCookieOptions
} from "../config/cookie.config.js";

const AUTH_TAB_ID_PATTERN =
  /^[A-Za-z0-9-]{1,100}$/;

const getRefreshTokenCookieName = (req) => {
  const rawTabId =
    req?.get?.(AUTH_TAB_ID_HEADER) ||
    req?.headers?.[AUTH_TAB_ID_HEADER];

  if (
    typeof rawTabId !== "string" ||
    !AUTH_TAB_ID_PATTERN.test(rawTabId)
  ) {
    return REFRESH_TOKEN_COOKIE_NAME;
  }

  return `${REFRESH_TOKEN_COOKIE_NAME}_${rawTabId}`;
};

const setRefreshTokenCookie = (
  res,
  refreshToken,
  req = null
) => {
  res.cookie(
    getRefreshTokenCookieName(req),
    refreshToken,
    refreshTokenCookieOptions
  );
};

const clearRefreshTokenCookie = (
  res,
  req = null
) => {
  res.clearCookie(
    getRefreshTokenCookieName(req),
    clearRefreshTokenCookieOptions
  );
};

const getRefreshTokenFromRequest = (req) => {
  return (
    req.cookies?.[
      getRefreshTokenCookieName(req)
    ] || null
  );
};

export {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
  getRefreshTokenCookieName
};
