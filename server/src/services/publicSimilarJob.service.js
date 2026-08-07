import AppError from
  "../utils/AppError.js";

import {
  sanitizePublicJobList
} from "../utils/publicResponseSanitizer.js";

import {
  validatePublicJobEligibility
} from "../utils/publicJobEligibility.js";

import {
  findPublicJobCandidateById,
  findSimilarPublicJobs
} from "../repositories/publicJob.repository.js";

const PUBLIC_SIMILAR_JOB_DEFAULT_LIMIT =
  5;

const PUBLIC_SIMILAR_JOB_MAX_LIMIT =
  10;

const normalizeSimilarJobLimit =
  (
    limit
  ) => {
    if (
      limit === null ||
      limit === undefined ||
      limit === ""
    ) {
      return (
        PUBLIC_SIMILAR_JOB_DEFAULT_LIMIT
      );
    }

    const parsedLimit =
      Number.parseInt(
        limit,
        10
      );

    if (
      !Number.isInteger(
        parsedLimit
      )
    ) {
      return (
        PUBLIC_SIMILAR_JOB_DEFAULT_LIMIT
      );
    }

    return Math.min(
      Math.max(
        parsedLimit,
        1
      ),
      PUBLIC_SIMILAR_JOB_MAX_LIMIT
    );
  };

const getSimilarPublicJobs =
  async ({
    jobId,
    limit =
      PUBLIC_SIMILAR_JOB_DEFAULT_LIMIT,
    now = new Date()
  }) => {
    let currentJob;

    try {
      currentJob =
        await findPublicJobCandidateById(
          jobId
        );
    } catch (error) {
      if (
        error instanceof AppError
      ) {
        throw error;
      }

      throw new AppError(
        "Unable to fetch similar jobs.",
        500,
        "SIMILAR_JOBS_FETCH_FAILED"
      );
    }

    validatePublicJobEligibility(
      currentJob,
      currentJob?.company ??
        null,
      {
        now
      }
    );

    const normalizedLimit =
      normalizeSimilarJobLimit(
        limit
      );

    let similarJobs;

    try {
      similarJobs =
        await findSimilarPublicJobs({
          currentJob,
          now,
          limit:
            normalizedLimit
        });
    } catch (error) {
      if (
        error instanceof AppError
      ) {
        throw error;
      }

      throw new AppError(
        "Unable to fetch similar jobs.",
        500,
        "SIMILAR_JOBS_FETCH_FAILED"
      );
    }

    return {
      jobs:
        sanitizePublicJobList(
          similarJobs
        ),

      meta: {
        limit:
          normalizedLimit,

        count:
          Array.isArray(
            similarJobs
          )
            ? similarJobs.length
            : 0,

        sourceJobId:
          currentJob.id
      }
    };
  };

export {
  PUBLIC_SIMILAR_JOB_DEFAULT_LIMIT,
  PUBLIC_SIMILAR_JOB_MAX_LIMIT,
  normalizeSimilarJobLimit,
  getSimilarPublicJobs
};