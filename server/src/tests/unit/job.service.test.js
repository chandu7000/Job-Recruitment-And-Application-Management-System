import {
  jest
} from "@jest/globals";

const createJobMock =
  jest.fn();

const findJobBySlugMock =
  jest.fn();

const findJobByIdMock =
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

const findRecruiterJobsMock =
  jest.fn();

const findRecruiterJobByIdMock =
  jest.fn();

const countRecruiterJobsMock =
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
      createJobMock,

    findJobBySlug:
      findJobBySlugMock,

    findJobById:
      findJobByIdMock,

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
  "../../services/jobAudit.service.js",
  () => ({
    logJobEvent:
      logJobEventMock
  })
);

const {
  createDraftJob,
  createNewJob,
  getUnsupportedJobFields,
  getRecruiterJobs,
  getRecruiterJobById
} = await import(
  "../../services/job.service.js"
);

describe(
  "Job service",
  () => {
    const recruiterId =
      "11111111-1111-1111-1111-111111111111";

    const companyId =
      "22222222-2222-2222-2222-222222222222";

    const jobId =
      "33333333-3333-3333-3333-333333333333";

    const company = {
      id: companyId,

      ownerId:
        recruiterId,

      status:
        "DRAFT"
    };

    const createdJob = {
      id: jobId,

      companyId,

      createdBy:
        recruiterId,

      title:
        "Backend Developer",

      slug:
        "backend-developer",

      status:
        "DRAFT"
    };

    beforeEach(() => {
      jest.clearAllMocks();

      validateCompanyOwnershipMock
        .mockReturnValue(true);

      findJobBySlugMock
        .mockResolvedValue(null);

      logJobEventMock
        .mockResolvedValue(
          undefined
        );
    });

    describe(
      "draft creation",
      () => {
        test(
          "identifies unsupported fields",
          () => {
            expect(
              getUnsupportedJobFields({
                companyId,

                title:
                  "Backend Developer",

                status:
                  "PUBLISHED",

                createdBy:
                  "attacker"
              })
            ).toEqual([
              "status",
              "createdBy"
            ]);
          }
        );

        test(
          "creates an incomplete draft for an owned company",
          async () => {
            findCompanyByIdMock
              .mockResolvedValue(
                company
              );

            createJobMock
              .mockResolvedValue(
                createdJob
              );

            const result =
              await createDraftJob({
                recruiterId,

                payload: {
                  companyId
                }
              });

            expect(
              findCompanyByIdMock
            ).toHaveBeenCalledWith(
              companyId
            );

            expect(
              validateCompanyOwnershipMock
            ).toHaveBeenCalledWith(
              company,
              recruiterId
            );

            expect(
              createJobMock
            ).toHaveBeenCalledWith({
              companyId,

              createdBy:
                recruiterId,

              slug: null,

              status:
                "DRAFT"
            });

            expect(result).toBe(
              createdJob
            );
          }
        );

        test(
          "creates a titled draft with a generated slug",
          async () => {
            findCompanyByIdMock
              .mockResolvedValue(
                company
              );

            createJobMock
              .mockResolvedValue(
                createdJob
              );

            await createDraftJob({
              recruiterId,

              payload: {
                companyId,

                title:
                  "Backend Developer",

                workMode:
                  "REMOTE"
              }
            });

            expect(
              findJobBySlugMock
            ).toHaveBeenCalledWith(
              "backend-developer"
            );

            expect(
              createJobMock
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                companyId,

                createdBy:
                  recruiterId,

                title:
                  "Backend Developer",

                slug:
                  "backend-developer",

                workMode:
                  "REMOTE",

                status:
                  "DRAFT"
              })
            );
          }
        );

        test(
          "does not require a verified company for draft creation",
          async () => {
            findCompanyByIdMock
              .mockResolvedValue({
                ...company,

                status:
                  "DRAFT"
              });

            createJobMock
              .mockResolvedValue(
                createdJob
              );

            await expect(
              createDraftJob({
                recruiterId,

                payload: {
                  companyId
                }
              })
            ).resolves.toBe(
              createdJob
            );
          }
        );

        test(
          "rejects unsupported lifecycle fields",
          async () => {
            await expect(
              createDraftJob({
                recruiterId,

                payload: {
                  companyId,

                  status:
                    "PUBLISHED"
                }
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode: 400,

                code:
                  "UNSUPPORTED_JOB_FIELD"
              })
            );

            expect(
              findCompanyByIdMock
            ).not.toHaveBeenCalled();

            expect(
              createJobMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects a missing company",
          async () => {
            findCompanyByIdMock
              .mockResolvedValue(
                null
              );

            await expect(
              createDraftJob({
                recruiterId,

                payload: {
                  companyId
                }
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode: 404,

                code:
                  "COMPANY_NOT_FOUND"
              })
            );

            expect(
              createJobMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "stops when ownership validation fails",
          async () => {
            const ownershipError =
              Object.assign(
                new Error(
                  "Forbidden"
                ),
                {
                  statusCode: 403,

                  code:
                    "COMPANY_ACCESS_FORBIDDEN"
                }
              );

            findCompanyByIdMock
              .mockResolvedValue(
                company
              );

            validateCompanyOwnershipMock
              .mockImplementation(
                () => {
                  throw ownershipError;
                }
              );

            await expect(
              createDraftJob({
                recruiterId:
                  "44444444-4444-4444-4444-444444444444",

                payload: {
                  companyId
                }
              })
            ).rejects.toBe(
              ownershipError
            );

            expect(
              createJobMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "converts repository failure to JOB_CREATION_FAILED",
          async () => {
            findCompanyByIdMock
              .mockResolvedValue(
                company
              );

            createJobMock
              .mockRejectedValue(
                new Error(
                  "Database failure"
                )
              );

            await expect(
              createDraftJob({
                recruiterId,

                payload: {
                  companyId
                }
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode: 500,

                code:
                  "JOB_CREATION_FAILED"
              })
            );
          }
        );

        test(
          "writes a JOB_CREATED audit event after successful draft creation",
          async () => {
            findCompanyByIdMock.mockResolvedValue(company);
            createJobMock.mockResolvedValue(createdJob);

            await createDraftJob({
              recruiterId,
              payload: {
                companyId,
                title: "Backend Developer",
                workMode: "REMOTE"
              },
              auditContext: {
                ipAddress: "127.0.0.1",
                userAgent: "CareerForge Unit Test",
                requestId: "job-create-success"
              }
            });

            expect(logJobEventMock).toHaveBeenCalledWith(
              expect.objectContaining({
                recruiterId,
                jobId,
                companyId,
                event: "JOB_CREATED",
                status: "SUCCESS",
                previousStatus: null,
                nextStatus: "DRAFT",
                ipAddress: "127.0.0.1",
                userAgent: "CareerForge Unit Test",
                requestId: "job-create-success",
                metadata: expect.objectContaining({
                  changedFields: expect.arrayContaining([
                    "companyId",
                    "title",
                    "workMode"
                  ]),
                  initialStatus: "DRAFT"
                })
              })
            );
          }
        );

        test(
          "writes a JOB_CREATION_FAILED audit event when creation fails",
          async () => {
            findCompanyByIdMock.mockResolvedValue(company);
            createJobMock.mockRejectedValue(new Error("Database failure"));

            await expect(
              createDraftJob({
                recruiterId,
                payload: { companyId, title: "Backend Developer" },
                auditContext: { requestId: "job-create-failure" }
              })
            ).rejects.toEqual(expect.objectContaining({ code: "JOB_CREATION_FAILED" }));

            expect(logJobEventMock).toHaveBeenCalledWith(
              expect.objectContaining({
                recruiterId,
                jobId: null,
                companyId,
                event: "JOB_CREATION_FAILED",
                status: "FAILED",
                nextStatus: "DRAFT",
                requestId: "job-create-failure",
                metadata: expect.objectContaining({
                  requestedFields: expect.arrayContaining(["companyId", "title"]),
                  errorCode: "JOB_CREATION_FAILED",
                  message: "Job draft could not be created."
                })
              })
            );
          }
        );

        test(
          "does not fail draft creation when success audit logging fails",
          async () => {
            findCompanyByIdMock.mockResolvedValue(company);
            createJobMock.mockResolvedValue(createdJob);
            logJobEventMock.mockRejectedValue(new Error("Audit failure"));

            await expect(
              createDraftJob({
                recruiterId,
                payload: { companyId, title: "Backend Developer" }
              })
            ).resolves.toBe(createdJob);
          }
        );

        test(
          "keeps the older createNewJob wrapper working",
          async () => {
            findCompanyByIdMock
              .mockResolvedValue(
                company
              );

            createJobMock
              .mockResolvedValue(
                createdJob
              );

            const result =
              await createNewJob({
                ownerId:
                  recruiterId,

                companyId
              });

            expect(result).toBe(
              createdJob
            );
          }
        );
      }
    );

    describe(
      "recruiter job viewing",
      () => {
        test(
          "returns paginated recruiter jobs",
          async () => {
            findRecruiterJobsMock
              .mockResolvedValue([
                createdJob
              ]);

            countRecruiterJobsMock
              .mockResolvedValue(
                21
              );

            const result =
              await getRecruiterJobs({
                recruiterId,

                query: {
                  page: "2",

                  limit: "10",

                  status:
                    "DRAFT",

                  search:
                    "backend",

                  location:
                    "Hyderabad",

                  employmentType:
                    "FULL_TIME",

                  workMode:
                    "REMOTE",

                  experienceLevel:
                    "JUNIOR",

                  sort:
                    "newest"
                }
              });

            expect(
              findRecruiterJobsMock
            ).toHaveBeenCalledWith({
              createdBy:
                recruiterId,

              limit: 10,

              offset: 10,

              filters: {
                status:
                  "DRAFT",

                location:
                  "Hyderabad",

                employmentType:
                  "FULL_TIME",

                workMode:
                  "REMOTE",

                experienceLevel:
                  "JUNIOR",

                dateFrom:
                  undefined,

                dateTo:
                  undefined,

                publishedFrom:
                  undefined,

                publishedTo:
                  undefined,

                deadlineFrom:
                  undefined,

                deadlineTo:
                  undefined,

                minimumSalary:
                  undefined,

                maximumSalary:
                  undefined
              },

              search:
                "backend",

              sort:
                "newest"
            });

            expect(
              countRecruiterJobsMock
            ).toHaveBeenCalledWith({
              createdBy:
                recruiterId,

              filters: {
                status:
                  "DRAFT",

                location:
                  "Hyderabad",

                employmentType:
                  "FULL_TIME",

                workMode:
                  "REMOTE",

                experienceLevel:
                  "JUNIOR",

                dateFrom:
                  undefined,

                dateTo:
                  undefined,

                publishedFrom:
                  undefined,

                publishedTo:
                  undefined,

                deadlineFrom:
                  undefined,

                deadlineTo:
                  undefined,

                minimumSalary:
                  undefined,

                maximumSalary:
                  undefined
              },

              search:
                "backend"
            });

            expect(
              result.jobs
            ).toEqual([
              createdJob
            ]);

            expect(
              result.pagination
            ).toEqual({
              page: 2,

              limit: 10,

              offset: 10,

              totalRecords: 21,

              totalPages: 3,

              hasPreviousPage: true,

              hasNextPage: true
            });
          }
        );

        test(
          "uses default pagination and sorting",
          async () => {
            findRecruiterJobsMock
              .mockResolvedValue([]);

            countRecruiterJobsMock
              .mockResolvedValue(
                0
              );

            const result =
              await getRecruiterJobs({
                recruiterId,

                query: {}
              });

            expect(
              findRecruiterJobsMock
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                createdBy:
                  recruiterId,

                limit: 10,

                offset: 0,

                search:
                  undefined,

                sort:
                  "newest"
              })
            );

            expect(
              result.pagination
            ).toEqual({
              page: 1,

              limit: 10,

              offset: 0,

              totalRecords: 0,

              totalPages: 1,

              hasPreviousPage: false,

              hasNextPage: false
            });
          }
        );

        test(
          "returns an owned recruiter job",
          async () => {
            findRecruiterJobByIdMock
              .mockResolvedValue(
                createdJob
              );

            const result =
              await getRecruiterJobById({
                recruiterId,

                jobId
              });

            expect(
              findRecruiterJobByIdMock
            ).toHaveBeenCalledWith({
              jobId,

              createdBy:
                recruiterId
            });

            expect(result).toBe(
              createdJob
            );
          }
        );

        test(
          "returns JOB_NOT_FOUND for a missing job",
          async () => {
            findRecruiterJobByIdMock
              .mockResolvedValue(
                null
              );

            await expect(
              getRecruiterJobById({
                recruiterId,

                jobId
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode: 404,

                code:
                  "JOB_NOT_FOUND"
              })
            );
          }
        );

        test(
          "returns JOB_NOT_FOUND for another recruiter's job",
          async () => {
            findRecruiterJobByIdMock
              .mockResolvedValue(
                null
              );

            await expect(
              getRecruiterJobById({
                recruiterId:
                  "44444444-4444-4444-4444-444444444444",

                jobId
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode: 404,

                code:
                  "JOB_NOT_FOUND"
              })
            );

            expect(
              findRecruiterJobByIdMock
            ).toHaveBeenCalledWith({
              jobId,

              createdBy:
                "44444444-4444-4444-4444-444444444444"
            });
          }
        );
      }
    );
  }
);