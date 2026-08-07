import {
  jest
} from "@jest/globals";

const createCompanyVerificationHistoryMock =
  jest.fn();

const findCompanyVerificationHistoryMock =
  jest.fn();

const findLatestCompanyVerificationHistoryMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/companyVerificationHistory.repository.js",
  () => ({
    createCompanyVerificationHistory:
      createCompanyVerificationHistoryMock,

    findCompanyVerificationHistory:
      findCompanyVerificationHistoryMock,

    findLatestCompanyVerificationHistory:
      findLatestCompanyVerificationHistoryMock
  })
);

const {
  recordCompanyVerificationTransition,
  getCompanyVerificationHistory,
  getLatestCompanyVerificationHistory
} = await import(
  "../../services/companyVerificationHistory.service.js"
);

describe(
  "Company verification history service",
  () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "records a company verification transition",
      async () => {
        const createdHistory = {
          id: 1,
          companyId:
            "11111111-1111-1111-1111-111111111111",
          oldStatus:
            "DRAFT",
          newStatus:
            "PENDING_VERIFICATION",
          reason: null,
          performedBy:
            "22222222-2222-2222-2222-222222222222"
        };

        createCompanyVerificationHistoryMock
          .mockResolvedValue(
            createdHistory
          );

        const result =
          await recordCompanyVerificationTransition({
            companyId:
              "11111111-1111-1111-1111-111111111111",

            oldStatus:
              "DRAFT",

            newStatus:
              "PENDING_VERIFICATION",

            performedBy:
              "22222222-2222-2222-2222-222222222222"
          });

        expect(
          createCompanyVerificationHistoryMock
        ).toHaveBeenCalledWith(
          {
            companyId:
              "11111111-1111-1111-1111-111111111111",

            oldStatus:
              "DRAFT",

            newStatus:
              "PENDING_VERIFICATION",

            reason:
              null,

            performedBy:
              "22222222-2222-2222-2222-222222222222"
          },
          {
            transaction:
              undefined
          }
        );

        expect(result).toBe(
          createdHistory
        );
      }
    );

    test(
      "trims the verification reason before recording",
      async () => {
        createCompanyVerificationHistoryMock
          .mockResolvedValue({
            id: 1
          });

        await recordCompanyVerificationTransition({
          companyId:
            "11111111-1111-1111-1111-111111111111",

          oldStatus:
            "PENDING_VERIFICATION",

          newStatus:
            "REJECTED",

          reason:
            "  Documents could not be verified.  ",

          performedBy:
            "22222222-2222-2222-2222-222222222222"
        });

        expect(
          createCompanyVerificationHistoryMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            reason:
              "Documents could not be verified."
          }),
          {
            transaction:
              undefined
          }
        );
      }
    );

    test(
      "stores a blank reason as null",
      async () => {
        createCompanyVerificationHistoryMock
          .mockResolvedValue({
            id: 1
          });

        await recordCompanyVerificationTransition({
          companyId:
            "11111111-1111-1111-1111-111111111111",

          oldStatus:
            "DRAFT",

          newStatus:
            "PENDING_VERIFICATION",

          reason:
            "   ",

          performedBy:
            "22222222-2222-2222-2222-222222222222"
        });

        expect(
          createCompanyVerificationHistoryMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            reason:
              null
          }),
          {
            transaction:
              undefined
          }
        );
      }
    );

    test(
      "passes the transaction to the repository",
      async () => {
        const transaction = {
          id:
            "transaction-1"
        };

        createCompanyVerificationHistoryMock
          .mockResolvedValue({
            id: 1
          });

        await recordCompanyVerificationTransition({
          companyId:
            "11111111-1111-1111-1111-111111111111",

          oldStatus:
            "PENDING_VERIFICATION",

          newStatus:
            "VERIFIED",

          performedBy:
            "22222222-2222-2222-2222-222222222222",

          transaction
        });

        expect(
          createCompanyVerificationHistoryMock
        ).toHaveBeenCalledWith(
          expect.any(Object),
          {
            transaction
          }
        );
      }
    );

    test(
      "rejects a transition without performedBy",
      async () => {
        await expect(
          recordCompanyVerificationTransition({
            companyId:
              "11111111-1111-1111-1111-111111111111",

            oldStatus:
              "DRAFT",

            newStatus:
              "PENDING_VERIFICATION"
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode: 400,
            code:
              "COMPANY_STATUS_PERFORMER_REQUIRED"
          })
        );

        expect(
          createCompanyVerificationHistoryMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "returns company verification history",
      async () => {
        const history = [
          {
            id: 2,
            newStatus:
              "VERIFIED"
          },
          {
            id: 1,
            newStatus:
              "PENDING_VERIFICATION"
          }
        ];

        findCompanyVerificationHistoryMock
          .mockResolvedValue(
            history
          );

        const result =
          await getCompanyVerificationHistory({
            companyId:
              "11111111-1111-1111-1111-111111111111"
          });

        expect(
          findCompanyVerificationHistoryMock
        ).toHaveBeenCalledWith(
          "11111111-1111-1111-1111-111111111111"
        );

        expect(result).toBe(
          history
        );
      }
    );

    test(
      "returns the latest company verification history",
      async () => {
        const latestHistory = {
          id: 2,
          newStatus:
            "VERIFIED"
        };

        findLatestCompanyVerificationHistoryMock
          .mockResolvedValue(
            latestHistory
          );

        const result =
          await getLatestCompanyVerificationHistory({
            companyId:
              "11111111-1111-1111-1111-111111111111"
          });

        expect(
          findLatestCompanyVerificationHistoryMock
        ).toHaveBeenCalledWith(
          "11111111-1111-1111-1111-111111111111"
        );

        expect(result).toBe(
          latestHistory
        );
      }
    );
  }
);