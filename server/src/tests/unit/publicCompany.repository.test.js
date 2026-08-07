import {
  jest
} from "@jest/globals";

const findByPkMock =
  jest.fn();

const findOneMock =
  jest.fn();

jest.unstable_mockModule(
  "../../models/company.model.js",
  () => ({
    default: {
      findByPk:
        findByPkMock,

      findOne:
        findOneMock
    }
  })
);

const {
  PUBLIC_COMPANY_DETAIL_ATTRIBUTES,
  findPublicCompanyCandidateById,
  findPublicCompanyCandidateBySlug
} = await import(
  "../../repositories/publicCompany.repository.js"
);

describe(
  "Public company repository",
  () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "defines safe detail query attributes",
      () => {
        expect(
          PUBLIC_COMPANY_DETAIL_ATTRIBUTES
        ).toEqual(
          expect.arrayContaining([
            "id",
            "companyName",
            "description",
            "website",
            "foundedYear",
            "status",
            "deletedAt"
          ])
        );

        expect(
          PUBLIC_COMPANY_DETAIL_ATTRIBUTES
        ).not.toContain(
          "ownerId"
        );

        expect(
          PUBLIC_COMPANY_DETAIL_ATTRIBUTES
        ).not.toContain(
          "companyEmail"
        );

        expect(
          PUBLIC_COMPANY_DETAIL_ATTRIBUTES
        ).not.toContain(
          "verificationReason"
        );
      }
    );

    test(
      "finds a public company candidate by ID",
      async () => {
        const company = {
          id:
            "11111111-1111-4111-8111-111111111111"
        };

        findByPkMock
          .mockResolvedValue(
            company
          );

        const result =
          await findPublicCompanyCandidateById(
            company.id
          );

        expect(result).toBe(
          company
        );

        expect(
          findByPkMock
        ).toHaveBeenCalledWith(
          company.id,
          {
            attributes:
              PUBLIC_COMPANY_DETAIL_ATTRIBUTES,

            paranoid:
              false,

            transaction:
              undefined
          }
        );
      }
    );

    test(
      "finds a public company candidate by slug",
      async () => {
        findOneMock
          .mockResolvedValue({
            id:
              "11111111-1111-4111-8111-111111111111"
          });

        await findPublicCompanyCandidateBySlug(
          "careerforge-technologies"
        );

        expect(
          findOneMock
        ).toHaveBeenCalledWith({
          where: {
            slug:
              "careerforge-technologies"
          },

          attributes:
            PUBLIC_COMPANY_DETAIL_ATTRIBUTES,

          paranoid:
            false,

          transaction:
            undefined
        });
      }
    );

    test(
      "propagates repository failures",
      async () => {
        const error =
          new Error(
            "Database unavailable"
          );

        findByPkMock
          .mockRejectedValue(
            error
          );

        await expect(
          findPublicCompanyCandidateById(
            "11111111-1111-4111-8111-111111111111"
          )
        ).rejects.toBe(
          error
        );
      }
    );
  }
);