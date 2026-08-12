import { Op } from "sequelize";

import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import Job from "../models/job.model.js";
import AuditLog from "../models/auditLog.model.js";

import AppError from "../utils/AppError.js";

import {
  ACCOUNT_STATUS
} from "../constants/app.constants.js";

import {
  JOB_STATUSES
} from "../constants/job.constants.js";

import {
  createAuditLogSafely
} from "./audit.service.js";

import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCE_TYPES
} from "../constants/audit.constants.js";


const paging = (
  page,
  limit
) => ({
  page: Math.max(
    Number(page) || 1,
    1
  ),

  limit: Math.min(
    Math.max(
      Number(limit) || 20,
      1
    ),
    100
  )
});


const resultPage = (
  result,
  page,
  limit,
  key
) => ({
  [key]: result.rows,

  pagination: {
    totalItems:
      result.count,

    totalPages:
      Math.ceil(
        result.count /
          limit
      ),

    page,

    limit,

    hasNext:
      page * limit <
      result.count,

    hasPrevious:
      page > 1
  }
});


export const searchUsers =
  async (
    q = {}
  ) => {
    const {
      page,
      limit
    } = paging(
      q.page,
      q.limit
    );

    const where = {};

    if (q.role) {
      where.role =
        q.role;
    }

    if (q.status) {
      where.status =
        q.status;
    }

    if (
      q.verified ===
      "true"
    ) {
      where.emailVerifiedAt = {
        [Op.ne]: null
      };
    }

    if (
      q.verified ===
      "false"
    ) {
      where.emailVerifiedAt =
        null;
    }

    if (q.search) {
      where.email = {
        [Op.like]:
          `%${q.search}%`
      };
    }

    const result =
      await User.findAndCountAll({
        where,

        order: [
          [
            "createdAt",
            q.sort === "asc"
              ? "ASC"
              : "DESC"
          ]
        ],

        limit,

        offset:
          (page - 1) *
          limit
      });

    return resultPage(
      result,
      page,
      limit,
      "users"
    );
  };


export const moderateUser =
  async ({
    targetId,
    admin,
    status,
    reason,
    requestContext
  }) => {
    const user =
      await User.findByPk(
        targetId
      );

    if (!user) {
      throw new AppError(
        "User not found.",
        404,
        "USER_NOT_FOUND"
      );
    }

    if (
      user.id === admin.id &&
      status ===
        ACCOUNT_STATUS.SUSPENDED
    ) {
      throw new AppError(
        "An administrator cannot suspend their own account.",
        409,
        "ADMIN_SELF_SUSPENSION_BLOCKED"
      );
    }

    const previous =
      user.status;

    user.status =
      status;

    await user.save();

    const action =
      status ===
      ACCOUNT_STATUS.ACTIVE
        ? (
            previous ===
              ACCOUNT_STATUS.DISABLED ||
            previous ===
              ACCOUNT_STATUS.SUSPENDED
              ? AUDIT_ACTIONS.USER_RESTORED
              : AUDIT_ACTIONS.USER_ENABLED
          )
        : status ===
            ACCOUNT_STATUS.DISABLED
          ? AUDIT_ACTIONS.USER_DISABLED
          : AUDIT_ACTIONS.USER_SUSPENDED;

    await createAuditLogSafely({
      actor: admin,

      action,

      resourceType:
        AUDIT_RESOURCE_TYPES.USER,

      resourceId:
        user.id,

      metadata: {
        previousStatus:
          previous,

        newStatus:
          status
      },

      reason,

      requestContext
    });

    return user;
  };


export const listAdminJobs =
  async (
    q = {}
  ) => {
    const {
      page,
      limit
    } = paging(
      q.page,
      q.limit
    );

    const where = {};

    if (q.status) {
      where.status =
        q.status;
    }

    if (q.companyId) {
      where.companyId =
        q.companyId;
    }

    if (q.recruiterId) {
      where.createdBy =
        q.recruiterId;
    }

    if (q.location) {
      where.location = {
        [Op.like]:
          `%${q.location}%`
      };
    }

    if (q.search) {
      where.title = {
        [Op.like]:
          `%${q.search}%`
      };
    }

    const result =
      await Job.findAndCountAll({
        where,

        include: [
          {
            model:
              Company,

            as:
              "company",

            attributes: [
              "id",
              "companyName",
              "status"
            ]
          },

          {
            model:
              User,

            as:
              "creator",

            attributes: [
              "id",
              "email"
            ]
          }
        ],

        order: [
          [
            "created_at",
            q.sort === "asc"
              ? "ASC"
              : "DESC"
          ]
        ],

        limit,

        offset:
          (page - 1) *
          limit,

        distinct:
          true
      });

    return resultPage(
      result,
      page,
      limit,
      "jobs"
    );
  };


export const getAdminJob =
  async (
    id
  ) => {
    const job =
      await Job.findByPk(
        id,
        {
          include: [
            {
              model:
                Company,

              as:
                "company",

              attributes: [
                "id",
                "companyName",
                "status"
              ]
            },

            {
              model:
                User,

              as:
                "creator",

              attributes: [
                "id",
                "email"
              ]
            }
          ]
        }
      );

    if (!job) {
      throw new AppError(
        "Job not found.",
        404,
        "JOB_NOT_FOUND"
      );
    }

    return job;
  };


export const moderateJob =
  async ({
    id,
    admin,
    operation,
    reason,
    requestContext
  }) => {
    const job =
      await Job.findByPk(
        id
      );

    if (!job) {
      throw new AppError(
        "Job not found.",
        404,
        "JOB_NOT_FOUND"
      );
    }

    if (
      operation ===
      "remove"
    ) {
      if (
        ![
          JOB_STATUSES.PUBLISHED,
          JOB_STATUSES.CLOSED
        ].includes(
          job.status
        )
      ) {
        throw new AppError(
          "Only published or closed jobs can be removed.",
          409,
          "JOB_NOT_REMOVABLE"
        );
      }

      job.previousStatus =
        job.status;

      job.status =
        JOB_STATUSES.REMOVED;

      job.removedAt =
        new Date();

      job.removalReason =
        reason;

      job.removedBy =
        admin.id;
    } else {
      if (
        job.status !==
        JOB_STATUSES.REMOVED
      ) {
        throw new AppError(
          "Only removed jobs can be restored.",
          409,
          "JOB_NOT_RESTORABLE"
        );
      }

      job.status =
        job.previousStatus ||
        JOB_STATUSES.CLOSED;

      job.removedAt =
        null;

      job.removalReason =
        null;

      job.restoredBy =
        admin.id;

      job.restoredAt =
        new Date();
    }

    await job.save();

    await createAuditLogSafely({
      actor:
        admin,

      action:
        operation ===
        "remove"
          ? AUDIT_ACTIONS.JOB_REMOVED
          : AUDIT_ACTIONS.JOB_RESTORED,

      resourceType:
        AUDIT_RESOURCE_TYPES.JOB,

      resourceId:
        job.id,

      metadata: {
        status:
          job.status
      },

      reason,

      requestContext
    });

    return job;
  };


export const listAuditLogs =
  async (
    q = {}
  ) => {
    const {
      page,
      limit
    } = paging(
      q.page,
      q.limit
    );

    const where = {};

    for (
      const [
        key,
        value
      ] of Object.entries({
        actorUserId:
          q.actorId,

        actorRole:
          q.actorRole,

        action:
          q.action,

        resourceType:
          q.resourceType,

        resourceId:
          q.resourceId
      })
    ) {
      if (value) {
        where[key] =
          value;
      }
    }

    if (
      q.from ||
      q.to
    ) {
      where.createdAt = {
        ...(
          q.from && {
            [Op.gte]:
              new Date(
                q.from
              )
          }
        ),

        ...(
          q.to && {
            [Op.lte]:
              new Date(
                q.to
              )
          }
        )
      };
    }

    const result =
      await AuditLog.findAndCountAll({
        where,

        order: [
          [
            "createdAt",
            q.sort === "asc"
              ? "ASC"
              : "DESC"
          ]
        ],

        limit,

        offset:
          (page - 1) *
          limit
      });

    return resultPage(
      result,
      page,
      limit,
      "auditLogs"
    );
  };


export const getAuditLog =
  async (
    id
  ) => {
    const item =
      await AuditLog.findByPk(
        id
      );

    if (!item) {
      throw new AppError(
        "Audit log not found.",
        404,
        "AUDIT_LOG_NOT_FOUND"
      );
    }

    return item;
  };