import {
  jest
} from "@jest/globals";

const findAllMock =
  jest.fn();

jest.unstable_mockModule(
  "../../models/job.model.js",
  () => ({
    default: {
      findAll:
        findAllMock,

      findByPk:
        jest.fn(),

      findOne:
        jest.fn(),

      count:
        jest.fn(),

      increment:
        jest.fn()
    }
  })
);

const {
  Op
} = await import(
  "sequelize"
);

const {
  normalizeSimilarJob,
  buildSimilarJobConditions,
  buildSimilarJobWhere,
  buildSimilarJobScoreExpression,
  findSimilarPublicJobs
} = await import(
  "../../repositories/publicJob.repository.js"
);

describe(
  "Public similar-job repository",
  () => {
    const now =
      new Date(
        "2026-08-05T10:00:00.000Z"
      );

    const currentJob = {
      id:
        "11111111-1111-4111-8111-111111111111",

      skills: [
        "Java",
        "Spring Boot"
      ],

      location:
        "Hyderabad",

      workMode:
        "HYBRID",

      employmentType:
        "FULL_TIME",

      experienceLevel:
        "JUNIOR",

      minimumSalary:
        "400000.00",

      maximumSalary:
        "800000.00"
    };

    beforeEach(() => {
      jest.clearAllMocks();

      findAllMock
        .mockResolvedValue([]);
    });

    test(
      "normalizes the current job",
      () => {
        expect(
          normalizeSimilarJob(
            currentJob
          )
        ).toEqual({
          id:
            currentJob.id,

          skills: [
            "Java",
            "Spring Boot"
          ],

          location:
            "Hyderabad",

          workMode:
            "HYBRID",

          employmentType:
            "FULL_TIME",

          experienceLevel:
            "JUNIOR",

          minimumSalary:
            400000,

          maximumSalary:
            800000
        });
      }
    );

    test(
      "builds transparent matching conditions",
      () => {
        const conditions =
          buildSimilarJobConditions(
            currentJob
          );

        expect(
          conditions.length
        ).toBeGreaterThanOrEqual(
          6
        );

        expect(
          conditions
        ).toEqual(
          expect.arrayContaining([
            {
              experienceLevel:
                "JUNIOR"
            },

            {
              employmentType:
                "FULL_TIME"
            },

            {
              workMode:
                "HYBRID"
            }
          ])
        );
      }
    );

    test(
      "excludes the current job",
      () => {
        const where =
          buildSimilarJobWhere({
            currentJob,
            now
          });

        expect(
          where.status
        ).toBe(
          "PUBLISHED"
        );

        expect(
          where.applicationDeadline[
            Op.gte
          ]
        ).toBe(now);

        expect(
          where[Op.and]
        ).toEqual(
          expect.arrayContaining([
            {
              id: {
                [Op.ne]:
                  currentJob.id
              }
            }
          ])
        );
      }
    );

    test(
      "builds deterministic similarity scoring",
      () => {
        expect(
          buildSimilarJobScoreExpression(
            currentJob
          )
        ).toBeDefined();
      }
    );

    test(
      "finds only eligible similar public jobs",
      async () => {
        await findSimilarPublicJobs({
          currentJob,
          now,
          limit:
            5
        });

        const options =
          findAllMock.mock
            .calls[0][0];

        expect(
          options.limit
        ).toBe(5);

        expect(
          options.paranoid
        ).toBe(true);

        expect(
          options.where.status
        ).toBe(
          "PUBLISHED"
        );

        expect(
          options.include[0]
            .where.status
        ).toBe(
          "VERIFIED"
        );

        expect(
          options.order
        ).toHaveLength(3);
      }
    );

    test(
      "caps repository limit at ten",
      async () => {
        await findSimilarPublicJobs({
          currentJob,
          now,
          limit:
            100
        });

        expect(
          findAllMock.mock
            .calls[0][0]
            .limit
        ).toBe(10);
      }
    );

    test(
      "propagates repository failures",
      async () => {
        const error =
          new Error(
            "Database unavailable"
          );

        findAllMock
          .mockRejectedValue(
            error
          );

        await expect(
          findSimilarPublicJobs({
            currentJob,
            now
          })
        ).rejects.toBe(
          error
        );
      }
    );
  }
);