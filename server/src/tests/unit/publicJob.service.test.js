import {
  jest
} from "@jest/globals";

const findEligiblePublicJobsMock =
  jest.fn();

const countEligiblePublicJobsMock =
  jest.fn();

const sanitizePublicJobListMock =
  jest.fn();

const findPublicJobCandidateByIdMock =
  jest.fn();

const findPublicJobCandidateBySlugMock =
  jest.fn();

const incrementPublicJobViewMock =
  jest.fn();

const sanitizePublicJobDetailMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/publicJob.repository.js",
  () => ({
    findEligiblePublicJobs:
      findEligiblePublicJobsMock,

    countEligiblePublicJobs:
      countEligiblePublicJobsMock,

    findPublicJobCandidateById:
      findPublicJobCandidateByIdMock,

    findPublicJobCandidateBySlug:
      findPublicJobCandidateBySlugMock,

    incrementPublicJobView:
      incrementPublicJobViewMock
  })
);

jest.unstable_mockModule(
  "../../utils/publicResponseSanitizer.js",
  () => ({
    sanitizePublicJobList:
      sanitizePublicJobListMock,

    sanitizePublicJobDetail:
      sanitizePublicJobDetailMock
  })
);

const AppError = (
  await import(
    "../../utils/AppError.js"
  )
).default;

const {
  normalizeSearch,
  normalizeOptionalFilter,
  normalizeSort,
  normalizePublicJobListQuery,
  getPublicJobs,
  normalizeSkills,
  normalizeOptionalNumber,
  normalizeOptionalDate
} = await import(
  "../../services/publicJob.service.js"
);

describe(
  "Public job service",
  () => {
    const now =
      new Date(
        "2026-08-04T10:00:00.000Z"
      );

    const repositoryJobs = [
      {
        id:
          "11111111-1111-4111-8111-111111111111",

        title:
          "Java Backend Developer"
      }
    ];

    const sanitizedJobs = [
      {
        id:
          "11111111-1111-4111-8111-111111111111",

        title:
          "Java Backend Developer",

        company: {
          id:
            "22222222-2222-4222-8222-222222222222",

          companyName:
            "CareerForge"
        }
      }
    ];

    beforeEach(() => {
      jest.clearAllMocks();

      findEligiblePublicJobsMock
        .mockResolvedValue(
          repositoryJobs
        );

      countEligiblePublicJobsMock
        .mockResolvedValue(
          1
        );

      sanitizePublicJobListMock
        .mockReturnValue(
          sanitizedJobs
        );
    });

    test(
      "normalizes default pagination",
      () => {
        expect(
          normalizePublicJobListQuery()
        ).toEqual({
          page: 1,
          limit: 10,
          offset: 0,
          search: "",
          sort: "latest",
          location: "",
          workMode: "",
          employmentType: "",
          experienceLevel: ""
        });
      }
    );

    test(
      "normalizes custom pagination",
      () => {
        expect(
          normalizePublicJobListQuery({
            page: "3",
            limit: "20"
          })
        ).toEqual({
          page: 3,
          limit: 20,
          offset: 40,
          search: "",
          sort: "latest",
          location: "",
          workMode: "",
          employmentType: "",
          experienceLevel: ""
        });
      }
    );

    test(
      "limits pagination to the approved maximum",
      () => {
        expect(
          normalizePublicJobListQuery({
            page: "1",
            limit: "500"
          })
        ).toEqual({
          page: 1,
          limit: 100,
          offset: 0,
          search: "",
          sort: "latest",
          location: "",
          workMode: "",
          employmentType: "",
          experienceLevel: ""
        });
      }
    );

    test(
      "fetches and sanitizes eligible public jobs",
      async () => {
        const result =
          await getPublicJobs({
            query: {
              page: 1,
              limit: 10
            },
            now
          });

        expect(
          findEligiblePublicJobsMock
        ).toHaveBeenCalledWith({
          limit: 10,
          offset: 0,
          sort: "latest",
          now,
          search: "",
          location: "",
          workMode: "",
          employmentType: "",
          experienceLevel: ""
        });

        expect(
          countEligiblePublicJobsMock
        ).toHaveBeenCalledWith({
          now,
          search: "",
          location: "",
          workMode: "",
          employmentType: "",
          experienceLevel: ""
        });

        expect(
          sanitizePublicJobListMock
        ).toHaveBeenCalledWith(
          repositoryJobs
        );

        expect(result).toEqual({
          jobs:
            sanitizedJobs,

          pagination: {
            page: 1,
            limit: 10,
            offset: 0,
            totalRecords: 1,
            totalPages: 1,
            hasPreviousPage:
              false,
            hasNextPage:
              false
          }
        });
      }
    );

    test(
      "returns correct metadata for a middle page",
      async () => {
        countEligiblePublicJobsMock
          .mockResolvedValue(
            50
          );

        const result =
          await getPublicJobs({
            query: {
              page: 3,
              limit: 10
            },
            now
          });

        expect(
          findEligiblePublicJobsMock
        ).toHaveBeenCalledWith({
          limit: 10,
          offset: 20,
          sort: "latest",
          now,
          search: "",
          location: "",
          workMode: "",
          employmentType: "",
          experienceLevel: ""
        });

        expect(
          result.pagination
        ).toEqual({
          page: 3,
          limit: 10,
          offset: 20,
          totalRecords: 50,
          totalPages: 5,
          hasPreviousPage:
            true,
          hasNextPage:
            true
        });
      }
    );

    test(
      "returns the existing empty-result pagination format",
      async () => {
        findEligiblePublicJobsMock
          .mockResolvedValue([]);

        countEligiblePublicJobsMock
          .mockResolvedValue(0);

        sanitizePublicJobListMock
          .mockReturnValue([]);

        const result =
          await getPublicJobs({
            query: {},
            now
          });

        expect(result).toEqual({
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
      }
    );

    test(
      "maps a repository list failure to a controlled service error",
      async () => {
        findEligiblePublicJobsMock
          .mockRejectedValue(
            new Error(
              "Database unavailable"
            )
          );

        await expect(
          getPublicJobs({
            query: {},
            now
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode: 500,
            code:
              "PUBLIC_JOBS_FETCH_FAILED",
            message:
              "Unable to fetch public jobs.",
            errors: []
          })
        );

        expect(
          sanitizePublicJobListMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "maps a repository count failure to a controlled service error",
      async () => {
        countEligiblePublicJobsMock
          .mockRejectedValue(
            new Error(
              "Count unavailable"
            )
          );

        await expect(
          getPublicJobs({
            query: {},
            now
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode: 500,
            code:
              "PUBLIC_JOBS_FETCH_FAILED",
            message:
              "Unable to fetch public jobs."
          })
        );
      }
    );

    test(
      "preserves an existing operational AppError",
      async () => {
        const operationalError =
          new AppError(
            "Existing controlled error.",
            503,
            "CONTROLLED_ERROR"
          );

        findEligiblePublicJobsMock
          .mockRejectedValue(
            operationalError
          );

        await expect(
          getPublicJobs({
            query: {},
            now
          })
        ).rejects.toBe(
          operationalError
        );
      }
    );

    test(
      "uses the current date by default",
      async () => {
        const before =
          Date.now();

        await getPublicJobs({
          query: {}
        });

        const after =
          Date.now();

        const suppliedNow =
          findEligiblePublicJobsMock
            .mock.calls[0][0]
            .now;

        expect(
          suppliedNow
        ).toBeInstanceOf(
          Date
        );

        expect(
          suppliedNow.getTime()
        ).toBeGreaterThanOrEqual(
          before
        );

        expect(
          suppliedNow.getTime()
        ).toBeLessThanOrEqual(
          after
        );
      }
    );

    test(
      "normalizes and trims search text",
      () => {
        expect(
          normalizeSearch(
            "  Java Developer  "
          )
        ).toBe(
          "Java Developer"
        );

        expect(
          normalizeSearch(
            undefined
          )
        ).toBe("");
      }
    );

    test(
      "includes normalized search in the list query",
      () => {
        expect(
          normalizePublicJobListQuery({
            page: "2",
            limit: "5",
            search:
              "  Spring Boot  "
          })
        ).toEqual({
          page: 2,
          limit: 5,
          offset: 5,
          search:
            "Spring Boot",
          sort: "latest",
          location: "",
          workMode: "",
          employmentType: "",
          experienceLevel: ""
        });
      }
    );

    test(
      "passes normalized search to list and count repositories",
      async () => {
        await getPublicJobs({
          query: {
            search:
              "  Java  "
          },
          now
        });

        expect(
          findEligiblePublicJobsMock
        ).toHaveBeenCalledWith({
          limit: 10,
          offset: 0,
          sort: "latest",
          now,
          search: "Java",
          location: "",
          workMode: "",
          employmentType: "",
          experienceLevel: ""
        });

        expect(
          countEligiblePublicJobsMock
        ).toHaveBeenCalledWith({
          now,
          search:
            "Java",
          location: "",
          workMode: "",
          employmentType: "",
          experienceLevel: ""
        });
      }
    );

    test(
      "returns an empty result for a search with no matches",
      async () => {
        findEligiblePublicJobsMock
          .mockResolvedValue([]);

        countEligiblePublicJobsMock
          .mockResolvedValue(0);

        sanitizePublicJobListMock
          .mockReturnValue([]);

        const result =
          await getPublicJobs({
            query: {
              search:
                "No Matching Role"
            },
            now
          });

        expect(result.jobs)
          .toEqual([]);

        expect(
          result.pagination
            .totalRecords
        ).toBe(0);
      }
    );

    test(
      "normalizes optional public-job filters",
      () => {
        expect(
          normalizeOptionalFilter(
            "  REMOTE  "
          )
        ).toBe(
          "REMOTE"
        );

        expect(
          normalizeOptionalFilter(
            undefined
          )
        ).toBe("");

        expect(
          normalizeOptionalFilter(
            123
          )
        ).toBe("");
      }
    );

    test(
      "normalizes all core filter query values",
      () => {
        expect(
          normalizePublicJobListQuery({
            page: "2",
            limit: "5",
            search: "  Java  ",
            sort: "latest",
            location: "  Hyderabad  ",
            workMode: "REMOTE",
            employmentType: "FULL_TIME",
            experienceLevel: "MID"
          })
        ).toEqual({
          page: 2,
          limit: 5,
          offset: 5,
          search: "Java",
          sort: "latest",
          location: "Hyderabad",
          workMode: "REMOTE",
          employmentType: "FULL_TIME",
          experienceLevel: "MID"
        });
      }
    );

    test(
      "passes all normalized core filters to list and count repositories",
      async () => {
        await getPublicJobs({
          query: {
            search:
              "  Java  ",
            location:
              "  Hyderabad  ",
            workMode:
              "HYBRID",
            employmentType:
              "FULL_TIME",
            experienceLevel:
              "JUNIOR"
          },
          now
        });

        expect(
          findEligiblePublicJobsMock
        ).toHaveBeenCalledWith({
          limit: 10,
          offset: 0,
          now,
          search:
            "Java",
          sort: "latest",
          location:
            "Hyderabad",
          workMode:
            "HYBRID",
          employmentType:
            "FULL_TIME",
          experienceLevel:
            "JUNIOR"
        });

        expect(
          countEligiblePublicJobsMock
        ).toHaveBeenCalledWith({
          now,
          search:
            "Java",
          location:
            "Hyderabad",
          workMode:
            "HYBRID",
          employmentType:
            "FULL_TIME",
          experienceLevel:
            "JUNIOR"
        });
      }
    );

    test(
      "passes a location filter to both repositories",
      async () => {
        await getPublicJobs({
          query: {
            location:
              "Pune"
          },
          now
        });

        expect(
          findEligiblePublicJobsMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            location:
              "Pune"
          })
        );

        expect(
          countEligiblePublicJobsMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            location:
              "Pune"
          })
        );
      }
    );

    test.each([
      [
        "workMode",
        "REMOTE"
      ],
      [
        "employmentType",
        "CONTRACT"
      ],
      [
        "experienceLevel",
        "SENIOR"
      ]
    ])(
      "passes %s filter to both repositories",
      async (
        field,
        value
      ) => {
        await getPublicJobs({
          query: {
            [field]:
              value
          },
          now
        });

        expect(
          findEligiblePublicJobsMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            [field]:
              value
          })
        );

        expect(
          countEligiblePublicJobsMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            [field]:
              value
          })
        );
      }
    );

    test(
      "returns standardized empty metadata for unmatched filters",
      async () => {
        findEligiblePublicJobsMock
          .mockResolvedValue([]);

        countEligiblePublicJobsMock
          .mockResolvedValue(0);

        sanitizePublicJobListMock
          .mockReturnValue([]);

        const result =
          await getPublicJobs({
            query: {
              location:
                "Nonexistent City",
              workMode:
                "REMOTE"
            },
            now
          });

        expect(
          result.jobs
        ).toEqual([]);

        expect(
          result.pagination
        ).toEqual({
          page: 1,
          limit: 10,
          offset: 0,
          totalRecords: 0,
          totalPages: 1,
          hasPreviousPage:
            false,
          hasNextPage:
            false
        });
      }
    );

    test(
      "normalizes skills without duplicates",
      () => {
        expect(
          normalizeSkills(
            " Java, Kafka, Java "
          )
        ).toEqual([
          "Java",
          "Kafka"
        ]);
      }
    );

    test(
      "normalizes optional numeric values",
      () => {
        expect(
          normalizeOptionalNumber(
            "500000"
          )
        ).toBe(500000);

        expect(
          normalizeOptionalNumber(
            ""
          )
        ).toBeNull();

        expect(
          normalizeOptionalNumber(
            "invalid"
          )
        ).toBeNull();
      }
    );

    test(
      "normalizes optional dates",
      () => {
        expect(
          normalizeOptionalDate(
            "2026-08-10"
          )
        ).toBeInstanceOf(
          Date
        );

        expect(
          normalizeOptionalDate(
            "invalid"
          )
        ).toBeNull();
      }
    );

    test(
      "normalizes every Step 7.3 filter",
      () => {
        const result =
          normalizePublicJobListQuery({
            page:
              "1",
            limit:
              "10",
            search:
              " Java ",
            sort: "latest",
            location:
              " Hyderabad ",
            workMode:
              "HYBRID",
            employmentType:
              "FULL_TIME",
            experienceLevel:
              "MID",
            skills:
              "Java, Kafka",
            minimumSalary:
              "500000",
            maximumSalary:
              "1200000",
            companyId:
              "11111111-1111-4111-8111-111111111111",
            publishedFrom:
              "2026-07-01",
            publishedTo:
              "2026-08-04",
            deadlineFrom:
              "2026-08-05",
            deadlineTo:
              "2026-09-01"
          });

        expect(result).toEqual(
          expect.objectContaining({
            page: 1,
            limit: 10,
            offset: 0,
            search: "Java",
            sort: "latest",
            location: "Hyderabad",
            workMode: "HYBRID",
            employmentType: "FULL_TIME",
            experienceLevel: "MID",
            skills: [
              "Java",
              "Kafka"
            ],
            minimumSalary: 500000,
            maximumSalary: 1200000,
            companyId:
              "11111111-1111-4111-8111-111111111111",
            publishedFrom:
              expect.any(Date),
            publishedTo:
              expect.any(Date),
            deadlineFrom:
              expect.any(Date),
            deadlineTo:
              expect.any(Date)
          })
        );
      }
    );

    test(
      "normalizes public sorting",
      () => {
        expect(
          normalizeSort()
        ).toBe(
          "latest"
        );

        expect(
          normalizeSort(
            "  deadlineSoon  "
          )
        ).toBe(
          "deadlineSoon"
        );
      }
    );

    test(
      "normalizes an explicit sort query",
      () => {
        expect(
          normalizePublicJobListQuery({
            sort:
              "titleAscending"
          })
        ).toEqual({
          page: 1,
          limit: 10,
          offset: 0,
          search: "",
          sort:
            "titleAscending",
          location: "",
          workMode: "",
          employmentType: "",
          experienceLevel: ""
        });
      }
    );

    test(
      "passes sort only to the list repository",
      async () => {
        await getPublicJobs({
          query: {
            sort:
              "salaryDescending"
          },
          now
        });

        expect(
          findEligiblePublicJobsMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            sort:
              "salaryDescending"
          })
        );

        expect(
          countEligiblePublicJobsMock
        ).toHaveBeenCalledWith(
          expect.not.objectContaining({
            sort:
              expect.anything()
          })
        );
      }
    );

    test(
      "passes relevance with normalized search",
      async () => {
        await getPublicJobs({
          query: {
            search:
              "  Java  ",

            sort:
              "relevance"
          },
          now
        });

        expect(
          findEligiblePublicJobsMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            search:
              "Java",

            sort:
              "relevance"
          })
        );
      }
    );

    test(
      "returns correct first-page pagination metadata",
      async () => {
        countEligiblePublicJobsMock
          .mockResolvedValue(25);

        const result =
          await getPublicJobs({
            query: {
              page: "1",
              limit: "10"
            },
            now
          });

        expect(
          findEligiblePublicJobsMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            limit: 10,
            offset: 0,
            sort: "latest"
          })
        );

        expect(
          result.pagination
        ).toEqual({
          page: 1,
          limit: 10,
          offset: 0,
          totalRecords: 25,
          totalPages: 3,
          hasPreviousPage: false,
          hasNextPage: true
        });
      }
    );

    test(
      "returns correct last-page pagination metadata",
      async () => {
        countEligiblePublicJobsMock
          .mockResolvedValue(25);

        const result =
          await getPublicJobs({
            query: {
              page: "3",
              limit: "10"
            },
            now
          });

        expect(
          findEligiblePublicJobsMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            limit: 10,
            offset: 20,
            sort: "latest"
          })
        );

        expect(
          result.pagination
        ).toEqual({
          page: 3,
          limit: 10,
          offset: 20,
          totalRecords: 25,
          totalPages: 3,
          hasPreviousPage: true,
          hasNextPage: false
        });
      }
    );

    test(
      "calculates pagination metadata for exact page division",
      async () => {
        countEligiblePublicJobsMock
          .mockResolvedValue(20);

        const result =
          await getPublicJobs({
            query: {
              page: "2",
              limit: "10"
            },
            now
          });

        expect(
          result.pagination
        ).toEqual({
          page: 2,
          limit: 10,
          offset: 10,
          totalRecords: 20,
          totalPages: 2,
          hasPreviousPage: true,
          hasNextPage: false
        });
      }
    );

    test(
      "returns one page when total records are fewer than limit",
      async () => {
        countEligiblePublicJobsMock
          .mockResolvedValue(4);

        const result =
          await getPublicJobs({
            query: {
              page: "1",
              limit: "10"
            },
            now
          });

        expect(
          result.pagination
        ).toEqual({
          page: 1,
          limit: 10,
          offset: 0,
          totalRecords: 4,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false
        });
      }
    );

    test(
      "passes pagination with search filters and sorting",
      async () => {
        countEligiblePublicJobsMock
          .mockResolvedValue(8);

        const result =
          await getPublicJobs({
            query: {
              page: "2",
              limit: "5",
              search: "  Java  ",
              workMode: "REMOTE",
              sort: "titleAscending"
            },
            now
          });

        expect(
          findEligiblePublicJobsMock
        ).toHaveBeenCalledWith({
          limit: 5,
          offset: 5,
          sort: "titleAscending",
          now,
          search: "Java",
          location: "",
          workMode: "REMOTE",
          employmentType: "",
          experienceLevel: ""
        });

        expect(
          countEligiblePublicJobsMock
        ).toHaveBeenCalledWith({
          now,
          search: "Java",
          location: "",
          workMode: "REMOTE",
          employmentType: "",
          experienceLevel: ""
        });

        expect(
          result.pagination
        ).toEqual({
          page: 2,
          limit: 5,
          offset: 5,
          totalRecords: 8,
          totalPages: 2,
          hasPreviousPage: true,
          hasNextPage: false
        });
      }
    );


  }
);