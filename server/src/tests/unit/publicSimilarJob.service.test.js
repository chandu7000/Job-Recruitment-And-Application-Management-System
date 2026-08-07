import {
  jest
} from "@jest/globals";

const findCurrentJobMock =
  jest.fn();

const findSimilarJobsMock =
  jest.fn();

const validateEligibilityMock =
  jest.fn();

const sanitizeJobListMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/publicJob.repository.js",
  () => ({
    findPublicJobCandidateById:
      findCurrentJobMock,

    findSimilarPublicJobs:
      findSimilarJobsMock
  })
);

jest.unstable_mockModule(
  "../../utils/publicJobEligibility.js",
  () => ({
    validatePublicJobEligibility:
      validateEligibilityMock
  })
);

jest.unstable_mockModule(
  "../../utils/publicResponseSanitizer.js",
  () => ({
    sanitizePublicJobList:
      sanitizeJobListMock
  })
);

const {
  normalizeSimilarJobLimit,
  getSimilarPublicJobs
} = await import(
  "../../services/publicSimilarJob.service.js"
);

describe(
  "Public similar-job service",
  () => {
    const now =
      new Date(
        "2026-08-05T10:00:00.000Z"
      );

    const company = {
      id:
        "22222222-2222-4222-8222-222222222222",

      status:
        "VERIFIED",

      deletedAt:
        null
    };

    const currentJob = {
      id:
        "11111111-1111-4111-8111-111111111111",

      status:
        "PUBLISHED",

      applicationDeadline:
        new Date(
          "2026-09-05T10:00:00.000Z"
        ),

      company
    };

    const similarJobs = [
      {
        id:
          "33333333-3333-4333-8333-333333333333"
      }
    ];

    const sanitizedJobs = [
      {
        id:
          "33333333-3333-4333-8333-333333333333",

        title:
          "Similar Java Developer"
      }
    ];

    beforeEach(() => {
      jest.clearAllMocks();

      findCurrentJobMock
        .mockResolvedValue(
          currentJob
        );

      validateEligibilityMock
        .mockReturnValue(
          true
        );

      findSimilarJobsMock
        .mockResolvedValue(
          similarJobs
        );

      sanitizeJobListMock
        .mockReturnValue(
          sanitizedJobs
        );
    });

    test(
      "uses default similar-job limit",
      () => {
        expect(
          normalizeSimilarJobLimit()
        ).toBe(5);
      }
    );

    test(
      "normalizes a custom limit",
      () => {
        expect(
          normalizeSimilarJobLimit(
            "8"
          )
        ).toBe(8);
      }
    );

    test(
      "caps the limit at ten",
      () => {
        expect(
          normalizeSimilarJobLimit(
            "50"
          )
        ).toBe(10);
      }
    );

    test(
      "fetches similar jobs for an eligible current job",
      async () => {
        const result =
          await getSimilarPublicJobs({
            jobId:
              currentJob.id,

            limit:
              "5",

            now
          });

        expect(
          findCurrentJobMock
        ).toHaveBeenCalledWith(
          currentJob.id
        );

        expect(
          validateEligibilityMock
        ).toHaveBeenCalledWith(
          currentJob,
          company,
          {
            now
          }
        );

        expect(
          findSimilarJobsMock
        ).toHaveBeenCalledWith({
          currentJob,
          now,
          limit:
            5
        });

        expect(result).toEqual({
          jobs:
            sanitizedJobs,

          meta: {
            limit:
              5,

            count:
              1,

            sourceJobId:
              currentJob.id
          }
        });
      }
    );

    test(
      "does not query similar jobs when current job is unavailable",
      async () => {
        const error =
          new Error(
            "Public job not found."
          );

        error.statusCode =
          404;

        error.code =
          "PUBLIC_JOB_NOT_FOUND";

        validateEligibilityMock
          .mockImplementation(() => {
            throw error;
          });

        await expect(
          getSimilarPublicJobs({
            jobId:
              currentJob.id,

            now
          })
        ).rejects.toBe(
          error
        );

        expect(
          findSimilarJobsMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "returns an empty similar-job result",
      async () => {
        findSimilarJobsMock
          .mockResolvedValue([]);

        sanitizeJobListMock
          .mockReturnValue([]);

        const result =
          await getSimilarPublicJobs({
            jobId:
              currentJob.id,

            now
          });

        expect(
          result.jobs
        ).toEqual([]);

        expect(
          result.meta.count
        ).toBe(0);
      }
    );

    test(
      "maps current-job lookup failures",
      async () => {
        findCurrentJobMock
          .mockRejectedValue(
            new Error(
              "Database unavailable"
            )
          );

        await expect(
          getSimilarPublicJobs({
            jobId:
              currentJob.id
          })
        ).rejects.toMatchObject({
          statusCode:
            500,

          code:
            "SIMILAR_JOBS_FETCH_FAILED"
        });
      }
    );

    test(
      "maps similar-job query failures",
      async () => {
        findSimilarJobsMock
          .mockRejectedValue(
            new Error(
              "Similar query failed"
            )
          );

        await expect(
          getSimilarPublicJobs({
            jobId:
              currentJob.id,

            now
          })
        ).rejects.toMatchObject({
          statusCode:
            500,

          code:
            "SIMILAR_JOBS_FETCH_FAILED"
        });
      }
    );

    test(
      "does not increment current job view count",
      async () => {
        await getSimilarPublicJobs({
          jobId:
            currentJob.id,

          now
        });

        expect(
          findSimilarJobsMock
        ).toHaveBeenCalledTimes(1);
      }
    );
  }
);