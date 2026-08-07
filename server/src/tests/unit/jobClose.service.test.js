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

const createJobMock =
  jest.fn();

const findJobByIdMock =
  jest.fn();

const findJobBySlugMock =
  jest.fn();

const findRecruiterJobsMock =
  jest.fn();

const findRecruiterJobByIdMock =
  jest.fn();

const countRecruiterJobsMock =
  jest.fn();

const findJobsByCompanyMock =
  jest.fn();

const findAllActiveJobsMock =
  jest.fn();

const updateJobMock =
  jest.fn();

const publishJobMock =
  jest.fn();

const closeJobMock =
  jest.fn();

const deleteDraftJobMock =
  jest.fn();

const deleteJobMock =
  jest.fn();

const findCompanyByIdMock =
  jest.fn();

const validateCompanyOwnershipMock =
  jest.fn();

const validatePublicationEligibilityMock =
  jest.fn();

const validateStatusTransitionMock =
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
    createJob:
      createJobMock,

    findJobById:
      findJobByIdMock,

    findJobBySlug:
      findJobBySlugMock,

    findRecruiterJobs:
      findRecruiterJobsMock,

    findRecruiterJobById:
      findRecruiterJobByIdMock,

    countRecruiterJobs:
      countRecruiterJobsMock,

    findJobsByCompany:
      findJobsByCompanyMock,

    findAllActiveJobs:
      findAllActiveJobsMock,

    updateJob:
      updateJobMock,

    publishJob:
      publishJobMock,

    closeJob:
      closeJobMock,

    deleteDraftJob:
      deleteDraftJobMock,

    deleteJob:
      deleteJobMock
  })
);

jest.unstable_mockModule(
  "../../repositories/company.repository.js",
  () => ({
    findCompanyById:
      findCompanyByIdMock
  })
);

jest.unstable_mockModule(
  "../../utils/companyOwnership.js",
  () => ({
    default:
      validateCompanyOwnershipMock
  })
);

jest.unstable_mockModule(
  "../../utils/jobPublicationEligibility.js",
  () => ({
    validateJobPublicationEligibility:
      validatePublicationEligibilityMock
  })
);

jest.unstable_mockModule(
  "../../utils/jobStatusTransition.js",
  () => ({
    validateJobStatusTransition:
      validateStatusTransitionMock
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
  closePublishedJob
} = await import(
  "../../services/job.service.js"
);

describe(
  "Close job service",
  () => {
    const recruiterId =
      "11111111-1111-4111-8111-111111111111";

    const anotherRecruiterId =
      "44444444-4444-4444-8444-444444444444";

    const companyId =
      "22222222-2222-4222-8222-222222222222";

    const jobId =
      "33333333-3333-4333-8333-333333333333";

    const company = {
      id:
        companyId,

      ownerId:
        recruiterId,

      status:
        "VERIFIED"
    };

    const publishedJob = {
      id:
        jobId,

      companyId,

      createdBy:
        recruiterId,

      title:
        "Backend Developer",

      slug:
        "backend-developer",

      status:
        "PUBLISHED",

      publishedAt:
        new Date(
          "2026-08-01T10:00:00.000Z"
        ),

      closedAt:
        null,

      closureReason:
        null
    };

    const closedJob = {
      ...publishedJob,

      status:
        "CLOSED",

      closedAt:
        new Date(),

      closureReason:
        "RECRUITER_CLOSED"
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
          publishedJob
        );

      findCompanyByIdMock
        .mockResolvedValue(
          company
        );

      validateCompanyOwnershipMock
        .mockReturnValue(
          true
        );

      validateStatusTransitionMock
        .mockReturnValue(
          true
        );

      closeJobMock
        .mockResolvedValue(
          closedJob
        );

      logJobEventMock
        .mockResolvedValue(
          undefined
        );
    });

    test(
      "closes a published job using a transaction",
      async () => {
        const result =
          await closePublishedJob({
            recruiterId,
            jobId,

            closureReason:
              "POSITION_FILLED",

            auditContext: {
              ipAddress:
                "127.0.0.1",

              userAgent:
                "CareerForge Jest",

              requestId:
                "request-close-1"
            }
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
          validateStatusTransitionMock
        ).toHaveBeenCalledWith(
          "PUBLISHED",
          "CLOSED"
        );

        expect(
          findCompanyByIdMock
        ).toHaveBeenCalledWith(
          companyId,
          {
            transaction:
              transactionMock,

            lock:
              transactionMock
                .LOCK.UPDATE
          }
        );

        expect(
          validateCompanyOwnershipMock
        ).toHaveBeenCalledWith(
          company,
          recruiterId
        );

        expect(
          closeJobMock
        ).toHaveBeenCalledWith(
          jobId,
          {
            closedAt:
              expect.any(
                Date
              ),

            closureReason:
              "POSITION_FILLED"
          },
          {
            transaction:
              transactionMock,

            lock:
              transactionMock
                .LOCK.UPDATE
          }
        );

        expect(result).toBe(
          closedJob
        );
      }
    );

    test(
      "uses RECRUITER_CLOSED as the default closure reason",
      async () => {
        await closePublishedJob({
          recruiterId,
          jobId
        });

        expect(
          closeJobMock
        ).toHaveBeenCalledWith(
          jobId,
          expect.objectContaining({
            closureReason:
              "RECRUITER_CLOSED"
          }),
          expect.any(
            Object
          )
        );
      }
    );

    test(
      "sets the closed timestamp",
      async () => {
        const beforeClose =
          Date.now();

        await closePublishedJob({
          recruiterId,
          jobId
        });

        const closeData =
          closeJobMock
            .mock.calls[0][1];

        expect(
          closeData.closedAt
        ).toBeInstanceOf(
          Date
        );

        expect(
          closeData.closedAt
            .getTime()
        ).toBeGreaterThanOrEqual(
          beforeClose
        );
      }
    );

    test(
      "returns JOB_NOT_FOUND when the job does not exist",
      async () => {
        findJobByIdMock
          .mockResolvedValue(
            null
          );

        await expect(
          closePublishedJob({
            recruiterId,
            jobId
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              404,

            code:
              "JOB_NOT_FOUND"
          })
        );

        expect(
          validateStatusTransitionMock
        ).not.toHaveBeenCalled();

        expect(
          findCompanyByIdMock
        ).not.toHaveBeenCalled();

        expect(
          closeJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "rejects another recruiter with JOB_ACCESS_FORBIDDEN",
      async () => {
        await expect(
          closePublishedJob({
            recruiterId:
              anotherRecruiterId,

            jobId
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              403,

            code:
              "JOB_ACCESS_FORBIDDEN"
          })
        );

        expect(
          validateStatusTransitionMock
        ).not.toHaveBeenCalled();

        expect(
          findCompanyByIdMock
        ).not.toHaveBeenCalled();

        expect(
          closeJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "returns JOB_ALREADY_CLOSED for an already closed job",
      async () => {
        findJobByIdMock
          .mockResolvedValue({
            ...publishedJob,

            status:
              "CLOSED",

            closedAt:
              new Date()
          });

        await expect(
          closePublishedJob({
            recruiterId,
            jobId
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              409,

            code:
              "JOB_ALREADY_CLOSED"
          })
        );

        expect(
          validateStatusTransitionMock
        ).not.toHaveBeenCalled();

        expect(
          findCompanyByIdMock
        ).not.toHaveBeenCalled();

        expect(
          closeJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test.each([
      "DRAFT",
      "REMOVED"
    ])(
      "rejects closing a %s job with JOB_CLOSE_NOT_ALLOWED",
      async (
        status
      ) => {
        findJobByIdMock
          .mockResolvedValue({
            ...publishedJob,
            status
          });

        await expect(
          closePublishedJob({
            recruiterId,
            jobId
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              409,

            code:
              "JOB_CLOSE_NOT_ALLOWED",

            errors:
              expect.arrayContaining([
                expect.objectContaining({
                  currentStatus:
                    status,

                  requiredStatus:
                    "PUBLISHED"
                })
              ])
          })
        );

        expect(
          validateStatusTransitionMock
        ).not.toHaveBeenCalled();

        expect(
          findCompanyByIdMock
        ).not.toHaveBeenCalled();

        expect(
          closeJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "propagates INVALID_JOB_STATUS_TRANSITION",
      async () => {
        const transitionError =
          Object.assign(
            new Error(
              "Invalid transition"
            ),
            {
              statusCode:
                409,

              code:
                "INVALID_JOB_STATUS_TRANSITION"
            }
          );

        validateStatusTransitionMock
          .mockImplementation(
            () => {
              throw transitionError;
            }
          );

        await expect(
          closePublishedJob({
            recruiterId,
            jobId
          })
        ).rejects.toBe(
          transitionError
        );

        expect(
          validateStatusTransitionMock
        ).toHaveBeenCalledWith(
          "PUBLISHED",
          "CLOSED"
        );

        expect(
          findCompanyByIdMock
        ).not.toHaveBeenCalled();

        expect(
          closeJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "returns COMPANY_NOT_FOUND when the associated company does not exist",
      async () => {
        findCompanyByIdMock
          .mockResolvedValue(
            null
          );

        await expect(
          closePublishedJob({
            recruiterId,
            jobId
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              404,

            code:
              "COMPANY_NOT_FOUND"
          })
        );

        expect(
          validateCompanyOwnershipMock
        ).not.toHaveBeenCalled();

        expect(
          closeJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "propagates company ownership validation errors",
      async () => {
        const ownershipError =
          Object.assign(
            new Error(
              "Company access forbidden"
            ),
            {
              statusCode:
                403,

              code:
                "COMPANY_ACCESS_FORBIDDEN"
            }
          );

        validateCompanyOwnershipMock
          .mockImplementation(
            () => {
              throw ownershipError;
            }
          );

        await expect(
          closePublishedJob({
            recruiterId,
            jobId
          })
        ).rejects.toBe(
          ownershipError
        );

        expect(
          closeJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "returns JOB_NOT_FOUND when repository close returns null",
      async () => {
        closeJobMock
          .mockResolvedValue(
            null
          );

        await expect(
          closePublishedJob({
            recruiterId,
            jobId
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              404,

            code:
              "JOB_NOT_FOUND"
          })
        );
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
          closePublishedJob({
            recruiterId,
            jobId
          })
        ).rejects.toBe(
          repositoryError
        );
      }
    );

    test(
      "writes a success audit event after closing",
      async () => {
        await closePublishedJob({
          recruiterId,
          jobId,

          closureReason:
            "POSITION_FILLED",

          auditContext: {
            ipAddress:
              "127.0.0.1",

            userAgent:
              "CareerForge Test",

            requestId:
              "request-close-success"
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
              "JOB_CLOSED",

            status:
              "SUCCESS",

            previousStatus:
              "PUBLISHED",

            nextStatus:
              "CLOSED",

            ipAddress:
              "127.0.0.1",

            userAgent:
              "CareerForge Test",

            requestId:
              "request-close-success",

            metadata:
              expect.objectContaining({
                closedAt:
                  expect.any(
                    Date
                  ),

                closureReason:
                  "POSITION_FILLED"
              })
          })
        );
      }
    );

    test(
      "writes a failed audit event when closing fails",
      async () => {
        findJobByIdMock
          .mockResolvedValue({
            ...publishedJob,

            status:
              "DRAFT"
          });

        await expect(
          closePublishedJob({
            recruiterId,
            jobId,

            closureReason:
              "TEST_CLOSE",

            auditContext: {
              requestId:
                "request-close-failed"
            }
          })
        ).rejects.toEqual(
          expect.objectContaining({
            code:
              "JOB_CLOSE_NOT_ALLOWED"
          })
        );

        expect(
          logJobEventMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            recruiterId,
            jobId,
            companyId,

            event:
              "JOB_CLOSE_FAILED",

            status:
              "FAILED",

            previousStatus:
              "DRAFT",

            nextStatus:
              "CLOSED",

            requestId:
              "request-close-failed",

            metadata:
              expect.objectContaining({
                errorCode:
                  "JOB_CLOSE_NOT_ALLOWED",

                message:
                  "Only a published job can be closed.",

                closureReason:
                  "TEST_CLOSE"
              })
          })
        );
      }
    );

    test(
      "does not replace the original error when failed audit logging also fails",
      async () => {
        const originalError =
          Object.assign(
            new Error(
              "Closing failed"
            ),
            {
              statusCode:
                409,

              code:
                "INVALID_JOB_STATUS_TRANSITION"
            }
          );

        validateStatusTransitionMock
          .mockImplementation(
            () => {
              throw originalError;
            }
          );

        logJobEventMock
          .mockRejectedValue(
            new Error(
              "Audit failure"
            )
          );

        await expect(
          closePublishedJob({
            recruiterId,
            jobId
          })
        ).rejects.toBe(
          originalError
        );
      }
    );
  }
);