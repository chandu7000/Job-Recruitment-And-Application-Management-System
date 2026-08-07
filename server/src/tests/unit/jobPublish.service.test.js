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
  publishEligibleJob
} = await import(
  "../../services/job.service.js"
);

describe(
  "Publish job service",
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

    const completeDraftJob = {
      id:
        jobId,

      companyId,

      createdBy:
        recruiterId,

      title:
        "Backend Developer",

      slug:
        "backend-developer",

      description:
        "Build and maintain backend services.",

      requirements:
        "Strong backend development knowledge.",

      location:
        "Hyderabad",

      workMode:
        "HYBRID",

      employmentType:
        "FULL_TIME",

      experienceLevel:
        "JUNIOR",

      minimumExperience:
        1,

      maximumExperience:
        3,

      minimumSalary:
        400000,

      maximumSalary:
        800000,

      vacancies:
        2,

      applicationDeadline:
        new Date(
          Date.now() +
          30 * 24 * 60 * 60 * 1000
        ),

      status:
        "DRAFT",

      publishedAt:
        null,

      closedAt:
        null,

      removedAt:
        null,

      removalReason:
        null,

      closureReason:
        null
    };

    const publishedJob = {
      ...completeDraftJob,

      status:
        "PUBLISHED",

      publishedAt:
        new Date()
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
          completeDraftJob
        );

      findCompanyByIdMock
        .mockResolvedValue(
          company
        );

      findJobBySlugMock
        .mockResolvedValue(
          null
        );

      publishJobMock
        .mockResolvedValue(
          publishedJob
        );

      validateCompanyOwnershipMock
        .mockReturnValue(
          true
        );

      validateStatusTransitionMock
        .mockReturnValue(
          true
        );

      validatePublicationEligibilityMock
        .mockReturnValue(
          true
        );

      logJobEventMock
        .mockResolvedValue(
          undefined
        );
    });

    test(
      "publishes an eligible draft using a transaction",
      async () => {
        const result =
          await publishEligibleJob({
            recruiterId,
            jobId,

            auditContext: {
              ipAddress:
                "127.0.0.1",

              userAgent:
                "Jest",

              requestId:
                "request-123"
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
          "DRAFT",
          "PUBLISHED"
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
          validatePublicationEligibilityMock
        ).toHaveBeenCalledWith(
          completeDraftJob,
          company,
          {
            now:
              expect.any(
                Date
              )
          }
        );

        expect(
          publishJobMock
        ).toHaveBeenCalledWith(
          jobId,
          {
            publishedAt:
              expect.any(
                Date
              ),

            slug:
              "backend-developer"
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
          publishedJob
        );
      }
    );

    test(
      "preserves an existing job slug",
      async () => {
        await publishEligibleJob({
          recruiterId,
          jobId
        });

        expect(
          findJobBySlugMock
        ).not.toHaveBeenCalled();

        expect(
          publishJobMock
        ).toHaveBeenCalledWith(
          jobId,
          expect.objectContaining({
            slug:
              "backend-developer"
          }),
          expect.any(
            Object
          )
        );
      }
    );

    test(
      "generates a slug when the draft has no slug",
      async () => {
        findJobByIdMock
          .mockResolvedValue({
            ...completeDraftJob,

            slug:
              null
          });

        await publishEligibleJob({
          recruiterId,
          jobId
        });

        expect(
          findJobBySlugMock
        ).toHaveBeenCalledWith(
          "backend-developer",
          {
            transaction:
              transactionMock,

            lock:
              transactionMock
                .LOCK.UPDATE
          }
        );

        expect(
          publishJobMock
        ).toHaveBeenCalledWith(
          jobId,
          expect.objectContaining({
            slug:
              "backend-developer"
          }),
          expect.any(
            Object
          )
        );
      }
    );

    test(
      "generates a unique slug when the base slug already exists",
      async () => {
        findJobByIdMock
          .mockResolvedValue({
            ...completeDraftJob,

            slug:
              null
          });

        findJobBySlugMock
          .mockResolvedValueOnce({
            id:
              "55555555-5555-4555-8555-555555555555",

            slug:
              "backend-developer"
          })
          .mockResolvedValueOnce(
            null
          );

        await publishEligibleJob({
          recruiterId,
          jobId
        });

        expect(
          findJobBySlugMock
        ).toHaveBeenNthCalledWith(
          1,
          "backend-developer",
          {
            transaction:
              transactionMock,

            lock:
              transactionMock
                .LOCK.UPDATE
          }
        );

        expect(
          findJobBySlugMock
        ).toHaveBeenNthCalledWith(
          2,
          "backend-developer-2",
          {
            transaction:
              transactionMock,

            lock:
              transactionMock
                .LOCK.UPDATE
          }
        );

        expect(
          publishJobMock
        ).toHaveBeenCalledWith(
          jobId,
          expect.objectContaining({
            slug:
              "backend-developer-2"
          }),
          expect.any(
            Object
          )
        );
      }
    );

    test(
      "sets the publication timestamp",
      async () => {
        const beforePublication =
          Date.now();

        await publishEligibleJob({
          recruiterId,
          jobId
        });

        const publicationCall =
          publishJobMock
            .mock.calls[0][1];

        expect(
          publicationCall
            .publishedAt
        ).toBeInstanceOf(
          Date
        );

        expect(
          publicationCall
            .publishedAt
            .getTime()
        ).toBeGreaterThanOrEqual(
          beforePublication
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
          publishEligibleJob({
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
          findCompanyByIdMock
        ).not.toHaveBeenCalled();

        expect(
          publishJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "rejects another recruiter with JOB_ACCESS_FORBIDDEN",
      async () => {
        await expect(
          publishEligibleJob({
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
          publishJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test.each([
      "PUBLISHED",
      "CLOSED",
      "REMOVED"
    ])(
      "rejects publication from %s status",
      async (
        status
      ) => {
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

        findJobByIdMock
          .mockResolvedValue({
            ...completeDraftJob,
            status
          });

        validateStatusTransitionMock
          .mockImplementation(
            () => {
              throw transitionError;
            }
          );

        await expect(
          publishEligibleJob({
            recruiterId,
            jobId
          })
        ).rejects.toBe(
          transitionError
        );

        expect(
          validateStatusTransitionMock
        ).toHaveBeenCalledWith(
          status,
          "PUBLISHED"
        );

        expect(
          findCompanyByIdMock
        ).not.toHaveBeenCalled();

        expect(
          publishJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "returns COMPANY_NOT_FOUND when the associated company is missing",
      async () => {
        findCompanyByIdMock
          .mockResolvedValue(
            null
          );

        await expect(
          publishEligibleJob({
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
          validatePublicationEligibilityMock
        ).not.toHaveBeenCalled();

        expect(
          publishJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "propagates COMPANY_NOT_VERIFIED",
      async () => {
        const companyError =
          Object.assign(
            new Error(
              "Company is not verified"
            ),
            {
              statusCode:
                409,

              code:
                "COMPANY_NOT_VERIFIED"
            }
          );

        validatePublicationEligibilityMock
          .mockImplementation(
            () => {
              throw companyError;
            }
          );

        await expect(
          publishEligibleJob({
            recruiterId,
            jobId
          })
        ).rejects.toBe(
          companyError
        );

        expect(
          publishJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "propagates JOB_NOT_READY_FOR_PUBLICATION",
      async () => {
        const eligibilityError =
          Object.assign(
            new Error(
              "Job is incomplete"
            ),
            {
              statusCode:
                409,

              code:
                "JOB_NOT_READY_FOR_PUBLICATION",

              errors: [
                {
                  field:
                    "title"
                }
              ]
            }
          );

        validatePublicationEligibilityMock
          .mockImplementation(
            () => {
              throw eligibilityError;
            }
          );

        await expect(
          publishEligibleJob({
            recruiterId,
            jobId
          })
        ).rejects.toBe(
          eligibilityError
        );

        expect(
          publishJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "returns JOB_NOT_FOUND when publication update returns null",
      async () => {
        publishJobMock
          .mockResolvedValue(
            null
          );

        await expect(
          publishEligibleJob({
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
      "writes a success audit event after publication",
      async () => {
        await publishEligibleJob({
          recruiterId,
          jobId,

          auditContext: {
            ipAddress:
              "127.0.0.1",

            userAgent:
              "CareerForge Test",

            requestId:
              "request-success"
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
              "JOB_PUBLISHED",

            status:
              "SUCCESS",

            previousStatus:
              "DRAFT",

            nextStatus:
              "PUBLISHED",

            ipAddress:
              "127.0.0.1",

            userAgent:
              "CareerForge Test",

            requestId:
              "request-success",

            metadata:
              expect.objectContaining({
                publishedAt:
                  expect.any(
                    Date
                  )
              })
          })
        );
      }
    );

    test(
      "writes a failed audit event when publication fails",
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
          publishEligibleJob({
            recruiterId,
            jobId,

            auditContext: {
              requestId:
                "request-failed"
            }
          })
        ).rejects.toBe(
          transitionError
        );

        expect(
          logJobEventMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            recruiterId,
            jobId,
            companyId,

            event:
              "JOB_PUBLICATION_FAILED",

            status:
              "FAILED",

            previousStatus:
              "DRAFT",

            nextStatus:
              "PUBLISHED",

            requestId:
              "request-failed",

            metadata:
              expect.objectContaining({
                errorCode:
                  "INVALID_JOB_STATUS_TRANSITION",

                message:
                  "Invalid transition"
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
              "Publication validation failed"
            ),
            {
              statusCode:
                409,

              code:
                "JOB_NOT_READY_FOR_PUBLICATION"
            }
          );

        validatePublicationEligibilityMock
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
          publishEligibleJob({
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