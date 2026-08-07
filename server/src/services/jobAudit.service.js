const logJobEvent = async ({
  recruiterId = null,
  jobId = null,
  companyId = null,
  event,
  status = "SUCCESS",
  previousStatus = null,
  nextStatus = null,
  ipAddress = null,
  userAgent = null,
  requestId = null,
  metadata = null
}) => {
  console.log(
    "========== JOB AUDIT =========="
  );

  console.log({
    timestamp:
      new Date().toISOString(),

    recruiterId,
    jobId,
    companyId,
    event,
    status,
    previousStatus,
    nextStatus,
    ipAddress,
    userAgent,
    requestId,
    metadata
  });

  console.log(
    "==============================="
  );
};

export {
  logJobEvent
};