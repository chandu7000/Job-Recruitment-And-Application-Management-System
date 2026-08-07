import validateCompanyOwnership from
  "../../utils/companyOwnership.js";

describe(
  "Company ownership validation",
  () => {
    test(
      "allows the company owner",
      () => {
        const company = {
          ownerId:
            "11111111-1111-1111-1111-111111111111"
        };

        expect(
          validateCompanyOwnership(
            company,
            "11111111-1111-1111-1111-111111111111"
          )
        ).toBe(true);
      }
    );

    test(
      "rejects another recruiter",
      () => {
        const company = {
          ownerId:
            "11111111-1111-1111-1111-111111111111"
        };

        expect(() =>
          validateCompanyOwnership(
            company,
            "22222222-2222-2222-2222-222222222222"
          )
        ).toThrow(
          expect.objectContaining({
            statusCode: 403,
            code:
              "COMPANY_ACCESS_FORBIDDEN"
          })
        );
      }
    );

    test(
      "rejects a missing company",
      () => {
        expect(() =>
          validateCompanyOwnership(
            null,
            "11111111-1111-1111-1111-111111111111"
          )
        ).toThrow(
          expect.objectContaining({
            statusCode: 404,
            code:
              "COMPANY_NOT_FOUND"
          })
        );
      }
    );
  }
);