import helmet from "helmet";

import env from "../config/env.js";

const securityHeaders = helmet({
  /*
   * CareerForge currently serves a JSON API rather than HTML pages.
   * The React frontend should configure its own CSP.
   */
  contentSecurityPolicy: false,

  /*
   * Prevents the API from being embedded inside frames.
   */
  xFrameOptions: {
    action: "deny"
  },

  /*
   * Allows the separate frontend origin to request API resources.
   * CORS middleware still decides which origins are permitted.
   */
  crossOriginResourcePolicy: {
    policy: "cross-origin"
  },

  /*
   * Keeps browser contexts isolated.
   */
  crossOriginOpenerPolicy: {
    policy: "same-origin"
  },

  /*
   * Avoids breaking API requests and development tools that do not
   * support cross-origin isolation.
   */
  crossOriginEmbedderPolicy: false,

  /*
   * Prevents referrer details from being sent.
   */
  referrerPolicy: {
    policy: "no-referrer"
  },

  /*
   * HSTS should only be enabled when production is served through HTTPS.
   */
  strictTransportSecurity: env.isProduction
    ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: false
      }
    : false,

  /*
   * Prevents MIME-type sniffing.
   */
  xContentTypeOptions: true,

  /*
   * Prevents Adobe products from loading cross-domain content.
   */
  xPermittedCrossDomainPolicies: {
    permittedPolicies: "none"
  }
});

export default securityHeaders;