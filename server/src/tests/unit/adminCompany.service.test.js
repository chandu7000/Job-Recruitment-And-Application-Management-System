import {
  jest
} from "@jest/globals";

const findCompaniesByStatusMock =
  jest.fn();

const verifyCompanyMock =
  jest.fn();

const rejectCompanyVerificationMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/company.repository.js",
  () => ({
    findCompaniesByStatus:
      findCompaniesByStatusMock
  })
);

jest.unstable_mockModule(
  "../../services/company.service.js",
  () => ({
    verifyCompany:
      verifyCompanyMock,

    rejectCompanyVerification:
      rejectCompanyVerificationMock
  })
);

const {
  getPendingCompanies,
  approveCompanyVerification,
  rejectCompanyByAdmin
} = await import(
  "../../services/adminCompany.service.js"
);

describe(
  "Admin company service",
  () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "returns pending companies with pagination",
      async () => {
        findCompaniesByStatusMock
          .mockResolvedValue({
            count: 2,
            rows: [
              {
                id: "company-1"
              },
              {
                id: "company-2"
              }
            ]
          });

        const result =
          await getPendingCompanies({
            page: 1,
            limit: 20
          });

        expect(
          findCompaniesByStatusMock
        ).toHaveBeenCalledWith(
          "PENDING_VERIFICATION",
          {
            page: 1,
            limit: 20
          }
        );

        expect(result).toEqual({
          companies: [
            {
              id: "company-1"
            },
            {
              id: "company-2"
            }
          ],

          pagination: {
            total: 2,
            page: 1,
            limit: 20,
            totalPages: 1
          }
        });
      }
    );

    test(
      "normalizes invalid pagination values",
      async () => {
        findCompaniesByStatusMock
          .mockResolvedValue({
            count: 0,
            rows: []
          });

        const result =
          await getPendingCompanies({
            page: 0,
            limit: 500
          });

        expect(
          findCompaniesByStatusMock
        ).toHaveBeenCalledWith(
          "PENDING_VERIFICATION",
          {
            page: 1,
            limit: 100
          }
        );

        expect(
          result.pagination
        ).toEqual({
          total: 0,
          page: 1,
          limit: 100,
          totalPages: 0
        });
      }
    );

    test(
      "approves company using authenticated admin ID",
      async () => {
        const verifiedCompany = {
          id: "company-1",
          status: "VERIFIED"
        };

        verifyCompanyMock
          .mockResolvedValue(
            verifiedCompany
          );

        const result =
          await approveCompanyVerification({
            companyId:
              "company-1",

            adminId:
              "admin-1"
          });

        expect(
          verifyCompanyMock
        ).toHaveBeenCalledWith({
          companyId:
            "company-1",

          performedBy:
            "admin-1"
        });

        expect(result).toBe(
          verifiedCompany
        );
      }
    );

    test(
      "rejects company with reason and authenticated admin ID",
      async () => {
        const rejectedCompany = {
          id: "company-1",
          status: "REJECTED",
          verificationReason:
            "Documents could not be verified."
        };

        rejectCompanyVerificationMock
          .mockResolvedValue(
            rejectedCompany
          );

        const result =
          await rejectCompanyByAdmin({
            companyId:
              "company-1",

            adminId:
              "admin-1",

            reason:
              "Documents could not be verified."
          });

        expect(
          rejectCompanyVerificationMock
        ).toHaveBeenCalledWith({
          companyId:
            "company-1",

          verificationReason:
            "Documents could not be verified.",

          performedBy:
            "admin-1"
        });

        expect(result).toBe(
          rejectedCompany
        );
      }
    );
  }
);