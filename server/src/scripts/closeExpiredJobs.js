import {
  connectDatabase,
  closeDatabase
} from "../config/database.js";

import {
  closeExpiredJobs
} from "../services/jobExpiry.service.js";

const resolveBatchSize = () => {
  const rawValue =
    process.env.JOB_EXPIRY_BATCH_SIZE;

  if (
    rawValue === undefined ||
    rawValue === null ||
    rawValue === ""
  ) {
    return undefined;
  }

  return Number(
    rawValue
  );
};

const run = async () => {
  const startedAt =
    new Date();

  try {
    await connectDatabase();

    const summary =
      await closeExpiredJobs({
        now:
          startedAt,

        limit:
          resolveBatchSize(),

        auditContext: {
          requestId:
            `job-expiry-${startedAt.getTime()}`,

          userAgent:
            "CareerForge Job Expiry Script",

          ipAddress:
            null
        }
      });

    console.log(
      "========== JOB EXPIRY SUMMARY =========="
    );

    console.log({
      startedAt:
        startedAt.toISOString(),

      completedAt:
        new Date().toISOString(),

      ...summary
    });

    console.log(
      "========================================"
    );

    if (
      summary.failed > 0
    ) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(
      "Job expiry runner failed:",
      {
        code:
          error.code ??
          "JOB_EXPIRY_RUNNER_FAILED",

        message:
          error.message,

        stack:
          error.stack
      }
    );

    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
};

await run();