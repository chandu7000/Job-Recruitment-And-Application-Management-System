import { Op } from "sequelize";
import Report from "../models/report.model.js";
import Job from "../models/job.model.js";
import Company from "../models/company.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import {
  REPORT_ACTIVE_STATUSES,
  REPORT_TARGET_TYPES,
  REPORT_TRANSITIONS
} from "../constants/report.constants.js";
import { createAuditLogSafely } from "./audit.service.js";
import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCE_TYPES
} from "../constants/audit.constants.js";

const assertTarget = async (type, id) => {
  const model =
    type === REPORT_TARGET_TYPES.JOB
      ? Job
      : Company;

  const target = await model.findByPk(id);

  if (!target) {
    throw new AppError(
      "Report target not found.",
      404,
      "REPORT_TARGET_NOT_FOUND"
    );
  }

  return target;
};

export const submitReport = async ({
  reporter,
  targetType,
  targetResourceId,
  category,
  description,
  requestContext
}) => {
  await assertTarget(
    targetType,
    targetResourceId
  );

  const duplicate = await Report.findOne({
    where: {
      reporterId: reporter.id,
      targetType,
      targetResourceId,
      category,
      status: {
        [Op.in]: REPORT_ACTIVE_STATUSES
      }
    }
  });

  if (duplicate) {
    throw new AppError(
      "An active report already exists for this target and category.",
      409,
      "DUPLICATE_ACTIVE_REPORT"
    );
  }

  const report = await Report.create({
    reporterId: reporter.id,
    targetType,
    targetResourceId,
    category,
    description
  });

  await createAuditLogSafely({
    actor: reporter,
    action: AUDIT_ACTIONS.REPORT_SUBMITTED,
    resourceType: AUDIT_RESOURCE_TYPES.REPORT,
    resourceId: report.id,
    metadata: {
      targetType,
      targetResourceId,
      category
    },
    requestContext
  });

  return report;
};

export const listReports = async ({
  page = 1,
  limit = 20,
  status,
  targetType,
  category,
  reporterId,
  reviewedBy,
  sort = "desc"
}) => {
  limit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  page = Math.max(
    Number(page) || 1,
    1
  );

  const where = {};

  for (const [key, value] of Object.entries({
    status,
    targetType,
    category,
    reporterId,
    reviewedBy
  })) {
    if (value) {
      where[key] = value;
    }
  }

  const result =
    await Report.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "reporter",
          attributes: [
            "id",
            "email",
            "role",
            "status"
          ]
        },
        {
          model: User,
          as: "reviewer",
          attributes: [
            "id",
            "email",
            "role"
          ]
        }
      ],
      order: [
        [
          "createdAt",
          sort === "asc"
            ? "ASC"
            : "DESC"
        ]
      ],
      limit,
      offset: (page - 1) * limit,
      distinct: true
    });

  return {
    reports: result.rows,
    pagination: {
      totalItems: result.count,
      totalPages: Math.ceil(
        result.count / limit
      ),
      page,
      limit,
      hasNext:
        page * limit < result.count,
      hasPrevious: page > 1
    }
  };
};

export const getReportDetails = async (
  id
) => {
  const report =
    await Report.findByPk(id, {
      include: [
        {
          model: User,
          as: "reporter",
          attributes: [
            "id",
            "email",
            "role",
            "status"
          ]
        },
        {
          model: User,
          as: "reviewer",
          attributes: [
            "id",
            "email",
            "role"
          ]
        }
      ]
    });

  if (!report) {
    throw new AppError(
      "Report not found.",
      404,
      "REPORT_NOT_FOUND"
    );
  }

  return report;
};

export const processReport = async ({
  id,
  admin,
  status,
  adminResolution,
  adminRemarks,
  requestContext
}) => {
  const report =
    await Report.findByPk(id);

  if (!report) {
    throw new AppError(
      "Report not found.",
      404,
      "REPORT_NOT_FOUND"
    );
  }

  if (
    !REPORT_TRANSITIONS[
      report.status
    ]?.includes(status)
  ) {
    throw new AppError(
      "Invalid report status transition.",
      409,
      "INVALID_REPORT_STATUS_TRANSITION"
    );
  }

  report.status = status;
  report.adminResolution =
    adminResolution || null;
  report.adminRemarks =
    adminRemarks || null;
  report.reviewedBy = admin.id;
  report.reviewedAt = new Date();

  await report.save();

  const action = {
    UNDER_REVIEW:
      AUDIT_ACTIONS.REPORT_UNDER_REVIEW,
    RESOLVED:
      AUDIT_ACTIONS.REPORT_RESOLVED,
    DISMISSED:
      AUDIT_ACTIONS.REPORT_DISMISSED
  }[status];

  await createAuditLogSafely({
    actor: admin,
    action,
    resourceType:
      AUDIT_RESOURCE_TYPES.REPORT,
    resourceId: report.id,
    metadata: {
      status
    },
    requestContext
  });

  return report;
};