import {
  jest
} from "@jest/globals";

const findByIdMock =
  jest.fn();

const findBySlugMock =
  jest.fn();

const validateEligibilityMock =
  jest.fn();

const sanitizeCompanyMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/publicCompany.repository.js",
  () => ({
    findPublicCompanyCandidateById:
      findByIdMock,

    findPublicCompanyCandidateBySlug:
      findBySlugMock
  })
);

jest.unstable_mockModule(
  "../../utils/publicCompanyEligibility.js",
  () => ({
    validatePublicCompanyEligibility:
      validateEligibilityMock
  })
);

jest.unstable_mockModule(
  "../../utils/publicResponseSanitizer.js",
  () => ({
    sanitizePublicCompanyDetail:
      sanitizeCompanyMock
  })
);

const {
  getPublicCompanyById,
  getPublicCompanyBySlug
} = await import(
  "../../services/publicCompany.service.js"
);

describe(
  "Public company service",
  () => {
    const company = {
      id:
        "11111111-1111-4111-8111-111111111111",

      slug:
        "careerforge-technologies",

      status:
        "VERIFIED",

      deletedAt:
        null
    };

    beforeEach(() => {
      jest.clearAllMocks();

      findByIdMock
        .mockResolvedValue(
          company
        );

      findBySlugMock
        .mockResolvedValue(
          company
        );

      validateEligibilityMock
        .mockReturnValue(
          true
        );

      sanitizeCompanyMock
        .mockReturnValue({
          id:
            company.id,

          slug:
            company.slug
        });
    });

    test(
      "fetches an eligible public company by ID",
      async () => {
        const result =
          await getPublicCompanyById({
            companyId:
              company.id
          });

        expect(
          findByIdMock
        ).toHaveBeenCalledWith(
          company.id
        );

        expect(
          validateEligibilityMock
        ).toHaveBeenCalledWith(
          company
        );

        expect(result).toEqual({
          id:
            company.id,

          slug:
            company.slug
        });
      }
    );

    test(
      "fetches an eligible public company by slug",
      async () => {
        await getPublicCompanyBySlug({
          slug:
            company.slug
        });

        expect(
          findBySlugMock
        ).toHaveBeenCalledWith(
          company.slug
        );
      }
    );

    test(
      "sanitizes the public company response",
      async () => {
        await getPublicCompanyById({
          companyId:
            company.id
        });

        expect(
          sanitizeCompanyMock
        ).toHaveBeenCalledWith(
          company
        );
      }
    );

    test(
      "does not sanitize when eligibility fails",
      async () => {
        const error =
          new Error(
            "Public company not found."
          );

        error.statusCode =
          404;

        error.code =
          "PUBLIC_COMPANY_NOT_FOUND";

        validateEligibilityMock
          .mockImplementation(() => {
            throw error;
          });

        await expect(
          getPublicCompanyById({
            companyId:
              company.id
          })
        ).rejects.toBe(
          error
        );

        expect(
          sanitizeCompanyMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "maps repository failures to a controlled error",
      async () => {
        findByIdMock
          .mockRejectedValue(
            new Error(
              "Database unavailable"
            )
          );

        await expect(
          getPublicCompanyById({
            companyId:
              company.id
          })
        ).rejects.toMatchObject({
          statusCode:
            500,

          code:
            "PUBLIC_COMPANY_DETAILS_FETCH_FAILED"
        });
      }
    );
  }
);