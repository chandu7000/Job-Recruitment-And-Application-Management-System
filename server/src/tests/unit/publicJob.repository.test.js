import {
  jest
} from "@jest/globals";

const findAllMock =
  jest.fn();

const countMock =
  jest.fn();

jest.unstable_mockModule(
  "../../models/job.model.js",
  () => ({
    default: {
      findAll:
        findAllMock,

      count:
        countMock
    }
  })
);

const {
  Op
} = await import(
  "sequelize"
);

const {
  PUBLIC_JOB_ATTRIBUTES,
  PUBLIC_COMPANY_SUMMARY_ATTRIBUTES,
  normalizePublicSearch,
  normalizeOptionalFilter,
  buildPublicJobWhere,
  buildPublicCompanyInclude,
  findEligiblePublicJobs,
  countEligiblePublicJobs,
  normalizeSkillsFilter,
  isDefinedNumber,
} = await import(
  "../../repositories/publicJob.repository.js"
);

describe(
  "Public job repository",
  () => {
    const now =
      new Date(
        "2026-08-04T10:00:00.000Z"
      );

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "defines only the required public job query attributes",
      () => {
        expect(
          PUBLIC_JOB_ATTRIBUTES
        ).toEqual([
          "id",
          "companyId",
          "title",
          "slug",
          "skills",
          "location",
          "workMode",
          "employmentType",
          "experienceLevel",
          "minimumExperience",
          "maximumExperience",
          "minimumSalary",
          "maximumSalary",
          "salaryCurrency",
          "vacancies",
          "applicationDeadline",
          "publishedAt",
          "viewCount"
        ]);

        expect(
          PUBLIC_JOB_ATTRIBUTES
        ).not.toContain(
          "createdBy"
        );

        expect(
          PUBLIC_JOB_ATTRIBUTES
        ).not.toContain(
          "removalReason"
        );

        expect(
          PUBLIC_JOB_ATTRIBUTES
        ).not.toContain(
          "deletedAt"
        );
      }
    );

    test(
      "defines only safe company summary query attributes",
      () => {
        expect(
          PUBLIC_COMPANY_SUMMARY_ATTRIBUTES
        ).toEqual([
          "id",
          "companyName",
          "slug",
          "industry",
          "companySize",
          "location",
          "city",
          "state",
          "country",
          "logoUrl",
          "status"
        ]);

        expect(
          PUBLIC_COMPANY_SUMMARY_ATTRIBUTES
        ).not.toContain(
          "ownerId"
        );

        expect(
          PUBLIC_COMPANY_SUMMARY_ATTRIBUTES
        ).not.toContain(
          "companyEmail"
        );

        expect(
          PUBLIC_COMPANY_SUMMARY_ATTRIBUTES
        ).not.toContain(
          "verificationReason"
        );
      }
    );

    test(
      "builds the eligible public job condition",
      () => {
        const where =
          buildPublicJobWhere({
            now
          });

        expect(
          where.status
        ).toBe(
          "PUBLISHED"
        );

        expect(
          where.applicationDeadline[
          Op.ne
          ]
        ).toBeNull();

        expect(
          where.applicationDeadline[
          Op.gte
          ]
        ).toBe(
          now
        );
      }
    );

    test(
      "builds a required verified-company include",
      () => {
        const include =
          buildPublicCompanyInclude();

        expect(include).toEqual(
          expect.objectContaining({
            association:
              "company",

            required:
              true,

            where: {
              status:
                "VERIFIED"
            }
          })
        );

        expect(
          include.attributes
        ).not.toContain(
          "ownerId"
        );

        expect(
          include.attributes
        ).not.toContain(
          "verificationReason"
        );
      }
    );

    test(
      "finds only eligible public jobs",
      async () => {
        const jobs = [
          {
            id:
              "11111111-1111-4111-8111-111111111111"
          }
        ];

        findAllMock
          .mockResolvedValue(
            jobs
          );

        const result =
          await findEligiblePublicJobs({
            limit: 5,
            offset: 10,
            now
          });

        expect(result).toBe(
          jobs
        );

        expect(
          findAllMock
        ).toHaveBeenCalledTimes(
          1
        );

        const options =
          findAllMock.mock
            .calls[0][0];

        expect(
          options.limit
        ).toBe(5);

        expect(
          options.offset
        ).toBe(10);

        expect(
          options.where.status
        ).toBe(
          "PUBLISHED"
        );

        expect(
          options.where
            .applicationDeadline[
          Op.gte
          ]
        ).toBe(
          now
        );

        expect(
          options.include[0]
            .where.status
        ).toBe(
          "VERIFIED"
        );

        expect(
          options.include[0]
            .required
        ).toBe(true);

        expect(
          options.paranoid
        ).toBe(true);

        expect(
          options.order
        ).toEqual([
          [
            "publishedAt",
            "DESC"
          ],
          [
            "id",
            "DESC"
          ]
        ]);
      }
    );

    test(
      "uses default list pagination values",
      async () => {
        findAllMock
          .mockResolvedValue([]);

        await findEligiblePublicJobs({
          now
        });

        const options =
          findAllMock.mock
            .calls[0][0];

        expect(
          options.limit
        ).toBe(10);

        expect(
          options.offset
        ).toBe(0);
      }
    );

    test(
      "passes transaction to the list query",
      async () => {
        const transaction = {
          id:
            "transaction"
        };

        findAllMock
          .mockResolvedValue([]);

        await findEligiblePublicJobs({
          now,
          transaction
        });

        expect(
          findAllMock.mock
            .calls[0][0]
            .transaction
        ).toBe(
          transaction
        );
      }
    );

    test(
      "propagates list query failures",
      async () => {
        const databaseError =
          new Error(
            "Database failure"
          );

        findAllMock
          .mockRejectedValue(
            databaseError
          );

        await expect(
          findEligiblePublicJobs({
            now
          })
        ).rejects.toBe(
          databaseError
        );
      }
    );

    test(
      "counts eligible public jobs",
      async () => {
        countMock
          .mockResolvedValue(7);

        const result =
          await countEligiblePublicJobs({
            now
          });

        expect(result).toBe(7);

        const options =
          countMock.mock
            .calls[0][0];

        expect(
          options.where.status
        ).toBe(
          "PUBLISHED"
        );

        expect(
          options.where
            .applicationDeadline[
          Op.gte
          ]
        ).toBe(
          now
        );

        expect(
          options.include[0]
            .where.status
        ).toBe(
          "VERIFIED"
        );

        expect(
          options.distinct
        ).toBe(true);

        expect(
          options.col
        ).toBe("id");

        expect(
          options.paranoid
        ).toBe(true);
      }
    );

    test(
      "passes transaction to the count query",
      async () => {
        const transaction = {
          id:
            "transaction"
        };

        countMock
          .mockResolvedValue(0);

        await countEligiblePublicJobs({
          now,
          transaction
        });

        expect(
          countMock.mock
            .calls[0][0]
            .transaction
        ).toBe(
          transaction
        );
      }
    );

    test(
      "propagates count query failures",
      async () => {
        const databaseError =
          new Error(
            "Count failed"
          );

        countMock
          .mockRejectedValue(
            databaseError
          );

        await expect(
          countEligiblePublicJobs({
            now
          })
        ).rejects.toBe(
          databaseError
        );
      }
    );

    test(
      "normalizes public search text",
      () => {
        expect(
          normalizePublicSearch(
            "  Java  "
          )
        ).toBe(
          "Java"
        );

        expect(
          normalizePublicSearch(
            null
          )
        ).toBe("");

        expect(
          normalizePublicSearch(
            123
          )
        ).toBe("");
      }
    );

    test(
      "does not add search conditions when search is empty",
      () => {
        const where =
          buildPublicJobWhere({
            now,
            search:
              "   "
          });

        expect(
          where[Op.or]
        ).toBeUndefined();
      }
    );

    test(
      "builds title, location, skills and company-name search conditions",
      () => {
        const where =
          buildPublicJobWhere({
            now,
            search:
              "  Java  "
          });

        expect(
          where[Op.or]
        ).toHaveLength(4);

        expect(
          where[Op.or][0]
            .title[Op.like]
        ).toBe(
          "%Java%"
        );

        expect(
          where[Op.or][1]
            .location[Op.like]
        ).toBe(
          "%Java%"
        );
      }
    );

    test(
      "passes search to the public list query",
      async () => {
        findAllMock
          .mockResolvedValue([]);

        await findEligiblePublicJobs({
          limit: 10,
          offset: 0,
          now,
          search:
            "Spring Boot"
        });

        const options =
          findAllMock.mock
            .calls[0][0];

        expect(
          options.where[Op.or]
        ).toHaveLength(4);

        expect(
          options.where[Op.or][0]
            .title[Op.like]
        ).toBe(
          "%Spring Boot%"
        );
      }
    );

    test(
      "passes search to the public count query",
      async () => {
        countMock
          .mockResolvedValue(0);

        await countEligiblePublicJobs({
          now,
          search:
            "Hyderabad"
        });

        const options =
          countMock.mock
            .calls[0][0];

        expect(
          options.where[Op.or]
        ).toHaveLength(4);

        expect(
          options.where[Op.or][1]
            .location[Op.like]
        ).toBe(
          "%Hyderabad%"
        );
      }
    );

    test(
      "normalizes optional filter values",
      () => {
        expect(
          normalizeOptionalFilter(
            "  Hyderabad  "
          )
        ).toBe(
          "Hyderabad"
        );

        expect(
          normalizeOptionalFilter(
            undefined
          )
        ).toBe("");

        expect(
          normalizeOptionalFilter(
            null
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
      "builds a partial location filter",
      () => {
        const where =
          buildPublicJobWhere({
            now,
            location:
              "  Hyderabad  "
          });

        expect(
          where.location[
          Op.like
          ]
        ).toBe(
          "%Hyderabad%"
        );
      }
    );

    test(
      "builds an exact work-mode filter",
      () => {
        const where =
          buildPublicJobWhere({
            now,
            workMode:
              "REMOTE"
          });

        expect(
          where.workMode
        ).toBe(
          "REMOTE"
        );
      }
    );

    test(
      "builds an exact employment-type filter",
      () => {
        const where =
          buildPublicJobWhere({
            now,
            employmentType:
              "CONTRACT"
          });

        expect(
          where.employmentType
        ).toBe(
          "CONTRACT"
        );
      }
    );

    test(
      "builds an exact experience-level filter",
      () => {
        const where =
          buildPublicJobWhere({
            now,
            experienceLevel:
              "SENIOR"
          });

        expect(
          where.experienceLevel
        ).toBe(
          "SENIOR"
        );
      }
    );

    test(
      "ignores empty core filters",
      () => {
        const where =
          buildPublicJobWhere({
            now,
            location:
              "   ",
            workMode:
              "",
            employmentType:
              undefined,
            experienceLevel:
              null
          });

        expect(
          where.location
        ).toBeUndefined();

        expect(
          where.workMode
        ).toBeUndefined();

        expect(
          where.employmentType
        ).toBeUndefined();

        expect(
          where.experienceLevel
        ).toBeUndefined();
      }
    );

    test(
      "builds combined search and core filter conditions",
      () => {
        const where =
          buildPublicJobWhere({
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
              "MID"
          });

        expect(
          where[Op.or]
        ).toHaveLength(4);

        expect(
          where.location[
          Op.like
          ]
        ).toBe(
          "%Hyderabad%"
        );

        expect(
          where.workMode
        ).toBe(
          "HYBRID"
        );

        expect(
          where.employmentType
        ).toBe(
          "FULL_TIME"
        );

        expect(
          where.experienceLevel
        ).toBe(
          "MID"
        );
      }
    );

    test(
      "passes all core filters to the public list query",
      async () => {
        findAllMock
          .mockResolvedValue([]);

        await findEligiblePublicJobs({
          limit: 5,
          offset: 10,
          now,
          search:
            "Java",
          location:
            "Hyderabad",
          workMode:
            "REMOTE",
          employmentType:
            "FULL_TIME",
          experienceLevel:
            "MID"
        });

        const options =
          findAllMock.mock
            .calls[0][0];

        expect(
          options.where[Op.or]
        ).toHaveLength(4);

        expect(
          options.where.location[
          Op.like
          ]
        ).toBe(
          "%Hyderabad%"
        );

        expect(
          options.where.workMode
        ).toBe(
          "REMOTE"
        );

        expect(
          options.where.employmentType
        ).toBe(
          "FULL_TIME"
        );

        expect(
          options.where.experienceLevel
        ).toBe(
          "MID"
        );
      }
    );

    test(
      "passes all core filters to the public count query",
      async () => {
        countMock
          .mockResolvedValue(0);

        await countEligiblePublicJobs({
          now,
          search:
            "Java",
          location:
            "Hyderabad",
          workMode:
            "HYBRID",
          employmentType:
            "CONTRACT",
          experienceLevel:
            "SENIOR"
        });

        const options =
          countMock.mock
            .calls[0][0];

        expect(
          options.where[Op.or]
        ).toHaveLength(4);

        expect(
          options.where.location[
          Op.like
          ]
        ).toBe(
          "%Hyderabad%"
        );

        expect(
          options.where.workMode
        ).toBe(
          "HYBRID"
        );

        expect(
          options.where.employmentType
        ).toBe(
          "CONTRACT"
        );

        expect(
          options.where.experienceLevel
        ).toBe(
          "SENIOR"
        );
      }
    );

    test(
      "normalizes comma-separated skills",
      () => {
        expect(
          normalizeSkillsFilter(
            " Java, Spring Boot, Java "
          )
        ).toEqual([
          "Java",
          "Spring Boot"
        ]);
      }
    );

    test(
      "builds an all-skills filter",
      () => {
        const where =
          buildPublicJobWhere({
            now,
            skills: [
              "Java",
              "Kafka"
            ]
          });

        expect(
          where[Op.and]
        ).toHaveLength(2);
      }
    );

    test(
      "builds minimum salary overlap condition",
      () => {
        const where =
          buildPublicJobWhere({
            now,
            minimumSalary:
              600000
          });

        expect(
          where.maximumSalary[
          Op.gte
          ]
        ).toBe(600000);
      }
    );

    test(
      "builds maximum salary overlap condition",
      () => {
        const where =
          buildPublicJobWhere({
            now,
            maximumSalary:
              900000
          });

        expect(
          where.minimumSalary[
          Op.lte
          ]
        ).toBe(900000);
      }
    );

    test(
      "builds complete salary overlap conditions",
      () => {
        const where =
          buildPublicJobWhere({
            now,
            minimumSalary:
              500000,
            maximumSalary:
              1000000
          });

        expect(
          where.maximumSalary[
          Op.gte
          ]
        ).toBe(500000);

        expect(
          where.minimumSalary[
          Op.lte
          ]
        ).toBe(1000000);
      }
    );

    test(
      "builds an exact company filter",
      () => {
        const companyId =
          "11111111-1111-4111-8111-111111111111";

        const where =
          buildPublicJobWhere({
            now,
            companyId
          });

        expect(
          where.companyId
        ).toBe(companyId);
      }
    );

    test(
      "builds a publication-date range",
      () => {
        const publishedFrom =
          new Date(
            "2026-07-01T00:00:00.000Z"
          );

        const publishedTo =
          new Date(
            "2026-08-01T00:00:00.000Z"
          );

        const where =
          buildPublicJobWhere({
            now,
            publishedFrom,
            publishedTo
          });

        expect(
          where.publishedAt[
          Op.gte
          ]
        ).toBe(
          publishedFrom
        );

        expect(
          where.publishedAt[
          Op.lte
          ]
        ).toBe(
          publishedTo
        );
      }
    );

    test(
      "builds a deadline-date range",
      () => {
        const deadlineFrom =
          new Date(
            "2026-08-10T00:00:00.000Z"
          );

        const deadlineTo =
          new Date(
            "2026-09-01T00:00:00.000Z"
          );

        const where =
          buildPublicJobWhere({
            now,
            deadlineFrom,
            deadlineTo
          });

        expect(
          where.applicationDeadline[
          Op.gte
          ]
        ).toBe(
          deadlineFrom
        );

        expect(
          where.applicationDeadline[
          Op.lte
          ]
        ).toBe(
          deadlineTo
        );
      }
    );

    test(
      "supports every filter together",
      () => {
        const where =
          buildPublicJobWhere({
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
              "MID",
            skills: [
              "Java",
              "Kafka"
            ],
            minimumSalary:
              500000,
            maximumSalary:
              1200000,
            companyId:
              "11111111-1111-4111-8111-111111111111",
            publishedFrom:
              new Date(
                "2026-07-01"
              ),
            publishedTo:
              new Date(
                "2026-08-04"
              ),
            deadlineFrom:
              new Date(
                "2026-08-05"
              ),
            deadlineTo:
              new Date(
                "2026-09-01"
              )
          });

        expect(
          where[Op.or]
        ).toHaveLength(4);

        expect(
          where[Op.and]
        ).toHaveLength(2);

        expect(
          where.companyId
        ).toBeDefined();

        expect(
          where.publishedAt
        ).toBeDefined();

        expect(
          where.applicationDeadline
        ).toBeDefined();
      }
    );

    test(
      "detects valid defined numeric values",
      () => {
        expect(
          isDefinedNumber(0)
        ).toBe(true);

        expect(
          isDefinedNumber(500000)
        ).toBe(true);

        expect(
          isDefinedNumber("500000")
        ).toBe(true);

        expect(
          isDefinedNumber("")
        ).toBe(false);

        expect(
          isDefinedNumber(null)
        ).toBe(false);

        expect(
          isDefinedNumber(undefined)
        ).toBe(false);

        expect(
          isDefinedNumber("invalid")
        ).toBe(false);
      }
    );
  }
);