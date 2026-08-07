import crypto from "crypto";

const requestIdMiddleware = (req, res, next) => {
  const requestId = `req_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  req.requestId = requestId;

  res.setHeader("X-Request-Id", requestId);

  next();
};

export default requestIdMiddleware;