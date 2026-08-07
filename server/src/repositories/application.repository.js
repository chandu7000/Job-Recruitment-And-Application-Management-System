import { Op } from "sequelize";

import Application from "../models/application.model.js";
import ApplicationStatusHistory from "../models/applicationStatusHistory.model.js";

export const findApplication = (
  id,
  options = {}
) =>
  Application.findByPk(
    id,
    options
  );

export const findCandidateJobApplication = (
  candidateId,
  jobId,
  options = {}
) =>
  Application.findOne({
    where: {
      candidateId,
      jobId
    },
    ...options
  });

export const createApplication = (
  values,
  options = {}
) =>
  Application.create(
    values,
    options
  );

export const createStatusHistory = (
  values,
  options = {}
) =>
  ApplicationStatusHistory.create(
    values,
    options
  );

export const getStatusHistory = (
  applicationId
) =>
  ApplicationStatusHistory.findAll({
    where: {
      applicationId
    },
    order: [
      ["createdAt", "ASC"],
      ["id", "ASC"]
    ]
  });

const whereFrom = (filters) => {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.companyId) {
    where.companyId = filters.companyId;
  }

  if (
    filters.from ||
    filters.to
  ) {
    where.createdAt = {
      ...(filters.from && {
        [Op.gte]: new Date(
          filters.from
        )
      }),

      ...(filters.to && {
        [Op.lte]: new Date(
          filters.to
        )
      })
    };
  }

  if (filters.search) {
    where[Op.or] = [
      {
        "jobSnapshot.title": {
          [Op.like]:
            `%${filters.search}%`
        }
      },
      {
        "companySnapshot.name": {
          [Op.like]:
            `%${filters.search}%`
        }
      }
    ];
  }

  return where;
};

export const listCandidateApplications = (
  candidateId,
  options
) =>
  Application.findAndCountAll({
    where: {
      candidateId,
      ...whereFrom(options)
    },

    limit: options.limit,
    offset: options.offset,

    order: [
      [
        options.sort ||
          "createdAt",
        options.order ||
          "DESC"
      ]
    ]
  });

export const listRecruiterApplications = (
  jobIds,
  options
) =>
  Application.findAndCountAll({
    where: {
      jobId: {
        [Op.in]: jobIds
      },
      ...whereFrom(options)
    },

    limit: options.limit,
    offset: options.offset,

    order: [
      [
        options.sort ||
          "createdAt",
        options.order ||
          "DESC"
      ]
    ]
  });