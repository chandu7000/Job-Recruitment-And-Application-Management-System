const sendError = (
  res,
  statusCode,
  message,
  code = "INTERNAL_SERVER_ERROR",
  errors = []
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    errors,
    requestId: res.req?.requestId || null,
    timestamp: new Date().toISOString()
  });
};

export { sendError };