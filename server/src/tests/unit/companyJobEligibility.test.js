import {
  COMPANY_STATUSES
} from "../../constants/company.constants.js";

import validateCompanyJobEligibility from
  "../../utils/companyJobEligibility.js";

describe(
  "Company job eligibility",
  () => {

    test(
      "allows job creation for VERIFIED company",
      () => {

        const company = {
          status:
            COMPANY_STATUSES.VERIFIED
        };

        expect(
          validateCompanyJobEligibility(
            company
          )
        ).toBe(true);

      }
    );

    test(
      "rejects job creation for DRAFT company",
      () => {

        const company = {
          status:
            COMPANY_STATUSES.DRAFT
        };

        expect(() =>
          validateCompanyJobEligibility(
            company
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

    test(
      "rejects job creation for PENDING_VERIFICATION company",
      () => {

        const company = {
          status:
            COMPANY_STATUSES
              .PENDING_VERIFICATION
        };

        expect(() =>
          validateCompanyJobEligibility(
            company
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

    test(
      "rejects job creation for REJECTED company",
      () => {

        const company = {
          status:
            COMPANY_STATUSES.REJECTED
        };

        expect(() =>
          validateCompanyJobEligibility(
            company
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

    test(
      "rejects job creation for RESUBMITTED company",
      () => {

        const company = {
          status:
            COMPANY_STATUSES.RESUBMITTED
        };

        expect(() =>
          validateCompanyJobEligibility(
            company
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

  }
);