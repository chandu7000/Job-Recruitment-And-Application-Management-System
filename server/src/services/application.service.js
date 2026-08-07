import { UniqueConstraintError } from "sequelize";

import { sequelize } from "../config/database.js";
import AppError from "../utils/AppError.js";

import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import Company from "../models/company.model.js";
import JobSeekerProfile from "../models/jobSeekerProfile.model.js";

import {
  APPLICATION_STATUSES
} from "../constants/application.constants.js";

import {
  validatePublicJobEligibility
} from "../utils/publicJobEligibility.js";

import {
  assertApplicantEligibility
} from "../utils/applicantEligibility.js";

import {
  assertApplicationTransition
} from "../utils/applicationStatusTransition.js";

import {
  getPagination,
  getPaginationMeta
} from "../utils/pagination.js";

import * as repo from "../repositories/application.repository.js";

import {
  emitApplicationNotification
} from "./applicationNotification.service.js";

const snapshots = (
  user,
  profile,
  job
) => ({
  resumeSnapshot: {
    url: profile.resumeUrl,
    publicId: profile.resumePublicId,
    originalName: profile.resumeOriginalName,
    capturedAt: new Date()
  },

  candidateSnapshot: {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: user.email,
    phoneNumber: profile.phoneNumber,
    location: profile.location,
    headline: profile.headline
  },

  jobSnapshot: {
    id: job.id,
    title: job.title,
    slug: job.slug,
    location: job.location,
    workMode: job.workMode,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel
  },

  companySnapshot: {
    id: job.company.id,
    name: job.company.name,
    slug: job.company.slug,
    logoUrl: job.company.logoUrl
  },

  salarySnapshot: {
    minimum: job.minimumSalary,
    maximum: job.maximumSalary,
    currency: job.salaryCurrency,
    period: job.salaryPeriod
  }
});

export const applyToJob = async ({
  candidateId,
  jobId,
  coverLetter
}) =>
  sequelize.transaction(async transaction => {
    const user = await User.findByPk(
      candidateId,
      {
        transaction
      }
    );

    const profile =
      await JobSeekerProfile.findOne({
        where: {
          userId: candidateId
        },
        transaction
      });

    assertApplicantEligibility({
      user,
      profile
    });

    const job = await Job.findByPk(
      jobId,
      {
        include: [
          {
            model: Company,
            as: "company",
            required: true
          }
        ],
        transaction,
        lock: transaction.LOCK.UPDATE
      }
    );

    if (!job) {
      throw new AppError(
        "Job not found.",
        404,
        "JOB_NOT_FOUND"
      );
    }

    validatePublicJobEligibility(
      job,
      job.company
    );

    const existingApplication =
      await repo.findCandidateJobApplication(
        candidateId,
        jobId,
        {
          transaction
        }
      );

    if (existingApplication) {
      throw new AppError(
        "You have already applied to this job.",
        409,
        "APPLICATION_ALREADY_EXISTS"
      );
    }

    try {
      const application =
        await repo.createApplication(
          {
            candidateId,
            jobId,
            companyId: job.companyId,
            coverLetter:
              coverLetter?.trim() || null,
            ...snapshots(
              user,
              profile,
              job
            )
          },
          {
            transaction
          }
        );

      await repo.createStatusHistory(
        {
          applicationId: application.id,
          previousStatus: null,
          newStatus:
            APPLICATION_STATUSES.APPLIED,
          changedBy: candidateId,
          reason:
            "Application submitted."
        },
        {
          transaction
        }
      );

      await Job.increment(
        "applicationCount",
        {
          by: 1,
          where: {
            id: jobId
          },
          transaction
        }
      ).catch(() => null);

      return application;
    } catch (error) {
      if (
        error instanceof
        UniqueConstraintError
      ) {
        throw new AppError(
          "You have already applied to this job.",
          409,
          "APPLICATION_ALREADY_EXISTS"
        );
      }

      throw error;
    }
  });

export const getMyApplications = async ({
  candidateId,
  query
}) => {
  const pagination =
    getPagination(query);

  const result =
    await repo.listCandidateApplications(
      candidateId,
      {
        ...query,
        ...pagination,
        order: (
          query.order || "DESC"
        ).toUpperCase()
      }
    );

  return {
    items: result.rows,
    meta: getPaginationMeta(
      pagination.page,
      pagination.limit,
      result.count
    )
  };
};

export const getMyApplication = async ({
  candidateId,
  applicationId
}) => {
  const application =
    await repo.findApplication(
      applicationId
    );

  if (
    !application ||
    application.candidateId !==
      candidateId
  ) {
    throw new AppError(
      "Application not found.",
      404,
      "APPLICATION_NOT_FOUND"
    );
  }

  return {
    ...application.toJSON(),
    statusHistory:
      await repo.getStatusHistory(
        application.id
      )
  };
};

export const withdrawMyApplication = async ({
  candidateId,
  applicationId,
  reason
}) =>
  sequelize.transaction(async transaction => {
    const application =
      await repo.findApplication(
        applicationId,
        {
          transaction,
          lock:
            transaction.LOCK.UPDATE
        }
      );

    if (
      !application ||
      application.candidateId !==
        candidateId
    ) {
      throw new AppError(
        "Application not found.",
        404,
        "APPLICATION_NOT_FOUND"
      );
    }

    assertApplicationTransition(
      application.status,
      APPLICATION_STATUSES.WITHDRAWN
    );

    const previousStatus =
      application.status;

    await application.update(
      {
        status:
          APPLICATION_STATUSES.WITHDRAWN,
        withdrawalReason:
          reason?.trim() || null,
        withdrawnAt: new Date()
      },
      {
        transaction
      }
    );

    await repo.createStatusHistory(
      {
        applicationId: application.id,
        previousStatus,
        newStatus:
          application.status,
        changedBy: candidateId,
        reason:
          reason ||
          "Withdrawn by candidate."
      },
      {
        transaction
      }
    );

    emitApplicationNotification({
      type:
        "APPLICATION_WITHDRAWN",
      applicationId:
        application.id
    }).catch(() => {});

    return application;
  });