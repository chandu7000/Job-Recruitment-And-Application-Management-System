import { sendError } from "../utils/apiError.js";

const notFoundMiddleware = (req, res) => {
  return sendError(
    res,
    404,
    `API endpoint not found: ${req.method} ${req.originalUrl}`,
    "ROUTE_NOT_FOUND"
  );
};

export default notFoundMiddleware;