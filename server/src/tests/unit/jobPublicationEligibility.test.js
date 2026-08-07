import {
  COMPANY_STATUSES
} from "../../constants/company.constants.js";

import {
  JOB_STATUSES,
  JOB_WORK_MODES
} from "../../constants/job.constants.js";

import {
  PUBLICATION_REQUIRED_FIELDS,
  collectJobPublicationIssues,
  validateJobPublicationEligibility
} from "../../utils/jobPublicationEligibility.js";

describe(
  "Job publication eligibility",
  () => {
    const now =
      new Date(
        "2026-08-03T10:00:00.000Z"
      );

    const verifiedCompany = {
      id:
        "11111111-1111-4111-8111-111111111111",

      status:
        COMPANY_STATUSES.VERIFIED
    };

    const createCompleteJob =
      (
        overrides = {}
      ) => ({
        id:
          "22222222-2222-4222-8222-222222222222",

        companyId:
          verifiedCompany.id,

        createdBy:
          "33333333-3333-4333-8333-333333333333",

        title:
          "Backend Developer",

        description:
          "Build and maintain backend services.",

        requirements:
          "Strong JavaScript and database knowledge.",

        location:
          "Hyderabad",

        workMode:
          JOB_WORK_MODES.HYBRID,

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

        salaryCurrency:
          "INR",

        vacancies:
          2,

        applicationDeadline:
          new Date(
            "2026-09-03T10:00:00.000Z"
          ),

        status:
          JOB_STATUSES.DRAFT,

        ...overrides
      });

    test(
      "contains the approved publication-required fields",
      () => {
        expect(
          PUBLICATION_REQUIRED_FIELDS
        ).toEqual([
          "companyId",
          "title",
          "description",
          "requirements",
          "workMode",
          "employmentType",
          "experienceLevel",
          "vacancies",
          "applicationDeadline"
        ]);
      }
    );

    test(
      "allows a complete draft belonging to a verified company",
      () => {
        expect(
          validateJobPublicationEligibility(
            createCompleteJob(),
            verifiedCompany,
            {
              now
            }
          )
        ).toBe(true);
      }
    );

    test(
      "allows a REMOTE job without a location",
      () => {
        const job =
          createCompleteJob({
            workMode:
              JOB_WORK_MODES.REMOTE,

            location:
              null
          });

        expect(
          validateJobPublicationEligibility(
            job,
            verifiedCompany,
            {
              now
            }
          )
        ).toBe(true);
      }
    );

    test(
      "rejects a non-verified company",
      () => {
        const company = {
          ...verifiedCompany,

          status:
            COMPANY_STATUSES
              .PENDING_VERIFICATION
        };

        expect(() =>
          validateJobPublicationEligibility(
            createCompleteJob(),
            company,
            {
              now
            }
          )
        ).toThrow(
          expect.objectContaining({
            statusCode: 409,
            code:
              "COMPANY_NOT_VERIFIED"
          })
        );
      }
    );

    test.each([
      [
        "title",
        null
      ],
      [
        "description",
        "   "
      ],
      [
        "requirements",
        undefined
      ],
      [
        "workMode",
        null
      ],
      [
        "employmentType",
        ""
      ],
      [
        "experienceLevel",
        null
      ],
      [
        "applicationDeadline",
        null
      ]
    ])(
      "rejects a missing required field: %s",
      (
        field,
        value
      ) => {
        const job =
          createCompleteJob({
            [field]:
              value
          });

        expect(() =>
          validateJobPublicationEligibility(
            job,
            verifiedCompany,
            {
              now
            }
          )
        ).toThrow(
          expect.objectContaining({
            statusCode: 409,
            code:
              "JOB_NOT_READY_FOR_PUBLICATION",
            errors:
              expect.arrayContaining([
                expect.objectContaining({
                  field
                })
              ])
          })
        );
      }
    );

    test(
      "rejects a non-draft job",
      () => {
        const job =
          createCompleteJob({
            status:
              JOB_STATUSES.PUBLISHED
          });

        expect(() =>
          validateJobPublicationEligibility(
            job,
            verifiedCompany,
            {
              now
            }
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "JOB_NOT_READY_FOR_PUBLICATION",
            errors:
              expect.arrayContaining([
                expect.objectContaining({
                  field:
                    "status"
                })
              ])
          })
        );
      }
    );

    test(
      "requires a location for an ONSITE job",
      () => {
        const job =
          createCompleteJob({
            workMode:
              JOB_WORK_MODES.ONSITE,

            location:
              null
          });

        expect(() =>
          validateJobPublicationEligibility(
            job,
            verifiedCompany,
            {
              now
            }
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "JOB_NOT_READY_FOR_PUBLICATION",
            errors:
              expect.arrayContaining([
                expect.objectContaining({
                  field:
                    "location"
                })
              ])
          })
        );
      }
    );

    test(
      "requires a location for a HYBRID job",
      () => {
        const job =
          createCompleteJob({
            workMode:
              JOB_WORK_MODES.HYBRID,

            location:
              "   "
          });

        expect(() =>
          validateJobPublicationEligibility(
            job,
            verifiedCompany,
            {
              now
            }
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "JOB_NOT_READY_FOR_PUBLICATION",
            errors:
              expect.arrayContaining([
                expect.objectContaining({
                  field:
                    "location"
                })
              ])
          })
        );
      }
    );

    test.each([
      0,
      -1,
      1.5,
      "invalid"
    ])(
      "rejects invalid vacancies: %s",
      (
        vacancies
      ) => {
        const job =
          createCompleteJob({
            vacancies
          });

        expect(() =>
          validateJobPublicationEligibility(
            job,
            verifiedCompany,
            {
              now
            }
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "JOB_NOT_READY_FOR_PUBLICATION",
            errors:
              expect.arrayContaining([
                expect.objectContaining({
                  field:
                    "vacancies"
                })
              ])
          })
        );
      }
    );

    test(
      "rejects an expired deadline",
      () => {
        const job =
          createCompleteJob({
            applicationDeadline:
              new Date(
                "2026-08-03T09:59:59.000Z"
              )
          });

        expect(() =>
          validateJobPublicationEligibility(
            job,
            verifiedCompany,
            {
              now
            }
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "JOB_NOT_READY_FOR_PUBLICATION",
            errors:
              expect.arrayContaining([
                expect.objectContaining({
                  field:
                    "applicationDeadline"
                })
              ])
          })
        );
      }
    );

    test(
      "rejects an invalid deadline",
      () => {
        const job =
          createCompleteJob({
            applicationDeadline:
              "invalid-date"
          });

        expect(() =>
          validateJobPublicationEligibility(
            job,
            verifiedCompany,
            {
              now
            }
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "JOB_NOT_READY_FOR_PUBLICATION",
            errors:
              expect.arrayContaining([
                expect.objectContaining({
                  field:
                    "applicationDeadline"
                })
              ])
          })
        );
      }
    );

    test(
      "allows salary fields to be omitted",
      () => {
        const job =
          createCompleteJob({
            minimumSalary:
              null,

            maximumSalary:
              null
          });

        expect(
          validateJobPublicationEligibility(
            job,
            verifiedCompany,
            {
              now
            }
          )
        ).toBe(true);
      }
    );

    test(
      "rejects an incomplete salary range",
      () => {
        const job =
          createCompleteJob({
            minimumSalary:
              400000,

            maximumSalary:
              null
          });

        expect(() =>
          validateJobPublicationEligibility(
            job,
            verifiedCompany,
            {
              now
            }
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "JOB_NOT_READY_FOR_PUBLICATION",
            errors:
              expect.arrayContaining([
                expect.objectContaining({
                  field:
                    "maximumSalary"
                })
              ])
          })
        );
      }
    );

    test(
      "rejects an inverted salary range",
      () => {
        const job =
          createCompleteJob({
            minimumSalary:
              900000,

            maximumSalary:
              500000
          });

        expect(() =>
          validateJobPublicationEligibility(
            job,
            verifiedCompany,
            {
              now
            }
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "JOB_NOT_READY_FOR_PUBLICATION",
            errors:
              expect.arrayContaining([
                expect.objectContaining({
                  field:
                    "minimumSalary"
                })
              ])
          })
        );
      }
    );

    test(
      "allows experience fields to be omitted",
      () => {
        const job =
          createCompleteJob({
            minimumExperience:
              null,

            maximumExperience:
              null
          });

        expect(
          validateJobPublicationEligibility(
            job,
            verifiedCompany,
            {
              now
            }
          )
        ).toBe(true);
      }
    );

    test(
      "rejects an incomplete experience range",
      () => {
        const job =
          createCompleteJob({
            minimumExperience:
              1,

            maximumExperience:
              null
          });

        expect(() =>
          validateJobPublicationEligibility(
            job,
            verifiedCompany,
            {
              now
            }
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "JOB_NOT_READY_FOR_PUBLICATION",
            errors:
              expect.arrayContaining([
                expect.objectContaining({
                  field:
                    "maximumExperience"
                })
              ])
          })
        );
      }
    );

    test(
      "rejects an inverted experience range",
      () => {
        const job =
          createCompleteJob({
            minimumExperience:
              5,

            maximumExperience:
              2
          });

        expect(() =>
          validateJobPublicationEligibility(
            job,
            verifiedCompany,
            {
              now
            }
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "JOB_NOT_READY_FOR_PUBLICATION",
            errors:
              expect.arrayContaining([
                expect.objectContaining({
                  field:
                    "minimumExperience"
                })
              ])
          })
        );
      }
    );

    test(
      "returns all detected issues from the collector",
      () => {
        const issues =
          collectJobPublicationIssues(
            createCompleteJob({
              title:
                null,

              description:
                null,

              location:
                null,

              vacancies:
                0,

              applicationDeadline:
                new Date(
                  "2020-01-01T00:00:00.000Z"
                )
            }),
            {
              now
            }
          );

        expect(
          issues
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field:
                "title"
            }),

            expect.objectContaining({
              field:
                "description"
            }),

            expect.objectContaining({
              field:
                "location"
            }),

            expect.objectContaining({
              field:
                "vacancies"
            }),

            expect.objectContaining({
              field:
                "applicationDeadline"
            })
          ])
        );
      }
    );

    test(
      "supports Sequelize-style model getters",
      () => {
        const values =
          createCompleteJob();

        const sequelizeJob = {
          get(field) {
            return values[field];
          }
        };

        expect(
          validateJobPublicationEligibility(
            sequelizeJob,
            verifiedCompany,
            {
              now
            }
          )
        ).toBe(true);
      }
    );
  }
);