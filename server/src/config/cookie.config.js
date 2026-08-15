const REFRESH_TOKEN_COOKIE_NAME =
  "refreshToken";

const AUTH_TAB_ID_HEADER =
  "x-auth-tab-id";

const REFRESH_TOKEN_COOKIE_MAX_AGE =
  7 * 24 * 60 * 60 * 1000;

const isProduction =
  process.env.NODE_ENV === "production";

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
  path: "/api/auth"
};

const clearRefreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/api/auth"
};

export {
  REFRESH_TOKEN_COOKIE_NAME,
  AUTH_TAB_ID_HEADER,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
  refreshTokenCookieOptions,
  clearRefreshTokenCookieOptions
};