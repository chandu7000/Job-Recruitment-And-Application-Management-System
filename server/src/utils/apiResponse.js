const sendSuccess = (
  res,
  statusCode,
  message,
  data = {},
  meta = {}
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
    requestId: res.req.requestId,
    timestamp: new Date().toISOString()
  });
};

export { sendSuccess };