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
  deleteEligibleDraftJob,
  deleteExistingJob
} = await import(
  "../../services/job.service.js"
);

describe(
  "Delete eligible draft job service",
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
        "DRAFT"
    };

    const draftJob = {
      id:
        jobId,

      companyId,

      createdBy:
        recruiterId,

      title:
        "Backend Developer",

      status:
        "DRAFT",

      applicationCount:
        0
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
          draftJob
        );

      findCompanyByIdMock
        .mockResolvedValue(
          company
        );

      validateCompanyOwnershipMock
        .mockReturnValue(
          true
        );

      deleteDraftJobMock
        .mockResolvedValue(
          true
        );

      logJobEventMock
        .mockResolvedValue(
          undefined
        );
    });

    test(
      "soft deletes an eligible draft using a transaction",
      async () => {
        const result =
          await deleteEligibleDraftJob({
            recruiterId,
            jobId,

            auditContext: {
              ipAddress:
                "127.0.0.1",

              userAgent:
                "CareerForge Jest",

              requestId:
                "request-delete-1"
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
          deleteDraftJobMock
        ).toHaveBeenCalledWith(
          jobId,
          {
            transaction:
              transactionMock,

            force:
              false
          }
        );

        expect(result).toEqual({
          message:
            "Job deleted successfully."
        });
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
          deleteEligibleDraftJob({
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
          deleteDraftJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "rejects another recruiter with JOB_ACCESS_FORBIDDEN",
      async () => {
        await expect(
          deleteEligibleDraftJob({
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
          findCompanyByIdMock
        ).not.toHaveBeenCalled();

        expect(
          deleteDraftJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test.each([
      "PUBLISHED",
      "CLOSED",
      "REMOVED"
    ])(
      "rejects deleting a %s job with JOB_DELETE_NOT_ALLOWED",
      async (
        status
      ) => {
        findJobByIdMock
          .mockResolvedValue({
            ...draftJob,
            status
          });

        await expect(
          deleteEligibleDraftJob({
            recruiterId,
            jobId
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              409,

            code:
              "JOB_DELETE_NOT_ALLOWED",

            errors:
              expect.arrayContaining([
                expect.objectContaining({
                  currentStatus:
                    status,

                  requiredStatus:
                    "DRAFT"
                })
              ])
          })
        );

        expect(
          findCompanyByIdMock
        ).not.toHaveBeenCalled();

        expect(
          deleteDraftJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "rejects a draft job with applications",
      async () => {
        findJobByIdMock
          .mockResolvedValue({
            ...draftJob,

            applicationCount:
              3
          });

        await expect(
          deleteEligibleDraftJob({
            recruiterId,
            jobId
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              409,

            code:
              "JOB_HAS_APPLICATIONS",

            errors:
              expect.arrayContaining([
                expect.objectContaining({
                  applicationCount:
                    3
                })
              ])
          })
        );

        expect(
          findCompanyByIdMock
        ).not.toHaveBeenCalled();

        expect(
          deleteDraftJobMock
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
          deleteEligibleDraftJob({
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
          deleteDraftJobMock
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
          deleteEligibleDraftJob({
            recruiterId,
            jobId
          })
        ).rejects.toBe(
          ownershipError
        );

        expect(
          deleteDraftJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "returns JOB_DELETE_NOT_ALLOWED when repository deletion returns null",
      async () => {
        deleteDraftJobMock
          .mockResolvedValue(
            null
          );

        await expect(
          deleteEligibleDraftJob({
            recruiterId,
            jobId
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              409,

            code:
              "JOB_DELETE_NOT_ALLOWED"
          })
        );
      }
    );

    test(
      "propagates repository errors",
      async () => {
        const repositoryError =
          new Error(
            "Database deletion failure"
          );

        deleteDraftJobMock
          .mockRejectedValue(
            repositoryError
          );

        await expect(
          deleteEligibleDraftJob({
            recruiterId,
            jobId
          })
        ).rejects.toBe(
          repositoryError
        );
      }
    );

    test(
      "writes a success audit event after deletion",
      async () => {
        await deleteEligibleDraftJob({
          recruiterId,
          jobId,

          auditContext: {
            ipAddress:
              "127.0.0.1",

            userAgent:
              "CareerForge Test",

            requestId:
              "request-delete-success"
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
              "JOB_DELETED",

            status:
              "SUCCESS",

            previousStatus:
              "DRAFT",

            nextStatus:
              null,

            ipAddress:
              "127.0.0.1",

            userAgent:
              "CareerForge Test",

            requestId:
              "request-delete-success",

            metadata:
              expect.objectContaining({
                deletionType:
                  "SOFT_DELETE",

                applicationCount:
                  0
              })
          })
        );
      }
    );

    test(
      "writes a failed audit event when deletion fails",
      async () => {
        findJobByIdMock
          .mockResolvedValue({
            ...draftJob,

            status:
              "PUBLISHED"
          });

        await expect(
          deleteEligibleDraftJob({
            recruiterId,
            jobId,

            auditContext: {
              requestId:
                "request-delete-failed"
            }
          })
        ).rejects.toEqual(
          expect.objectContaining({
            code:
              "JOB_DELETE_NOT_ALLOWED"
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
              "JOB_DELETE_FAILED",

            status:
              "FAILED",

            previousStatus:
              "PUBLISHED",

            nextStatus:
              null,

            requestId:
              "request-delete-failed",

            metadata:
              expect.objectContaining({
                errorCode:
                  "JOB_DELETE_NOT_ALLOWED",

                message:
                  "Only a draft job can be deleted.",

                applicationCount:
                  0
              })
          })
        );
      }
    );

    test(
      "does not replace the original error when failed audit logging also fails",
      async () => {
        const originalError =
          new Error(
            "Database deletion failure"
          );

        deleteDraftJobMock
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
          deleteEligibleDraftJob({
            recruiterId,
            jobId
          })
        ).rejects.toBe(
          originalError
        );
      }
    );

    test(
      "keeps the compatibility deleteExistingJob wrapper working",
      async () => {
        const result =
          await deleteExistingJob({
            ownerId:
              recruiterId,

            jobId,

            auditContext: {
              requestId:
                "compatibility-delete"
            }
          });

        expect(result).toEqual({
          message:
            "Job deleted successfully."
        });

        expect(
          deleteDraftJobMock
        ).toHaveBeenCalledWith(
          jobId,
          expect.objectContaining({
            transaction:
              transactionMock,

            force:
              false
          })
        );
      }
    );
  }
);
