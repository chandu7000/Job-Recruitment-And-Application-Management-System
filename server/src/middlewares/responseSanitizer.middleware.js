import env from "../config/env.js";
import { removeSensitiveFields } from "../utils/securityPolicy.js";

const responseSanitizerMiddleware = (req, res, next) => {
  void req;
  const originalJson = res.json.bind(res);
  res.json = (payload) => originalJson(removeSensitiveFields(payload));
  if (env.isProduction) res.removeHeader("Server");
  next();
};

export default responseSanitizerMiddleware;
