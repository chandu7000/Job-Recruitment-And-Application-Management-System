import env from "../config/env.js";

import AppError from "../utils/AppError.js";

const getOriginFromReferer = (referer) => {
  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
};

const originProtection = (
  req,
  res,
  next
) => {
  /*
   * Bearer-token-only requests are not vulnerable
   * to traditional cookie-based CSRF attacks.
   */
  const authorizationHeader =
    req.get("authorization");

  const hasBearerToken =
    authorizationHeader
      ?.toLowerCase()
      .startsWith("bearer ");

  const hasRefreshTokenCookie =
    Boolean(req.cookies?.refreshToken);

  if (
    hasBearerToken &&
    !hasRefreshTokenCookie
  ) {
    return next();
  }

  const originHeader =
    req.get("origin");

  const refererOrigin =
    getOriginFromReferer(
      req.get("referer")
    );

  const requestOrigin =
    originHeader || refererOrigin;

  /*
   * Supertest and other test clients normally do
   * not send Origin or Referer headers.
   */
  if (
    env.isTest &&
    !requestOrigin
  ) {
    return next();
  }

  if (!requestOrigin) {
    throw new AppError(
      "Request origin could not be verified.",
      403,
      "ORIGIN_REQUIRED"
    );
  }

  if (
    !env.cors.clientOrigins.includes(
      requestOrigin
    )
  ) {
    throw new AppError(
      "Request origin is not allowed.",
      403,
      "ORIGIN_NOT_ALLOWED"
    );
  }

  const fetchSite =
    req.get("sec-fetch-site");

  if (
    fetchSite === "cross-site"
  ) {
    throw new AppError(
      "Cross-site request is not allowed.",
      403,
      "CROSS_SITE_REQUEST_BLOCKED"
    );
  }

  return next();
};

export default originProtection;