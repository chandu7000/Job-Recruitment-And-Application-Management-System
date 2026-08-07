import {
  sendSuccess
} from "../utils/apiResponse.js";

import {
  buildRequestContext
} from "../services/audit.service.js";

import {
  submitReport,
  listReports,
  getReportDetails,
  processReport
} from "../services/report.service.js";

import {
  getAdminDashboard,
  getRecruiterDashboard,
  getJobSeekerSummary
} from "../services/dashboard.service.js";

import {
  searchUsers,
  moderateUser,
  listAdminJobs,
  getAdminJob,
  moderateJob,
  listAuditLogs,
  getAuditLog
} from "../services/adminManagement.service.js";

export const createReport = async (
  req,
  res,
  next
) => {
  try {
    const report = await submitReport({
      reporter: req.user,
      ...req.body,
      requestContext:
        buildRequestContext(req)
    });

    return sendSuccess(
      res,
      201,
      "Report submitted successfully.",
      report
    );
  } catch (error) {
    return next(error);
  }
};

export const adminReports = async (
  req,
  res,
  next
) => {
  try {
    const reports =
      await listReports(req.query);

    return sendSuccess(
      res,
      200,
      "Reports fetched successfully.",
      reports
    );
  } catch (error) {
    return next(error);
  }
};

export const adminReport = async (
  req,
  res,
  next
) => {
  try {
    const report =
      await getReportDetails(
        req.params.id
      );

    return sendSuccess(
      res,
      200,
      "Report fetched successfully.",
      report
    );
  } catch (error) {
    return next(error);
  }
};

export const adminProcessReport = async (
  req,
  res,
  next
) => {
  try {
    const report =
      await processReport({
        id: req.params.id,
        admin: req.user,
        ...req.body,
        requestContext:
          buildRequestContext(req)
      });

    return sendSuccess(
      res,
      200,
      "Report processed successfully.",
      report
    );
  } catch (error) {
    return next(error);
  }
};

export const adminDashboard = async (
  req,
  res,
  next
) => {
  try {
    const dashboard =
      await getAdminDashboard();

    return sendSuccess(
      res,
      200,
      "Admin dashboard fetched successfully.",
      dashboard
    );
  } catch (error) {
    return next(error);
  }
};

export const recruiterDashboard = async (
  req,
  res,
  next
) => {
  try {
    const dashboard =
      await getRecruiterDashboard(
        req.user.id
      );

    return sendSuccess(
      res,
      200,
      "Recruiter dashboard fetched successfully.",
      dashboard
    );
  } catch (error) {
    return next(error);
  }
};

export const jobSeekerSummary = async (
  req,
  res,
  next
) => {
  try {
    const summary =
      await getJobSeekerSummary(
        req.user.id
      );

    return sendSuccess(
      res,
      200,
      "Job-seeker summary fetched successfully.",
      summary
    );
  } catch (error) {
    return next(error);
  }
};

export const adminUsers = async (
  req,
  res,
  next
) => {
  try {
    const users =
      await searchUsers(req.query);

    return sendSuccess(
      res,
      200,
      "Users fetched successfully.",
      users
    );
  } catch (error) {
    return next(error);
  }
};

export const adminModerateUser = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await moderateUser({
        targetId: req.params.id,
        admin: req.user,
        ...req.body,
        requestContext:
          buildRequestContext(req)
      });

    return sendSuccess(
      res,
      200,
      "User status updated successfully.",
      user
    );
  } catch (error) {
    return next(error);
  }
};

export const adminJobs = async (
  req,
  res,
  next
) => {
  try {
    const jobs =
      await listAdminJobs(req.query);

    return sendSuccess(
      res,
      200,
      "Jobs fetched successfully.",
      jobs
    );
  } catch (error) {
    return next(error);
  }
};

export const adminJob = async (
  req,
  res,
  next
) => {
  try {
    const job =
      await getAdminJob(
        req.params.id
      );

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

export const adminModerateJob = async (
  req,
  res,
  next
) => {
  try {
    const job =
      await moderateJob({
        id: req.params.id,
        admin: req.user,
        ...req.body,
        requestContext:
          buildRequestContext(req)
      });

    return sendSuccess(
      res,
      200,
      "Job moderation completed successfully.",
      job
    );
  } catch (error) {
    return next(error);
  }
};

export const adminAudits = async (
  req,
  res,
  next
) => {
  try {
    const auditLogs =
      await listAuditLogs(req.query);

    return sendSuccess(
      res,
      200,
      "Audit logs fetched successfully.",
      auditLogs
    );
  } catch (error) {
    return next(error);
  }
};

export const adminAudit = async (
  req,
  res,
  next
) => {
  try {
    const auditLog =
      await getAuditLog(
        req.params.id
      );

    return sendSuccess(
      res,
      200,
      "Audit log fetched successfully.",
      auditLog
    );
  } catch (error) {
    return next(error);
  }
};