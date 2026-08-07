import {
  jest
} from "@jest/globals";

const {
  PUBLIC_JOB_ELIGIBILITY_ERROR_CODES,
  getEntityValue,
  parsePublicJobDeadline,
  collectPublicJobEligibilityIssues,
  isPublicJobEligible,
  validatePublicJobEligibility
} = await import(
  "../../utils/publicJobEligibility.js"
);

describe(
  "Public job eligibility",
  () => {
    const now =
      new Date(
        "2026-08-04T10:00:00.000Z"
      );

    const futureDeadline =
      new Date(
        "2026-08-05T10:00:00.000Z"
      );

    const expiredDeadline =
      new Date(
        "2026-08-03T10:00:00.000Z"
      );

    const verifiedCompany = {
      id:
        "11111111-1111-4111-8111-111111111111",

      status:
        "VERIFIED",

      deletedAt:
        null
    };

    const createEligibleJob = (
      overrides = {}
    ) => ({
      id:
        "22222222-2222-4222-8222-222222222222",

      status:
        "PUBLISHED",

      applicationDeadline:
        futureDeadline,

      deletedAt:
        null,

      ...overrides
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "contains the approved public eligibility error codes",
      () => {
        expect(
          PUBLIC_JOB_ELIGIBILITY_ERROR_CODES
        ).toEqual({
          JOB_REQUIRED:
            "JOB_REQUIRED",

          JOB_NOT_PUBLISHED:
            "JOB_NOT_PUBLISHED",

          JOB_DELETED:
            "JOB_DELETED",

          JOB_APPLICATION_DEADLINE_MISSING:
            "JOB_APPLICATION_DEADLINE_MISSING",

          JOB_APPLICATION_DEADLINE_INVALID:
            "JOB_APPLICATION_DEADLINE_INVALID",

          JOB_APPLICATION_DEADLINE_EXPIRED:
            "JOB_APPLICATION_DEADLINE_EXPIRED",

          COMPANY_REQUIRED:
            "COMPANY_REQUIRED",

          COMPANY_NOT_VERIFIED:
            "COMPANY_NOT_VERIFIED",

          COMPANY_DELETED:
            "COMPANY_DELETED"
        });
      }
    );

    test(
      "reads values from a plain object",
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
      "reads values from a Sequelize-like entity",
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
      "parses a valid deadline",
      () => {
        expect(
          parsePublicJobDeadline(
            "2026-08-05T10:00:00.000Z"
          ).toISOString()
        ).toBe(
          "2026-08-05T10:00:00.000Z"
        );
      }
    );

    test(
      "returns no issues for an eligible public job",
      () => {
        expect(
          collectPublicJobEligibilityIssues(
            createEligibleJob(),
            verifiedCompany,
            {
              now
            }
          )
        ).toEqual([]);
      }
    );

    test.each([
      "DRAFT",
      "CLOSED",
      "REMOVED",
      null,
      undefined
    ])(
      "rejects an unavailable job status %p",
      (
        status
      ) => {
        const issues =
          collectPublicJobEligibilityIssues(
            createEligibleJob({
              status
            }),
            verifiedCompany,
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
                "JOB_NOT_PUBLISHED",

              value:
                status ?? null
            })
          ])
        );
      }
    );

    test(
      "rejects a soft-deleted job",
      () => {
        const deletedAt =
          new Date(
            "2026-08-01T10:00:00.000Z"
          );

        const issues =
          collectPublicJobEligibilityIssues(
            createEligibleJob({
              deletedAt
            }),
            verifiedCompany,
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
                "JOB_DELETED",

              value:
                deletedAt
            })
          ])
        );
      }
    );

    test.each([
      null,
      undefined
    ])(
      "rejects a missing application deadline %p",
      (
        applicationDeadline
      ) => {
        const issues =
          collectPublicJobEligibilityIssues(
            createEligibleJob({
              applicationDeadline
            }),
            verifiedCompany,
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
                "JOB_APPLICATION_DEADLINE_MISSING"
            })
          ])
        );
      }
    );

    test(
      "rejects an invalid application deadline",
      () => {
        const issues =
          collectPublicJobEligibilityIssues(
            createEligibleJob({
              applicationDeadline:
                "invalid-date"
            }),
            verifiedCompany,
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
                "JOB_APPLICATION_DEADLINE_INVALID"
            })
          ])
        );
      }
    );

    test(
      "rejects an expired application deadline",
      () => {
        const issues =
          collectPublicJobEligibilityIssues(
            createEligibleJob({
              applicationDeadline:
                expiredDeadline
            }),
            verifiedCompany,
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
                "JOB_APPLICATION_DEADLINE_EXPIRED"
            })
          ])
        );
      }
    );

    test(
      "does not treat a deadline equal to now as expired",
      () => {
        expect(
          collectPublicJobEligibilityIssues(
            createEligibleJob({
              applicationDeadline:
                now
            }),
            verifiedCompany,
            {
              now
            }
          )
        ).toEqual([]);
      }
    );

    test(
      "rejects a missing company",
      () => {
        const issues =
          collectPublicJobEligibilityIssues(
            createEligibleJob(),
            null,
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
                "COMPANY_REQUIRED"
            })
          ])
        );
      }
    );

    test.each([
      "DRAFT",
      "PENDING_VERIFICATION",
      "REJECTED",
      "RESUBMITTED",
      null,
      undefined
    ])(
      "rejects company status %p",
      (
        status
      ) => {
        const issues =
          collectPublicJobEligibilityIssues(
            createEligibleJob(),
            {
              ...verifiedCompany,
              status
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
                "COMPANY_NOT_VERIFIED",

              value:
                status ?? null
            })
          ])
        );
      }
    );

    test(
      "rejects a soft-deleted company",
      () => {
        const deletedAt =
          new Date(
            "2026-08-01T10:00:00.000Z"
          );

        const issues =
          collectPublicJobEligibilityIssues(
            createEligibleJob(),
            {
              ...verifiedCompany,
              deletedAt
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
                "COMPANY_DELETED"
            })
          ])
        );
      }
    );

    test(
      "returns true for an eligible job",
      () => {
        expect(
          isPublicJobEligible(
            createEligibleJob(),
            verifiedCompany,
            {
              now
            }
          )
        ).toBe(true);
      }
    );

    test(
      "returns false for an unavailable job",
      () => {
        expect(
          isPublicJobEligible(
            createEligibleJob({
              status:
                "CLOSED"
            }),
            verifiedCompany,
            {
              now
            }
          )
        ).toBe(false);
      }
    );

    test(
      "validates an eligible public job",
      () => {
        expect(
          validatePublicJobEligibility(
            createEligibleJob(),
            verifiedCompany,
            {
              now
            }
          )
        ).toBe(true);
      }
    );

    test(
      "throws a controlled 404 without revealing the internal reason",
      () => {
        expect(() =>
          validatePublicJobEligibility(
            createEligibleJob({
              status:
                "REMOVED"
            }),
            verifiedCompany,
            {
              now
            }
          )
        ).toThrow(
          expect.objectContaining({
            statusCode:
              404,

            code:
              "PUBLIC_JOB_NOT_FOUND",

            message:
              "Public job not found.",

            errors: []
          })
        );
      }
    );
  }
);