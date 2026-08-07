import {
  COMPANY_STATUSES
} from "../../constants/company.constants.js";

import {
  validateCompanyVerificationDetails
} from "../../services/company.service.js";

describe(
  "Company verification details validation",
  () => {
    const createValidCompany = () => ({
      companyName:
        "CareerForge Technologies",

      description:
        "A software development company.",

      website:
        "https://careerforge.example",

      industry:
        "Software",

      logoUrl:
        "https://res.cloudinary.com/example/logo.png",

      logoPublicId:
        "careerforge/company-logos/company-logo",

      status:
        COMPANY_STATUSES.DRAFT
    });

    test(
      "allows a company with all required verification details",
      () => {
        const company =
          createValidCompany();

        expect(
          validateCompanyVerificationDetails(
            company
          )
        ).toBe(true);
      }
    );

    test(
      "rejects a company without a company name",
      () => {
        const company =
          createValidCompany();

        company.companyName = "";

        expect(() =>
          validateCompanyVerificationDetails(
            company
          )
        ).toThrow(
          expect.objectContaining({
            statusCode: 400,
            code:
              "COMPANY_VERIFICATION_DETAILS_INCOMPLETE"
          })
        );
      }
    );

    test(
      "rejects a company without a description",
      () => {
        const company =
          createValidCompany();

        company.description = null;

        expect(() =>
          validateCompanyVerificationDetails(
            company
          )
        ).toThrow(
          expect.objectContaining({
            statusCode: 400,
            code:
              "COMPANY_VERIFICATION_DETAILS_INCOMPLETE"
          })
        );
      }
    );

    test(
      "rejects a company without a website",
      () => {
        const company =
          createValidCompany();

        company.website = "   ";

        expect(() =>
          validateCompanyVerificationDetails(
            company
          )
        ).toThrow(
          expect.objectContaining({
            statusCode: 400,
            code:
              "COMPANY_VERIFICATION_DETAILS_INCOMPLETE"
          })
        );
      }
    );

    test(
      "rejects a company without an industry",
      () => {
        const company =
          createValidCompany();

        company.industry = undefined;

        expect(() =>
          validateCompanyVerificationDetails(
            company
          )
        ).toThrow(
          expect.objectContaining({
            statusCode: 400,
            code:
              "COMPANY_VERIFICATION_DETAILS_INCOMPLETE"
          })
        );
      }
    );

    test(
      "rejects a company without a logo URL",
      () => {
        const company =
          createValidCompany();

        company.logoUrl = null;

        expect(() =>
          validateCompanyVerificationDetails(
            company
          )
        ).toThrow(
          expect.objectContaining({
            statusCode: 400,
            code:
              "COMPANY_VERIFICATION_DETAILS_INCOMPLETE"
          })
        );
      }
    );

    test(
      "rejects a company without a logo public ID",
      () => {
        const company =
          createValidCompany();

        company.logoPublicId = null;

        expect(() =>
          validateCompanyVerificationDetails(
            company
          )
        ).toThrow(
          expect.objectContaining({
            statusCode: 400,
            code:
              "COMPANY_VERIFICATION_DETAILS_INCOMPLETE"
          })
        );
      }
    );

    test(
      "reports multiple missing verification fields",
      () => {
        const company =
          createValidCompany();

        company.description = "";
        company.website = "";
        company.industry = "";
        company.logoUrl = null;
        company.logoPublicId = null;

        expect(() =>
          validateCompanyVerificationDetails(
            company
          )
        ).toThrow(
          expect.objectContaining({
            statusCode: 400,
            code:
              "COMPANY_VERIFICATION_DETAILS_INCOMPLETE",

            message:
              expect.stringContaining(
                "description"
              )
          })
        );

        expect(() =>
          validateCompanyVerificationDetails(
            company
          )
        ).toThrow(
          expect.objectContaining({
            message:
              expect.stringContaining(
                "website"
              )
          })
        );

        expect(() =>
          validateCompanyVerificationDetails(
            company
          )
        ).toThrow(
          expect.objectContaining({
            message:
              expect.stringContaining(
                "industry"
              )
          })
        );

        expect(() =>
          validateCompanyVerificationDetails(
            company
          )
        ).toThrow(
          expect.objectContaining({
            message:
              expect.stringContaining(
                "logo"
              )
          })
        );
      }
    );
  }
);