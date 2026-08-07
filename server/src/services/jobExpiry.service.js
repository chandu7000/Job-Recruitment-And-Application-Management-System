import {
  sequelize
} from "../config/database.js";

import {
  JOB_STATUSES,
  JOB_EVENTS,
  JOB_CLOSURE_REASONS
} from "../constants/job.constants.js";

import {
  findExpiredPublishedJobs,
  findJobById,
  closeJob
} from "../repositories/job.repository.js";

import {
  logJobEvent
} from "./jobAudit.service.js";

const DEFAULT_EXPIRY_BATCH_SIZE =
  100;

const getJobValue = (
  job,
  field
) => {
  if (
    job &&
    typeof job.get ===
      "function"
  ) {
    return job.get(
      field
    );
  }

  return job?.[field];
};

const normalizeBatchSize = (
  value
) => {
  const numericValue =
    Number(
      value
    );

  if (
    !Number.isInteger(
      numericValue
    ) ||
    numericValue < 1
  ) {
    return DEFAULT_EXPIRY_BATCH_SIZE;
  }

  return Math.min(
    numericValue,
    1000
  );
};

const writeExpiryAuditSafely =
  async ({
    job,
    event,
    status,
    error = null,
    auditContext = {}
  }) => {
    try {
      await logJobEvent({
        recruiterId:
          getJobValue(
            job,
            "createdBy"
          ) ?? null,

        jobId:
          getJobValue(
            job,
            "id"
          ) ?? null,

        companyId:
          getJobValue(
            job,
            "companyId"
          ) ?? null,

        event,
        status,

        previousStatus:
          getJobValue(
            job,
            "status"
          ) ?? null,

        nextStatus:
          status === "SUCCESS"
            ? JOB_STATUSES.CLOSED
            : null,

        ipAddress:
          auditContext.ipAddress ??
          null,

        userAgent:
          auditContext.userAgent ??
          null,

        requestId:
          auditContext.requestId ??
          null,

        metadata: {
          closureReason:
            JOB_CLOSURE_REASONS
              .DEADLINE_EXPIRED,

          applicationDeadline:
            getJobValue(
              job,
              "applicationDeadline"
            ) ?? null,

          errorCode:
            error?.code ??
            null,

          errorMessage:
            error?.message ??
            null
        }
      });
    } catch (
      auditError
    ) {
      console.error(
        "Failed to write job expiry audit event:",
        auditError.message
      );
    }
  };

const closeSingleExpiredJob =
  async ({
    jobId,
    now = new Date(),
    auditContext = {}
  }) => {
    let jobForAudit = {
      id:
        jobId,

      createdBy:
        null,

      companyId:
        null,

      status:
        null,

      applicationDeadline:
        null
    };

    try {
      const closedJob =
        await sequelize.transaction(
          async (
            transaction
          ) => {
            const job =
              await findJobById(
                jobId,
                {
                  transaction,

                  lock:
                    transaction
                      .LOCK.UPDATE
                }
              );

            if (!job) {
              return null;
            }

            jobForAudit =
              job;

            const currentStatus =
              getJobValue(
                job,
                "status"
              );

            const applicationDeadline =
              getJobValue(
                job,
                "applicationDeadline"
              );

            if (
              currentStatus !==
              JOB_STATUSES.PUBLISHED
            ) {
              return null;
            }

            if (
              applicationDeadline ===
                null ||
              applicationDeadline ===
                undefined
            ) {
              return null;
            }

            const parsedDeadline =
              applicationDeadline
                instanceof Date
                ? applicationDeadline
                : new Date(
                  applicationDeadline
                );

            if (
              Number.isNaN(
                parsedDeadline
                  .getTime()
              )
            ) {
              return null;
            }

            if (
              parsedDeadline.getTime() >=
              now.getTime()
            ) {
              return null;
            }

            return closeJob(
              jobId,
              {
                closedAt:
                  now,

                closureReason:
                  JOB_CLOSURE_REASONS
                    .DEADLINE_EXPIRED
              },
              {
                transaction,

                lock:
                  transaction
                    .LOCK.UPDATE
              }
            );
          }
        );

      if (!closedJob) {
        return {
          closed:
            false,

          job:
            null
        };
      }

      await writeExpiryAuditSafely({
        job:
          jobForAudit,

        event:
          JOB_EVENTS.JOB_EXPIRED,

        status:
          "SUCCESS",

        auditContext
      });

      return {
        closed:
          true,

        job:
          closedJob
      };
    } catch (error) {
      await writeExpiryAuditSafely({
        job:
          jobForAudit,

        event:
          JOB_EVENTS
            .JOB_EXPIRY_FAILED,

        status:
          "FAILED",

        error,
        auditContext
      });

      throw error;
    }
  };

const closeExpiredJobs =
  async ({
    now = new Date(),
    limit =
      DEFAULT_EXPIRY_BATCH_SIZE,
    auditContext = {}
  } = {}) => {
    const batchSize =
      normalizeBatchSize(
        limit
      );

    const expiredJobs =
      await findExpiredPublishedJobs({
        now,
        limit:
          batchSize
      });

    const summary = {
      scanned:
        expiredJobs.length,

      closed:
        0,

      skipped:
        0,

      failed:
        0,

      closedJobIds:
        [],

      failedJobs:
        []
    };

    for (
      const expiredJob of
      expiredJobs
    ) {
      const jobId =
        getJobValue(
          expiredJob,
          "id"
        );

      try {
        const result =
          await closeSingleExpiredJob({
            jobId,
            now,
            auditContext
          });

        if (
          result.closed
        ) {
          summary.closed += 1;

          summary.closedJobIds.push(
            jobId
          );
        } else {
          summary.skipped += 1;
        }
      } catch (error) {
        summary.failed += 1;

        summary.failedJobs.push({
          jobId,

          code:
            error.code ??
            "JOB_EXPIRY_FAILED",

          message:
            error.message
        });
      }
    }

    return summary;
  };

export {
  DEFAULT_EXPIRY_BATCH_SIZE,
  getJobValue,
  normalizeBatchSize,
  closeSingleExpiredJob,
  closeExpiredJobs
};