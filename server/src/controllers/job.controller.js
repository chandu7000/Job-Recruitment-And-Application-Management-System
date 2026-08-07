import {
  createDraftJob,
  getRecruiterJobs,
  getRecruiterJobById,
  updateEligibleJob,
  publishEligibleJob,
  closePublishedJob,
  deleteEligibleDraftJob
} from "../services/job.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";

const createJob = async (
  req,
  res,
  next
) => {
  try {
    const job =
      await createDraftJob({
        recruiterId:
          req.user.id,

        payload:
          req.body,

        auditContext: {
          ipAddress:
            req.ip ??
            req.socket
              ?.remoteAddress ??
            null,

          userAgent:
            req.get(
              "user-agent"
            ) ?? null,

          requestId:
            req.requestId ??
            null
        }
      });

    return sendSuccess(
      res,
      201,
      "Job draft created successfully.",
      job
    );
  } catch (error) {
    return next(error);
  }
};

const getMyJobs = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await getRecruiterJobs({
        recruiterId:
          req.user.id,

        query:
          req.query
      });

    return sendSuccess(
      res,
      200,
      "Recruiter jobs fetched successfully.",
      result.jobs,
      result.pagination
    );
  } catch (error) {
    return next(error);
  }
};

const getMyJobById = async (
  req,
  res,
  next
) => {
  try {
    const job =
      await getRecruiterJobById({
        recruiterId:
          req.user.id,

        jobId:
          req.params.jobId
      });

    return sendSuccess(
      res,
      200,
      "Job fetched successfully.",
      job
    );
  } catch (error) {
    return next(error);
  }
};

const updateJob = async (
  req,
  res,
  next
) => {
  try {
    const job =
      await updateEligibleJob({
        recruiterId:
          req.user.id,

        jobId:
          req.params.jobId,

        payload:
          req.body,

        auditContext: {
          ipAddress:
            req.ip ??
            req.socket
              ?.remoteAddress ??
            null,

          userAgent:
            req.get(
              "user-agent"
            ) ?? null,

          requestId:
            req.requestId ??
            null
        }
      });

    return sendSuccess(
      res,
      200,
      "Job updated successfully.",
      job
    );
  } catch (error) {
    return next(error);
  }
};

const publishJob = async (
  req,
  res,
  next
) => {
  try {
    const job =
      await publishEligibleJob({
        recruiterId:
          req.user.id,

        jobId:
          req.params.jobId,

        auditContext: {
          ipAddress:
            req.ip ??
            req.socket
              ?.remoteAddress ??
            null,

          userAgent:
            req.get(
              "user-agent"
            ) ?? null,

          requestId:
            req.requestId ??
            null
        }
      });

    return sendSuccess(
      res,
      200,
      "Job published successfully.",
      job
    );
  } catch (error) {
    return next(error);
  }
};

const closeJob = async (
  req,
  res,
  next
) => {
  try {
    const job =
      await closePublishedJob({
        recruiterId:
          req.user.id,

        jobId:
          req.params.jobId,

        closureReason:
          req.body.closureReason ??
          "RECRUITER_CLOSED",

        auditContext: {
          ipAddress:
            req.ip ??
            req.socket
              ?.remoteAddress ??
            null,

          userAgent:
            req.get(
              "user-agent"
            ) ?? null,

          requestId:
            req.requestId ??
            null
        }
      });

    return sendSuccess(
      res,
      200,
      "Job closed successfully.",
      job
    );
  } catch (error) {
    return next(error);
  }
};

const deleteJob = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await deleteEligibleDraftJob({
        recruiterId:
          req.user.id,

        jobId:
          req.params.jobId,

        auditContext: {
          ipAddress:
            req.ip ??
            req.socket
              ?.remoteAddress ??
            null,

          userAgent:
            req.get(
              "user-agent"
            ) ?? null,

          requestId:
            req.requestId ??
            null
        }
      });

    return sendSuccess(
      res,
      200,
      result.message,
      {}
    );
  } catch (error) {
    return next(error);
  }
};

export {
  createJob,
  getMyJobs,
  getMyJobById,
  updateJob,
  publishJob,
  closeJob,
  deleteJob,
};