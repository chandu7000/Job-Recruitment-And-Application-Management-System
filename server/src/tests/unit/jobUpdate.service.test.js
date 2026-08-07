import {
  jest
} from "@jest/globals";

const findJobByIdMock =
  jest.fn();

const findJobBySlugMock =
  jest.fn();

const updateJobMock =
  jest.fn();

const publishJobMock =
  jest.fn();

const closeJobMock =
  jest.fn();

const deleteDraftJobMock =
  jest.fn();

const findCompanyByIdMock =
  jest.fn();

const validateCompanyOwnershipMock =
  jest.fn();

const logJobEventMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/job.repository.js",
  () => ({
    createJob:
      jest.fn(),

    findJobById:
      findJobByIdMock,

    findJobBySlug:
      findJobBySlugMock,

    findRecruiterJobs:
      jest.fn(),

    findRecruiterJobById:
      jest.fn(),

    countRecruiterJobs:
      jest.fn(),

    findJobsByCompany:
      jest.fn(),

    findAllActiveJobs:
      jest.fn(),

    updateJob:
      updateJobMock,

    publishJob:
      publishJobMock,

    closeJob:
      closeJobMock,

    deleteDraftJob:
      deleteDraftJobMock,

    deleteJob:
      jest.fn()
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
  "../../services/jobAudit.service.js",
  () => ({
    logJobEvent:
      logJobEventMock
  })
);

const {
  updateEligibleJob
} = await import(
  "../../services/job.service.js"
);

describe(
  "Job update service",
  () => {
    const recruiterId =
      "11111111-1111-4111-8111-111111111111";

    const companyId =
      "22222222-2222-4222-8222-222222222222";

    const jobId =
      "33333333-3333-4333-8333-333333333333";

    const company = {
      id: companyId,

      ownerId:
        recruiterId
    };

    const draftJob = {
      id: jobId,

      companyId,

      createdBy:
        recruiterId,

      title:
        "Backend Developer",

      slug:
        "backend-developer",

      status:
        "DRAFT",

      minimumSalary:
        300000,

      maximumSalary:
        600000,

      minimumExperience:
        1,

      maximumExperience:
        3
    };

    beforeEach(() => {
      jest.clearAllMocks();

      findJobByIdMock
        .mockResolvedValue(
          draftJob
        );

      findCompanyByIdMock
        .mockResolvedValue(
          company
        );

      validateCompanyOwnershipMock
        .mockReturnValue(true);

      findJobBySlugMock
        .mockResolvedValue(null);

      logJobEventMock
        .mockResolvedValue(
          undefined
        );

      updateJobMock
        .mockImplementation(
          async (
            id,
            updateData
          ) => ({
            ...draftJob,
            ...updateData,
            id
          })
        );
    });

    test(
      "updates approved fields on a draft job",
      async () => {
        const result =
          await updateEligibleJob({
            recruiterId,
            jobId,

            payload: {
              title:
                "Senior Backend Developer",

              minimumSalary:
                400000,

              maximumSalary:
                800000
            }
          });

        expect(
          validateCompanyOwnershipMock
        ).toHaveBeenCalledWith(
          company,
          recruiterId
        );

        expect(
          updateJobMock
        ).toHaveBeenCalledWith(
          jobId,
          expect.objectContaining({
            title:
              "Senior Backend Developer",

            slug:
              "senior-backend-developer",

            minimumSalary:
              400000,

            maximumSalary:
              800000
          })
        );

        expect(
          result.title
        ).toBe(
          "Senior Backend Developer"
        );
      }
    );

    test(
      "keeps the current slug when normalized title does not change",
      async () => {
        await updateEligibleJob({
          recruiterId,
          jobId,

          payload: {
            title:
              " Backend Developer "
          }
        });

        expect(
          findJobBySlugMock
        ).not.toHaveBeenCalled();

        expect(
          updateJobMock
        ).toHaveBeenCalledWith(
          jobId,
          {
            title:
              " Backend Developer ",

            slug:
              "backend-developer"
          }
        );
      }
    );

    test(
      "allows safe fields on a published job",
      async () => {
        findJobByIdMock
          .mockResolvedValue({
            ...draftJob,

            status:
              "PUBLISHED"
          });

        await expect(
          updateEligibleJob({
            recruiterId,
            jobId,

            payload: {
              description:
                "Updated description",

              vacancies:
                5
            }
          })
        ).resolves.toEqual(
          expect.objectContaining({
            description:
              "Updated description",

            vacancies:
              5
          })
        );
      }
    );

    test(
      "rejects restricted fields on a published job",
      async () => {
        findJobByIdMock
          .mockResolvedValue({
            ...draftJob,

            status:
              "PUBLISHED"
          });

        await expect(
          updateEligibleJob({
            recruiterId,
            jobId,

            payload: {
              title:
                "Changed published title"
            }
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              409,

            code:
              "JOB_UPDATE_NOT_ALLOWED"
          })
        );

        expect(
          updateJobMock
        ).not.toHaveBeenCalled();
      }
    );

    test.each([
      "CLOSED",
      "REMOVED"
    ])(
      "rejects updates when status is %s",
      async (
        status
      ) => {
        findJobByIdMock
          .mockResolvedValue({
            ...draftJob,
            status
          });

        await expect(
          updateEligibleJob({
            recruiterId,
            jobId,

            payload: {
              description:
                "Updated"
            }
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              409,

            code:
              "JOB_UPDATE_NOT_ALLOWED"
          })
        );
      }
    );

    test(
      "rejects an empty update",
      async () => {
        await expect(
          updateEligibleJob({
            recruiterId,
            jobId,
            payload: {}
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              400,

            code:
              "NO_SUPPORTED_JOB_FIELDS"
          })
        );

        expect(
          findJobByIdMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "rejects protected fields",
      async () => {
        await expect(
          updateEligibleJob({
            recruiterId,
            jobId,

            payload: {
              status:
                "PUBLISHED",

              viewCount:
                100
            }
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              400,

            code:
              "UNSUPPORTED_JOB_FIELD"
          })
        );

        expect(
          findJobByIdMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "rejects an invalid salary range",
      async () => {
        await expect(
          updateEligibleJob({
            recruiterId,
            jobId,

            payload: {
              minimumSalary:
                900000
            }
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              422,

            code:
              "INVALID_SALARY_RANGE"
          })
        );
      }
    );

    test(
      "rejects an invalid experience range",
      async () => {
        await expect(
          updateEligibleJob({
            recruiterId,
            jobId,

            payload: {
              minimumExperience:
                5
            }
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              422,

            code:
              "INVALID_EXPERIENCE_RANGE"
          })
        );
      }
    );

    test(
      "rejects a past application deadline",
      async () => {
        await expect(
          updateEligibleJob({
            recruiterId,
            jobId,

            payload: {
              applicationDeadline:
                new Date(
                  "2020-01-01T00:00:00.000Z"
                )
            }
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              422,

            code:
              "INVALID_APPLICATION_DEADLINE"
          })
        );
      }
    );

    test(
      "returns JOB_NOT_FOUND when job does not exist",
      async () => {
        findJobByIdMock
          .mockResolvedValue(
            null
          );

        await expect(
          updateEligibleJob({
            recruiterId,
            jobId,

            payload: {
              description:
                "Updated"
            }
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
      "rejects direct job ownership mismatch with JOB_ACCESS_FORBIDDEN",
      async () => {
        await expect(
          updateEligibleJob({
            recruiterId: "44444444-4444-4444-8444-444444444444",
            jobId,
            payload: { description: "Unauthorized update" }
          })
        ).rejects.toEqual(
          expect.objectContaining({ statusCode: 403, code: "JOB_ACCESS_FORBIDDEN" })
        );

        expect(findCompanyByIdMock).not.toHaveBeenCalled();
        expect(updateJobMock).not.toHaveBeenCalled();
      }
    );

    test(
      "writes a JOB_UPDATED audit event with changed field names",
      async () => {
        await updateEligibleJob({
          recruiterId,
          jobId,
          payload: { description: "Updated description", vacancies: 5 },
          auditContext: {
            ipAddress: "127.0.0.1",
            userAgent: "CareerForge Unit Test",
            requestId: "job-update-success"
          }
        });

        expect(logJobEventMock).toHaveBeenCalledWith(
          expect.objectContaining({
            recruiterId,
            jobId,
            companyId,
            event: "JOB_UPDATED",
            status: "SUCCESS",
            previousStatus: "DRAFT",
            nextStatus: "DRAFT",
            requestId: "job-update-success",
            metadata: { changedFields: ["description", "vacancies"] }
          })
        );
      }
    );

    test(
      "writes a JOB_UPDATE_FAILED audit event when update fails",
      async () => {
        const failure = Object.assign(new Error("Database update failure"), {
          code: "DATABASE_UPDATE_FAILED"
        });
        updateJobMock.mockRejectedValue(failure);

        await expect(
          updateEligibleJob({
            recruiterId,
            jobId,
            payload: { description: "Updated description" },
            auditContext: { requestId: "job-update-failure" }
          })
        ).rejects.toBe(failure);

        expect(logJobEventMock).toHaveBeenCalledWith(
          expect.objectContaining({
            recruiterId,
            jobId,
            companyId,
            event: "JOB_UPDATE_FAILED",
            status: "FAILED",
            previousStatus: "DRAFT",
            nextStatus: "DRAFT",
            requestId: "job-update-failure",
            metadata: expect.objectContaining({
              changedFields: ["description"],
              requestedFields: ["description"],
              errorCode: "DATABASE_UPDATE_FAILED",
              message: "Database update failure"
            })
          })
        );
      }
    );

    test(
      "does not fail a successful update when audit logging fails",
      async () => {
        logJobEventMock.mockRejectedValue(new Error("Audit failure"));

        await expect(
          updateEligibleJob({
            recruiterId,
            jobId,
            payload: { description: "Updated description" }
          })
        ).resolves.toEqual(
          expect.objectContaining({ description: "Updated description" })
        );
      }
    );

    test(
      "stops when company ownership validation fails",
      async () => {
        const ownershipError =
          Object.assign(
            new Error(
              "Forbidden"
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
          updateEligibleJob({
            recruiterId,

            jobId,

            payload: {
              description:
                "Unauthorized update"
            }
          })
        ).rejects.toBe(
          ownershipError
        );

        expect(
          updateJobMock
        ).not.toHaveBeenCalled();
      }
    );
  }
);