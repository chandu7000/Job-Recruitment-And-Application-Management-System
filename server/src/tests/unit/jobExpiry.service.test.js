import {
  jest
} from "@jest/globals";

const transactionMock = {
  LOCK: {
    UPDATE:
      "UPDATE"
  }
};

const sequelizeTransactionMock =
  jest.fn();

const findExpiredPublishedJobsMock =
  jest.fn();

const findJobByIdMock =
  jest.fn();

const closeJobMock =
  jest.fn();

const logJobEventMock =
  jest.fn();

jest.unstable_mockModule(
  "../../config/database.js",
  () => ({
    sequelize: {
      transaction:
        sequelizeTransactionMock
    },

    connectDatabase:
      jest.fn(),

    closeDatabase:
      jest.fn()
  })
);

jest.unstable_mockModule(
  "../../repositories/job.repository.js",
  () => ({
    findExpiredPublishedJobs:
      findExpiredPublishedJobsMock,

    findJobById:
      findJobByIdMock,

    closeJob:
      closeJobMock
  })
);

jest.unstable_mockModule(
  "../../services/jobAudit.service.js",
  () => ({
    logJobEvent:
      logJobEventMock
  })
);

const {
  DEFAULT_EXPIRY_BATCH_SIZE,
  normalizeBatchSize,
  closeSingleExpiredJob,
  closeExpiredJobs
} = await import(
  "../../services/jobExpiry.service.js"
);

describe(
  "Job expiry service",
  () => {
    const now =
      new Date(
        "2026-08-03T10:00:00.000Z"
      );

    const expiredDeadline =
      new Date(
        "2026-08-02T10:00:00.000Z"
      );

    const futureDeadline =
      new Date(
        "2026-08-04T10:00:00.000Z"
      );

    const recruiterId =
      "11111111-1111-4111-8111-111111111111";

    const companyId =
      "22222222-2222-4222-8222-222222222222";

    const jobId =
      "33333333-3333-4333-8333-333333333333";

    const expiredPublishedJob = {
      id:
        jobId,

      createdBy:
        recruiterId,

      companyId,

      status:
        "PUBLISHED",

      applicationDeadline:
        expiredDeadline
    };

    const closedJob = {
      ...expiredPublishedJob,

      status:
        "CLOSED",

      closedAt:
        now,

      closureReason:
        "DEADLINE_EXPIRED"
    };

    beforeEach(() => {
      jest.clearAllMocks();

      sequelizeTransactionMock
        .mockImplementation(
          async (
            callback
          ) => callback(
            transactionMock
          )
        );

      findJobByIdMock
        .mockResolvedValue(
          expiredPublishedJob
        );

      closeJobMock
        .mockResolvedValue(
          closedJob
        );

      findExpiredPublishedJobsMock
        .mockResolvedValue(
          []
        );

      logJobEventMock
        .mockResolvedValue(
          undefined
        );
    });

    test(
      "closes an expired published job using a transaction",
      async () => {
        const result =
          await closeSingleExpiredJob({
            jobId,
            now
          });

        expect(
          sequelizeTransactionMock
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          findJobByIdMock
        ).toHaveBeenCalledWith(
          jobId,
          {
            transaction:
              transactionMock,

            lock:
              transactionMock
                .LOCK.UPDATE
          }
        );

        expect(
          closeJobMock
        ).toHaveBeenCalledWith(
          jobId,
          {
            closedAt:
              now,

            closureReason:
              "DEADLINE_EXPIRED"
          },
          {
            transaction:
              transactionMock,

            lock:
              transactionMock
                .LOCK.UPDATE
          }
        );

        expect(result).toEqual({
          closed:
            true,

          job:
            closedJob
        });
      }
    );

    test(
      "sets DEADLINE_EXPIRED as the closure reason",
      async () => {
        await closeSingleExpiredJob({
          jobId,
          now
        });

        expect(
          closeJobMock
        ).toHaveBeenCalledWith(
          jobId,
          expect.objectContaining({
            closureReason:
              "DEADLINE_EXPIRED"
          }),
          expect.any(
            Object
          )
        );
      }
    );

    test(
      "skips a future-deadline job",
      async () => {
        findJobByIdMock
          .mockResolvedValue({
            ...expiredPublishedJob,

            applicationDeadline:
              futureDeadline
          });

        const result =
          await closeSingleExpiredJob({
            jobId,
            now
          });

        expect(result).toEqual({
          closed:
            false,

          job:
            null
        });

        expect(
          closeJobMock
        ).not.toHaveBeenCalled();

        expect(
          logJobEventMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "skips a non-published job",
      async () => {
        findJobByIdMock
          .mockResolvedValue({
            ...expiredPublishedJob,

            status:
              "CLOSED"
          });

        const result =
          await closeSingleExpiredJob({
            jobId,
            now
          });

        expect(result).toEqual({
          closed:
            false,

          job:
            null
        });

        expect(
          closeJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "skips a job without an application deadline",
      async () => {
        findJobByIdMock
          .mockResolvedValue({
            ...expiredPublishedJob,

            applicationDeadline:
              null
          });

        const result =
          await closeSingleExpiredJob({
            jobId,
            now
          });

        expect(result).toEqual({
          closed:
            false,

          job:
            null
        });

        expect(
          closeJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "skips a job with an invalid application deadline",
      async () => {
        findJobByIdMock
          .mockResolvedValue({
            ...expiredPublishedJob,

            applicationDeadline:
              "not-a-date"
          });

        const result =
          await closeSingleExpiredJob({
            jobId,
            now
          });

        expect(result).toEqual({
          closed:
            false,

          job:
            null
        });

        expect(
          closeJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "returns closed false when the job does not exist",
      async () => {
        findJobByIdMock
          .mockResolvedValue(
            null
          );

        const result =
          await closeSingleExpiredJob({
            jobId,
            now
          });

        expect(result).toEqual({
          closed:
            false,

          job:
            null
        });

        expect(
          closeJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "returns closed false when repository close returns null",
      async () => {
        closeJobMock
          .mockResolvedValue(
            null
          );

        const result =
          await closeSingleExpiredJob({
            jobId,
            now
          });

        expect(result).toEqual({
          closed:
            false,

          job:
            null
        });

        expect(
          logJobEventMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "propagates repository errors",
      async () => {
        const repositoryError =
          new Error(
            "Database close failure"
          );

        closeJobMock
          .mockRejectedValue(
            repositoryError
          );

        await expect(
          closeSingleExpiredJob({
            jobId,
            now
          })
        ).rejects.toBe(
          repositoryError
        );
      }
    );

    test(
      "writes a success audit event after expiry",
      async () => {
        await closeSingleExpiredJob({
          jobId,
          now,

          auditContext: {
            ipAddress:
              "127.0.0.1",

            userAgent:
              "CareerForge Expiry Test",

            requestId:
              "expiry-success-request"
          }
        });

        expect(
          logJobEventMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            recruiterId,
            jobId,
            companyId,

            event:
              "JOB_EXPIRED",

            status:
              "SUCCESS",

            previousStatus:
              "PUBLISHED",

            nextStatus:
              "CLOSED",

            ipAddress:
              "127.0.0.1",

            userAgent:
              "CareerForge Expiry Test",

            requestId:
              "expiry-success-request",

            metadata:
              expect.objectContaining({
                closureReason:
                  "DEADLINE_EXPIRED",

                applicationDeadline:
                  expiredDeadline,

                errorCode:
                  null,

                errorMessage:
                  null
              })
          })
        );
      }
    );

    test(
      "writes a failed audit event when expiry fails",
      async () => {
        const repositoryError =
          Object.assign(
            new Error(
              "Database close failure"
            ),
            {
              code:
                "JOB_EXPIRY_DATABASE_ERROR"
            }
          );

        closeJobMock
          .mockRejectedValue(
            repositoryError
          );

        await expect(
          closeSingleExpiredJob({
            jobId,
            now,

            auditContext: {
              requestId:
                "expiry-failed-request"
            }
          })
        ).rejects.toBe(
          repositoryError
        );

        expect(
          logJobEventMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            recruiterId,
            jobId,
            companyId,

            event:
              "JOB_EXPIRY_FAILED",

            status:
              "FAILED",

            previousStatus:
              "PUBLISHED",

            nextStatus:
              null,

            requestId:
              "expiry-failed-request",

            metadata:
              expect.objectContaining({
                closureReason:
                  "DEADLINE_EXPIRED",

                errorCode:
                  "JOB_EXPIRY_DATABASE_ERROR",

                errorMessage:
                  "Database close failure"
              })
          })
        );
      }
    );

    test(
      "does not replace the original error when audit logging also fails",
      async () => {
        const originalError =
          new Error(
            "Original database failure"
          );

        closeJobMock
          .mockRejectedValue(
            originalError
          );

        logJobEventMock
          .mockRejectedValue(
            new Error(
              "Audit failure"
            )
          );

        await expect(
          closeSingleExpiredJob({
            jobId,
            now
          })
        ).rejects.toBe(
          originalError
        );
      }
    );

    test(
      "processes a batch and returns correct summary counts",
      async () => {
        const jobOne = {
          ...expiredPublishedJob,

          id:
            "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
        };

        const jobTwo = {
          ...expiredPublishedJob,

          id:
            "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
        };

        const jobThree = {
          ...expiredPublishedJob,

          id:
            "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
        };

        findExpiredPublishedJobsMock
          .mockResolvedValue([
            jobOne,
            jobTwo,
            jobThree
          ]);

        findJobByIdMock
          .mockImplementation(
            async (
              currentJobId
            ) => {
              if (
                currentJobId ===
                jobOne.id
              ) {
                return jobOne;
              }

              if (
                currentJobId ===
                jobTwo.id
              ) {
                return {
                  ...jobTwo,

                  status:
                    "CLOSED"
                };
              }

              return jobThree;
            }
          );

        closeJobMock
          .mockImplementation(
            async (
              currentJobId
            ) => {
              if (
                currentJobId ===
                jobThree.id
              ) {
                throw Object.assign(
                  new Error(
                    "Close failed"
                  ),
                  {
                    code:
                      "JOB_CLOSE_FAILED"
                  }
                );
              }

              return {
                ...jobOne,

                id:
                  currentJobId,

                status:
                  "CLOSED",

                closedAt:
                  now,

                closureReason:
                  "DEADLINE_EXPIRED"
              };
            }
          );

        const result =
          await closeExpiredJobs({
            now,
            limit:
              25
          });

        expect(
          findExpiredPublishedJobsMock
        ).toHaveBeenCalledWith({
          now,
          limit:
            25
        });

        expect(result).toEqual({
          scanned:
            3,

          closed:
            1,

          skipped:
            1,

          failed:
            1,

          closedJobIds: [
            jobOne.id
          ],

          failedJobs: [
            {
              jobId:
                jobThree.id,

              code:
                "JOB_CLOSE_FAILED",

              message:
                "Close failed"
            }
          ]
        });
      }
    );

    test.each([
      undefined,
      null,
      0,
      -1,
      1.5,
      "invalid"
    ])(
      "normalizes invalid batch size %s to the default",
      (
        value
      ) => {
        expect(
          normalizeBatchSize(
            value
          )
        ).toBe(
          DEFAULT_EXPIRY_BATCH_SIZE
        );
      }
    );

    test(
      "caps a very large batch size at 1000",
      () => {
        expect(
          normalizeBatchSize(
            5000
          )
        ).toBe(
          1000
        );
      }
    );
  }
);
