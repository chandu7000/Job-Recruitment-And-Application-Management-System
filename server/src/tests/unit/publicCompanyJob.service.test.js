import {
  jest
} from "@jest/globals";

const findCompanyByIdMock =
  jest.fn();

const findCompanyBySlugMock =
  jest.fn();

const validateCompanyMock =
  jest.fn();

const getPublicJobsMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/publicCompany.repository.js",
  () => ({
    findPublicCompanyCandidateById:
      findCompanyByIdMock,

    findPublicCompanyCandidateBySlug:
      findCompanyBySlugMock
  })
);

jest.unstable_mockModule(
  "../../utils/publicCompanyEligibility.js",
  () => ({
    validatePublicCompanyEligibility:
      validateCompanyMock
  })
);

jest.unstable_mockModule(
  "../../services/publicJob.service.js",
  () => ({
    getPublicJobs:
      getPublicJobsMock
  })
);

const {
  getPublicCompanyJobsById,
  getPublicCompanyJobsBySlug
} = await import(
  "../../services/publicCompanyJob.service.js"
);

describe(
  "Public company jobs service",
  () => {
    const company = {
      id:
        "11111111-1111-4111-8111-111111111111",

      slug:
        "careerforge-technologies",

      status:
        "VERIFIED",

      deletedAt:
        null
    };

    const now =
      new Date(
        "2026-08-05T10:00:00.000Z"
      );

    beforeEach(() => {
      jest.clearAllMocks();

      findCompanyByIdMock
        .mockResolvedValue(
          company
        );

      findCompanyBySlugMock
        .mockResolvedValue(
          company
        );

      validateCompanyMock
        .mockReturnValue(
          true
        );

      getPublicJobsMock
        .mockResolvedValue({
          jobs: [
            {
              id:
                "22222222-2222-4222-8222-222222222222"
            }
          ],

          pagination: {
            page: 1,
            limit: 10,
            totalRecords: 1,
            totalPages: 1
          }
        });
    });

    test(
      "lists jobs for an eligible company by ID",
      async () => {
        const result =
          await getPublicCompanyJobsById({
            companyId:
              company.id,

            query: {
              search:
                "Java"
            },

            now
          });

        expect(
          findCompanyByIdMock
        ).toHaveBeenCalledWith(
          company.id
        );

        expect(
          validateCompanyMock
        ).toHaveBeenCalledWith(
          company
        );

        expect(
          getPublicJobsMock
        ).toHaveBeenCalledWith({
          query: {
            search:
              "Java",

            companyId:
              company.id
          },

          now
        });

        expect(
          result.jobs
        ).toHaveLength(1);
      }
    );

    test(
      "lists jobs for an eligible company by slug",
      async () => {
        await getPublicCompanyJobsBySlug({
          companySlug:
            company.slug,

          query: {
            page: 2
          },

          now
        });

        expect(
          findCompanyBySlugMock
        ).toHaveBeenCalledWith(
          company.slug
        );

        expect(
          getPublicJobsMock
        ).toHaveBeenCalledWith({
          query: {
            page: 2,

            companyId:
              company.id
          },

          now
        });
      }
    );

    test(
      "overrides a client supplied companyId",
      async () => {
        await getPublicCompanyJobsById({
          companyId:
            company.id,

          query: {
            companyId:
              "33333333-3333-4333-8333-333333333333"
          },

          now
        });

        expect(
          getPublicJobsMock
        ).toHaveBeenCalledWith({
          query: {
            companyId:
              company.id
          },

          now
        });
      }
    );

    test(
      "does not fetch jobs when company eligibility fails",
      async () => {
        const error =
          new Error(
            "Public company not found."
          );

        error.statusCode =
          404;

        error.code =
          "PUBLIC_COMPANY_NOT_FOUND";

        validateCompanyMock
          .mockImplementation(() => {
            throw error;
          });

        await expect(
          getPublicCompanyJobsById({
            companyId:
              company.id
          })
        ).rejects.toBe(
          error
        );

        expect(
          getPublicJobsMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "returns an empty company-job result",
      async () => {
        getPublicJobsMock
          .mockResolvedValue({
            jobs: [],

            pagination: {
              page: 1,
              limit: 10,
              offset: 0,
              totalRecords: 0,
              totalPages: 1,
              hasPreviousPage:
                false,
              hasNextPage:
                false
            }
          });

        const result =
          await getPublicCompanyJobsById({
            companyId:
              company.id
          });

        expect(
          result.jobs
        ).toEqual([]);

        expect(
          result.pagination.totalRecords
        ).toBe(0);
      }
    );

    test(
      "maps company repository failures",
      async () => {
        findCompanyByIdMock
          .mockRejectedValue(
            new Error(
              "Database unavailable"
            )
          );

        await expect(
          getPublicCompanyJobsById({
            companyId:
              company.id
          })
        ).rejects.toMatchObject({
          statusCode:
            500,

          code:
            "PUBLIC_COMPANY_JOBS_FETCH_FAILED"
        });

        expect(
          getPublicJobsMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "preserves public-job service errors",
      async () => {
        const error =
          new Error(
            "Unable to fetch public jobs."
          );

        error.statusCode =
          500;

        error.code =
          "PUBLIC_JOBS_FETCH_FAILED";

        getPublicJobsMock
          .mockRejectedValue(
            error
          );

        await expect(
          getPublicCompanyJobsById({
            companyId:
              company.id
          })
        ).rejects.toBe(
          error
        );
      }
    );
  }
);