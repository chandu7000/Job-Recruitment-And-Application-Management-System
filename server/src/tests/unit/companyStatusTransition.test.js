import {
  COMPANY_STATUSES
} from "../../constants/company.constants.js";

import {
  canChangeCompanyStatus,
  validateCompanyStatusTransition
} from "../../utils/companyStatusTransition.js";

describe(
  "Company status transition",
  () => {
    test(
      "allows DRAFT to PENDING_VERIFICATION",
      () => {
        const result =
          canChangeCompanyStatus(
            COMPANY_STATUSES.DRAFT,
            COMPANY_STATUSES
              .PENDING_VERIFICATION
          );

        expect(result).toBe(true);
      }
    );

    test(
      "allows PENDING_VERIFICATION to VERIFIED",
      () => {
        const result =
          canChangeCompanyStatus(
            COMPANY_STATUSES
              .PENDING_VERIFICATION,
            COMPANY_STATUSES.VERIFIED
          );

        expect(result).toBe(true);
      }
    );

    test(
      "allows PENDING_VERIFICATION to REJECTED",
      () => {
        const result =
          canChangeCompanyStatus(
            COMPANY_STATUSES
              .PENDING_VERIFICATION,
            COMPANY_STATUSES.REJECTED
          );

        expect(result).toBe(true);
      }
    );

    test(
      "allows REJECTED to RESUBMITTED",
      () => {
        const result =
          canChangeCompanyStatus(
            COMPANY_STATUSES.REJECTED,
            COMPANY_STATUSES.RESUBMITTED
          );

        expect(result).toBe(true);
      }
    );

    test(
      "allows RESUBMITTED to PENDING_VERIFICATION",
      () => {
        const result =
          canChangeCompanyStatus(
            COMPANY_STATUSES.RESUBMITTED,
            COMPANY_STATUSES
              .PENDING_VERIFICATION
          );

        expect(result).toBe(true);
      }
    );

    test(
      "rejects VERIFIED to DRAFT",
      () => {
        expect(() =>
          validateCompanyStatusTransition(
            COMPANY_STATUSES.VERIFIED,
            COMPANY_STATUSES.DRAFT
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "INVALID_COMPANY_STATUS_TRANSITION"
          })
        );
      }
    );

    test(
      "rejects DRAFT to VERIFIED",
      () => {
        expect(() =>
          validateCompanyStatusTransition(
            COMPANY_STATUSES.DRAFT,
            COMPANY_STATUSES.VERIFIED
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "INVALID_COMPANY_STATUS_TRANSITION"
          })
        );
      }
    );
  }
);