const logAuthEvent = async ({
  userId = null,
  email = null,
  event,
  status = "SUCCESS",
  ipAddress = null,
  userAgent = null,
  metadata = null
}) => {
  console.log("========== AUTH AUDIT ==========");
  console.log({
    timestamp: new Date().toISOString(),
    userId,
    email,
    event,
    status,
    ipAddress,
    userAgent,
    metadata
  });
  console.log("================================");
};

export { logAuthEvent };