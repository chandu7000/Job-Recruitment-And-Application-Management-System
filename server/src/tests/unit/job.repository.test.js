import {
  jest
} from "@jest/globals";

const createMock =
  jest.fn();

const findByPkMock =
  jest.fn();

const findOneMock =
  jest.fn();

const findAllMock =
  jest.fn();

const countMock =
  jest.fn();

const updateManyMock =
  jest.fn();

jest.unstable_mockModule(
  "../../models/job.model.js",
  () => ({
    default: {
      create:
        createMock,

      findByPk:
        findByPkMock,

      findOne:
        findOneMock,

      findAll:
        findAllMock,

      count:
        countMock,

      update:
        updateManyMock
    }
  })
);

const {
  createJob,
  findJobById,
  findJobBySlug,
  findJobByIdAndCompanyId,
  findRecruiterJobs,
  findRecruiterJobById,
  countRecruiterJobs,
  updateJob,
  updateJobStatus,
  publishJob,
  closeJob,
  deleteDraftJob,
  findExpiredPublishedJobs,
  markExpiredJobsClosed,
  findJobsByCompany,
  findAllActiveJobs,
  deleteJob
} = await import(
  "../../repositories/job.repository.js"
);

describe(
  "Job repository",
  () => {
    const jobId =
      "11111111-1111-1111-1111-111111111111";

    const companyId =
      "22222222-2222-2222-2222-222222222222";

    const recruiterId =
      "33333333-3333-3333-3333-333333333333";

    const transaction = {
      id: "transaction-1"
    };

    const job = {
      id: jobId,
      companyId,
      createdBy:
        recruiterId,

      status: "DRAFT",

      update:
        jest.fn(),

      destroy:
        jest.fn()
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe(
      "createJob",
      () => {
        test(
          "creates a job with transaction support",
          async () => {
            createMock
              .mockResolvedValue(
                job
              );

            const jobData = {
              companyId,
              createdBy:
                recruiterId
            };

            const result =
              await createJob(
                jobData,
                {
                  transaction
                }
              );

            expect(
              createMock
            ).toHaveBeenCalledWith(
              jobData,
              {
                transaction
              }
            );

            expect(result).toBe(
              job
            );
          }
        );
      }
    );

    describe(
      "basic lookups",
      () => {
        test(
          "finds a job by ID",
          async () => {
            findByPkMock
              .mockResolvedValue(
                job
              );

            const result =
              await findJobById(
                jobId
              );

            expect(
              findByPkMock
            ).toHaveBeenCalledWith(
              jobId,
              expect.objectContaining({
                paranoid: true
              })
            );

            expect(result).toBe(
              job
            );
          }
        );

        test(
          "finds a job by slug",
          async () => {
            findOneMock
              .mockResolvedValue(
                job
              );

            const result =
              await findJobBySlug(
                "backend-developer"
              );

            expect(
              findOneMock
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                where: {
                  slug:
                    "backend-developer"
                }
              })
            );

            expect(result).toBe(
              job
            );
          }
        );

        test(
          "finds a job by ID and company",
          async () => {
            findOneMock
              .mockResolvedValue(
                job
              );

            await findJobByIdAndCompanyId(
              jobId,
              companyId
            );

            expect(
              findOneMock
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                where: {
                  id: jobId,
                  companyId
                }
              })
            );
          }
        );
      }
    );

    describe(
      "recruiter queries",
      () => {
        test(
          "finds paginated recruiter jobs",
          async () => {
            findAllMock
              .mockResolvedValue([
                job
              ]);

            const result =
              await findRecruiterJobs({
                createdBy:
                  recruiterId,

                companyId,

                limit: 20,
                offset: 40,

                filters: {
                  status:
                    "DRAFT",

                  workMode:
                    "REMOTE"
                },

                sort:
                  "oldest"
              });

            expect(
              findAllMock
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                where:
                  expect.objectContaining({
                    createdBy:
                      recruiterId,

                    companyId,

                    status:
                      "DRAFT",

                    workMode:
                      "REMOTE"
                  }),

                limit: 20,
                offset: 40,

                order: [
                  [
                    "created_at",
                    "ASC"
                  ]
                ],

                distinct: true
              })
            );

            expect(result).toEqual([
              job
            ]);
          }
        );

        test(
          "uses newest sorting when sort is unsupported",
          async () => {
            findAllMock
              .mockResolvedValue([]);

            await findRecruiterJobs({
              createdBy:
                recruiterId,

              sort:
                "unsupported"
            });

            expect(
              findAllMock
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                order: [
                  [
                    "created_at",
                    "DESC"
                  ]
                ]
              })
            );
          }
        );

        test(
          "finds one recruiter-owned job",
          async () => {
            findOneMock
              .mockResolvedValue(
                job
              );

            await findRecruiterJobById({
              jobId,
              createdBy:
                recruiterId,
              companyId
            });

            expect(
              findOneMock
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                where: {
                  id: jobId,
                  createdBy:
                    recruiterId,
                  companyId
                }
              })
            );
          }
        );

        test(
          "counts recruiter jobs",
          async () => {
            countMock
              .mockResolvedValue(
                7
              );

            const result =
              await countRecruiterJobs({
                createdBy:
                  recruiterId,

                filters: {
                  status:
                    "PUBLISHED"
                }
              });

            expect(
              countMock
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                where:
                  expect.objectContaining({
                    createdBy:
                      recruiterId,

                    status:
                      "PUBLISHED"
                  }),

                distinct: true,
                col: "id"
              })
            );

            expect(result).toBe(
              7
            );
          }
        );
      }
    );

    describe(
      "updates",
      () => {
        test(
          "updates an existing job",
          async () => {
            findByPkMock
              .mockResolvedValue(
                job
              );

            job.update
              .mockResolvedValue(
                job
              );

            const updateData = {
              title:
                "Updated title"
            };

            const result =
              await updateJob(
                jobId,
                updateData,
                {
                  transaction
                }
              );

            expect(
              job.update
            ).toHaveBeenCalledWith(
              updateData,
              {
                transaction
              }
            );

            expect(result).toBe(
              job
            );
          }
        );

        test(
          "returns null when updating a missing job",
          async () => {
            findByPkMock
              .mockResolvedValue(
                null
              );

            const result =
              await updateJob(
                jobId,
                {
                  title:
                    "Updated"
                }
              );

            expect(result).toBeNull();
          }
        );

        test(
          "updates lifecycle status data",
          async () => {
            findByPkMock
              .mockResolvedValue(
                job
              );

            const statusData = {
              status:
                "CLOSED"
            };

            await updateJobStatus(
              jobId,
              statusData,
              {
                transaction
              }
            );

            expect(
              job.update
            ).toHaveBeenCalledWith(
              statusData,
              {
                transaction
              }
            );
          }
        );
      }
    );

    describe(
      "publish and close",
      () => {
        test(
          "publishes a job",
          async () => {
            findByPkMock
              .mockResolvedValue(
                job
              );

            const publishedAt =
              new Date(
                "2026-08-03T05:00:00.000Z"
              );

            const result =
              await publishJob(
                jobId,
                {
                  publishedAt
                }
              );

            expect(
              job.update
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                status:
                  "PUBLISHED",

                publishedAt,

                closedAt: null,
                removedAt: null
              }),
              expect.any(Object)
            );

            expect(result).toBe(
              job
            );
          }
        );

        test(
          "closes a job",
          async () => {
            findByPkMock
              .mockResolvedValue(
                job
              );

            const closedAt =
              new Date(
                "2026-08-03T06:00:00.000Z"
              );

            await closeJob(
              jobId,
              {
                closedAt,

                closureReason:
                  "RECRUITMENT_COMPLETED"
              }
            );

            expect(
              job.update
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                status:
                  "CLOSED",

                closedAt,

                closureReason:
                  "RECRUITMENT_COMPLETED"
              }),
              expect.any(Object)
            );
          }
        );
      }
    );

    describe(
      "deletion",
      () => {
        test(
          "soft deletes an eligible draft",
          async () => {
            findOneMock
              .mockResolvedValue(
                job
              );

            job.destroy
              .mockResolvedValue(
                undefined
              );

            const result =
              await deleteDraftJob(
                jobId,
                {
                  transaction
                }
              );

            expect(
              findOneMock
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                where: {
                  id: jobId,
                  status:
                    "DRAFT",
                  applicationCount:
                    0
                }
              })
            );

            expect(
              job.destroy
            ).toHaveBeenCalledWith({
              transaction,
              force: false
            });

            expect(result).toBe(
              true
            );
          }
        );

        test(
          "returns null when eligible draft is not found",
          async () => {
            findOneMock
              .mockResolvedValue(
                null
              );

            const result =
              await deleteDraftJob(
                jobId
              );

            expect(result).toBeNull();
          }
        );
      }
    );

    describe(
      "expiry operations",
      () => {
        test(
          "finds expired published jobs",
          async () => {
            const now =
              new Date(
                "2026-08-03T08:00:00.000Z"
              );

            findAllMock
              .mockResolvedValue([
                job
              ]);

            const result =
              await findExpiredPublishedJobs({
                now,
                limit: 50,
                transaction
              });

            expect(
              findAllMock
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                where:
                  expect.objectContaining({
                    status:
                      "PUBLISHED"
                  }),

                limit: 50,
                transaction
              })
            );

            expect(result).toEqual([
              job
            ]);
          }
        );

        test(
          "marks expired published jobs closed",
          async () => {
            updateManyMock
              .mockResolvedValue([
                3
              ]);

            const now =
              new Date(
                "2026-08-03T08:00:00.000Z"
              );

            const closedAt =
              new Date(
                "2026-08-03T08:01:00.000Z"
              );

            const result =
              await markExpiredJobsClosed({
                now,
                closedAt,
                transaction
              });

            expect(
              updateManyMock
            ).toHaveBeenCalledWith(
              {
                status:
                  "CLOSED",

                closedAt,

                closureReason:
                  "DEADLINE_EXPIRED"
              },
              expect.objectContaining({
                where:
                  expect.objectContaining({
                    status:
                      "PUBLISHED"
                  }),

                transaction
              })
            );

            expect(result).toEqual([
              3
            ]);
          }
        );
      }
    );

    describe(
      "temporary compatibility methods",
      () => {
        test(
          "finds jobs by company",
          async () => {
            findAllMock
              .mockResolvedValue([
                job
              ]);

            await findJobsByCompany(
              companyId
            );

            expect(
              findAllMock
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                where: {
                  companyId
                }
              })
            );
          }
        );

        test(
          "finds active published jobs",
          async () => {
            findAllMock
              .mockResolvedValue([
                job
              ]);

            const result =
              await findAllActiveJobs();

            expect(
              findAllMock
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                where:
                  expect.objectContaining({
                    status:
                      "PUBLISHED"
                  })
              })
            );

            expect(result).toEqual([
              job
            ]);
          }
        );

        test(
          "deletes a job through compatibility method",
          async () => {
            findByPkMock
              .mockResolvedValue(
                job
              );

            const result =
              await deleteJob(
                jobId
              );

            expect(
              job.destroy
            ).toHaveBeenCalledWith({
              transaction:
                undefined,

              force: false
            });

            expect(result).toBe(
              true
            );
          }
        );
      }
    );
  }
);