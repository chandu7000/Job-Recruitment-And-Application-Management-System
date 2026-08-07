import {
  collectPublicCompanyEligibilityIssues,
  isPublicCompanyEligible,
  validatePublicCompanyEligibility
} from "../../utils/publicCompanyEligibility.js";

describe(
  "Public company eligibility",
  () => {
    const createCompany = (
      overrides = {}
    ) => ({
      id:
        "11111111-1111-4111-8111-111111111111",

      status:
        "VERIFIED",

      deletedAt:
        null,

      ...overrides
    });

    test(
      "returns no issues for a verified available company",
      () => {
        expect(
          collectPublicCompanyEligibilityIssues(
            createCompany()
          )
        ).toEqual([]);
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
      "rejects company status %s",
      (status) => {
        const issues =
          collectPublicCompanyEligibilityIssues(
            createCompany({
              status
            })
          );

        expect(
          issues
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code:
                "COMPANY_NOT_VERIFIED"
            })
          ])
        );
      }
    );

    test(
      "rejects a soft-deleted company",
      () => {
        const issues =
          collectPublicCompanyEligibilityIssues(
            createCompany({
              deletedAt:
                new Date()
            })
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
      "rejects a missing company",
      () => {
        expect(
          collectPublicCompanyEligibilityIssues(
            null
          )
        ).toEqual([
          expect.objectContaining({
            code:
              "COMPANY_REQUIRED"
          })
        ]);
      }
    );

    test(
      "returns true for an eligible company",
      () => {
        expect(
          isPublicCompanyEligible(
            createCompany()
          )
        ).toBe(true);
      }
    );

    test(
      "returns false for an unavailable company",
      () => {
        expect(
          isPublicCompanyEligible(
            createCompany({
              status:
                "DRAFT"
            })
          )
        ).toBe(false);
      }
    );

    test(
      "throws a controlled public 404",
      () => {
        expect(() =>
          validatePublicCompanyEligibility(
            createCompany({
              status:
                "REJECTED"
            })
          )
        ).toThrow(
          expect.objectContaining({
            statusCode:
              404,

            code:
              "PUBLIC_COMPANY_NOT_FOUND"
          })
        );
      }
    );
  }
);