import {
  jest
} from "@jest/globals";

const validateCompanyJobEligibilityMock =
  jest.fn();

jest.unstable_mockModule(
  "../../utils/companyJobEligibility.js",
  () => ({
    default:
      validateCompanyJobEligibilityMock
  })
);

const {
  APPLICATION_ELIGIBILITY_ERROR_CODES,
  getEntityValue,
  parseApplicationDeadline,
  isJobExpired,
  collectJobApplicationIssues,
  validateJobApplicationEligibility
} = await import(
  "../../utils/jobApplicationEligibility.js"
);

describe(
  "Job application eligibility",
  () => {
    const now =
      new Date(
        "2026-08-03T10:00:00.000Z"
      );

    const futureDeadline =
      new Date(
        "2026-08-04T10:00:00.000Z"
      );

    const expiredDeadline =
      new Date(
        "2026-08-02T10:00:00.000Z"
      );

    const company = {
      id:
        "11111111-1111-4111-8111-111111111111",

      status:
        "VERIFIED"
    };

    const createPublishedJob =
      (
        overrides = {}
      ) => ({
        id:
          "22222222-2222-4222-8222-222222222222",

        status:
          "PUBLISHED",

        applicationDeadline:
          futureDeadline,

        ...overrides
      });

    beforeEach(() => {
      jest.clearAllMocks();

      validateCompanyJobEligibilityMock
        .mockReturnValue(true);
    });

    describe(
      "constants",
      () => {
        test(
          "contains all approved application eligibility error codes",
          () => {
            expect(
              APPLICATION_ELIGIBILITY_ERROR_CODES
            ).toEqual({
              JOB_REQUIRED:
                "JOB_REQUIRED",

              JOB_NOT_PUBLISHED:
                "JOB_NOT_PUBLISHED",

              JOB_APPLICATION_DEADLINE_MISSING:
                "JOB_APPLICATION_DEADLINE_MISSING",

              JOB_APPLICATION_DEADLINE_INVALID:
                "JOB_APPLICATION_DEADLINE_INVALID",

              JOB_APPLICATION_DEADLINE_EXPIRED:
                "JOB_APPLICATION_DEADLINE_EXPIRED"
            });
          }
        );
      }
    );

    describe(
      "getEntityValue",
      () => {
        test(
          "reads a plain object property",
          () => {
            expect(
              getEntityValue(
                {
                  status:
                    "PUBLISHED"
                },
                "status"
              )
            ).toBe(
              "PUBLISHED"
            );
          }
        );

        test(
          "reads a Sequelize-like model value using get",
          () => {
            const entity = {
              get:
                jest.fn(
                  () =>
                    "PUBLISHED"
                )
            };

            expect(
              getEntityValue(
                entity,
                "status"
              )
            ).toBe(
              "PUBLISHED"
            );

            expect(
              entity.get
            ).toHaveBeenCalledWith(
              "status"
            );
          }
        );

        test(
          "returns undefined for a missing entity",
          () => {
            expect(
              getEntityValue(
                null,
                "status"
              )
            ).toBeUndefined();
          }
        );
      }
    );

    describe(
      "parseApplicationDeadline",
      () => {
        test(
          "returns the same Date instance",
          () => {
            const deadline =
              new Date(
                "2026-08-04T10:00:00.000Z"
              );

            expect(
              parseApplicationDeadline(
                deadline
              )
            ).toBe(
              deadline
            );
          }
        );

        test(
          "parses an ISO date string",
          () => {
            expect(
              parseApplicationDeadline(
                "2026-08-04T10:00:00.000Z"
              ).toISOString()
            ).toBe(
              "2026-08-04T10:00:00.000Z"
            );
          }
        );

        test(
          "returns an invalid Date for an invalid value",
          () => {
            expect(
              Number.isNaN(
                parseApplicationDeadline(
                  "not-a-date"
                ).getTime()
              )
            ).toBe(true);
          }
        );
      }
    );

    describe(
      "isJobExpired",
      () => {
        test(
          "returns true when the deadline is before now",
          () => {
            expect(
              isJobExpired(
                createPublishedJob({
                  applicationDeadline:
                    expiredDeadline
                }),
                {
                  now
                }
              )
            ).toBe(true);
          }
        );

        test(
          "returns false when the deadline is after now",
          () => {
            expect(
              isJobExpired(
                createPublishedJob(),
                {
                  now
                }
              )
            ).toBe(false);
          }
        );

        test(
          "returns false when the deadline equals now",
          () => {
            expect(
              isJobExpired(
                createPublishedJob({
                  applicationDeadline:
                    now
                }),
                {
                  now
                }
              )
            ).toBe(false);
          }
        );

        test(
          "returns false for a missing job",
          () => {
            expect(
              isJobExpired(
                null,
                {
                  now
                }
              )
            ).toBe(false);
          }
        );

        test.each([
          null,
          undefined
        ])(
          "returns false for missing deadline %p",
          (
            applicationDeadline
          ) => {
            expect(
              isJobExpired(
                createPublishedJob({
                  applicationDeadline
                }),
                {
                  now
                }
              )
            ).toBe(false);
          }
        );

        test(
          "returns false for an invalid deadline",
          () => {
            expect(
              isJobExpired(
                createPublishedJob({
                  applicationDeadline:
                    "invalid-date"
                }),
                {
                  now
                }
              )
            ).toBe(false);
          }
        );

        test(
          "supports Sequelize-like job models",
          () => {
            const job = {
              get:
                jest.fn(
                  (
                    field
                  ) => {
                    if (
                      field ===
                      "applicationDeadline"
                    ) {
                      return expiredDeadline;
                    }

                    return undefined;
                  }
                )
            };

            expect(
              isJobExpired(
                job,
                {
                  now
                }
              )
            ).toBe(true);
          }
        );
      }
    );

    describe(
      "collectJobApplicationIssues",
      () => {
        test(
          "returns no issues for an eligible published job",
          () => {
            expect(
              collectJobApplicationIssues(
                createPublishedJob(),
                company,
                {
                  now
                }
              )
            ).toEqual([]);

            expect(
              validateCompanyJobEligibilityMock
            ).toHaveBeenCalledWith(
              company
            );
          }
        );

        test(
          "returns JOB_REQUIRED when the job is missing",
          () => {
            expect(
              collectJobApplicationIssues(
                null,
                company,
                {
                  now
                }
              )
            ).toEqual([
              {
                field:
                  "job",

                code:
                  "JOB_REQUIRED",

                message:
                  "Job is required for application eligibility validation.",

                value:
                  null
              }
            ]);

            expect(
              validateCompanyJobEligibilityMock
            ).not.toHaveBeenCalled();
          }
        );

        test.each([
          "DRAFT",
          "CLOSED",
          "REMOVED",
          null,
          undefined
        ])(
          "returns JOB_NOT_PUBLISHED for status %p",
          (
            status
          ) => {
            const issues =
              collectJobApplicationIssues(
                createPublishedJob({
                  status
                }),
                company,
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
                    "status",

                  code:
                    "JOB_NOT_PUBLISHED",

                  value:
                    status ??
                    null,

                  requiredValue:
                    "PUBLISHED"
                })
              ])
            );
          }
        );

        test.each([
          null,
          undefined
        ])(
          "returns deadline missing issue for %p",
          (
            applicationDeadline
          ) => {
            const issues =
              collectJobApplicationIssues(
                createPublishedJob({
                  applicationDeadline
                }),
                company,
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
                    "applicationDeadline",

                  code:
                    "JOB_APPLICATION_DEADLINE_MISSING",

                  value:
                    null
                })
              ])
            );
          }
        );

        test(
          "returns deadline invalid issue",
          () => {
            const issues =
              collectJobApplicationIssues(
                createPublishedJob({
                  applicationDeadline:
                    "invalid-date"
                }),
                company,
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
                    "applicationDeadline",

                  code:
                    "JOB_APPLICATION_DEADLINE_INVALID",

                  value:
                    "invalid-date"
                })
              ])
            );
          }
        );

        test(
          "returns deadline expired issue",
          () => {
            const issues =
              collectJobApplicationIssues(
                createPublishedJob({
                  applicationDeadline:
                    expiredDeadline
                }),
                company,
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
                    "applicationDeadline",

                  code:
                    "JOB_APPLICATION_DEADLINE_EXPIRED",

                  value:
                    expiredDeadline,

                  currentTime:
                    now
                })
              ])
            );
          }
        );

        test(
          "does not treat a deadline equal to now as expired",
          () => {
            const issues =
              collectJobApplicationIssues(
                createPublishedJob({
                  applicationDeadline:
                    now
                }),
                company,
                {
                  now
                }
              );

            expect(
              issues
            ).toEqual([]);
          }
        );

        test(
          "converts company eligibility errors into safe issues",
          () => {
            validateCompanyJobEligibilityMock
              .mockImplementation(
                () => {
                  throw Object.assign(
                    new Error(
                      "Company is not verified."
                    ),
                    {
                      code:
                        "COMPANY_NOT_VERIFIED"
                    }
                  );
                }
              );

            const issues =
              collectJobApplicationIssues(
                createPublishedJob(),
                {
                  ...company,

                  status:
                    "DRAFT"
                },
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
                    "company",

                  code:
                    "COMPANY_NOT_VERIFIED",

                  message:
                    "Company is not verified.",

                  value:
                    "DRAFT"
                })
              ])
            );
          }
        );

        test(
          "uses COMPANY_NOT_ELIGIBLE when company error has no code",
          () => {
            validateCompanyJobEligibilityMock
              .mockImplementation(
                () => {
                  throw new Error(
                    "Company is not eligible."
                  );
                }
              );

            const issues =
              collectJobApplicationIssues(
                createPublishedJob(),
                company,
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
                    "company",

                  code:
                    "COMPANY_NOT_ELIGIBLE",

                  message:
                    "Company is not eligible."
                })
              ])
            );
          }
        );

        test(
          "collects multiple issues together",
          () => {
            validateCompanyJobEligibilityMock
              .mockImplementation(
                () => {
                  throw Object.assign(
                    new Error(
                      "Company is not verified."
                    ),
                    {
                      code:
                        "COMPANY_NOT_VERIFIED"
                    }
                  );
                }
              );

            const issues =
              collectJobApplicationIssues(
                {
                  status:
                    "DRAFT",

                  applicationDeadline:
                    expiredDeadline
                },
                {
                  status:
                    "DRAFT"
                },
                {
                  now
                }
              );

            expect(
              issues
            ).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  code:
                    "JOB_NOT_PUBLISHED"
                }),

                expect.objectContaining({
                  code:
                    "JOB_APPLICATION_DEADLINE_EXPIRED"
                }),

                expect.objectContaining({
                  code:
                    "COMPANY_NOT_VERIFIED"
                })
              ])
            );

            expect(
              issues
            ).toHaveLength(3);
          }
        );
      }
    );

    describe(
      "validateJobApplicationEligibility",
      () => {
        test(
          "returns true for an eligible job and company",
          () => {
            expect(
              validateJobApplicationEligibility(
                createPublishedJob(),
                company,
                {
                  now
                }
              )
            ).toBe(true);
          }
        );

        test(
          "throws COMPANY_NOT_FOUND when company is missing",
          () => {
            expect(() =>
              validateJobApplicationEligibility(
                createPublishedJob(),
                null,
                {
                  now
                }
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  404,

                code:
                  "COMPANY_NOT_FOUND",

                message:
                  "Company not found."
              })
            );
          }
        );

        test(
          "throws JOB_APPLICATION_NOT_ALLOWED for an ineligible job",
          () => {
            expect(() =>
              validateJobApplicationEligibility(
                createPublishedJob({
                  status:
                    "CLOSED"
                }),
                company,
                {
                  now
                }
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  409,

                code:
                  "JOB_APPLICATION_NOT_ALLOWED",

                message:
                  "Job is not accepting applications.",

                errors:
                  expect.arrayContaining([
                    expect.objectContaining({
                      code:
                        "JOB_NOT_PUBLISHED"
                    })
                  ])
              })
            );
          }
        );

        test(
          "throws JOB_APPLICATION_NOT_ALLOWED for an expired job",
          () => {
            expect(() =>
              validateJobApplicationEligibility(
                createPublishedJob({
                  applicationDeadline:
                    expiredDeadline
                }),
                company,
                {
                  now
                }
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  409,

                code:
                  "JOB_APPLICATION_NOT_ALLOWED",

                errors:
                  expect.arrayContaining([
                    expect.objectContaining({
                      code:
                        "JOB_APPLICATION_DEADLINE_EXPIRED"
                    })
                  ])
              })
            );
          }
        );

        test(
          "throws JOB_APPLICATION_NOT_ALLOWED for company ineligibility",
          () => {
            validateCompanyJobEligibilityMock
              .mockImplementation(
                () => {
                  throw Object.assign(
                    new Error(
                      "Company is suspended."
                    ),
                    {
                      code:
                        "COMPANY_SUSPENDED"
                    }
                  );
                }
              );

            expect(() =>
              validateJobApplicationEligibility(
                createPublishedJob(),
                company,
                {
                  now
                }
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  409,

                code:
                  "JOB_APPLICATION_NOT_ALLOWED",

                errors:
                  expect.arrayContaining([
                    expect.objectContaining({
                      field:
                        "company",

                      code:
                        "COMPANY_SUSPENDED"
                    })
                  ])
              })
            );
          }
        );
      }
    );
  }
);
