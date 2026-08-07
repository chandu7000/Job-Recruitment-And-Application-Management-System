import {
  jest
} from "@jest/globals";

const transactionMock =
  jest.fn();

const recordCompanyVerificationTransitionMock =
  jest.fn();

const validateCompanyStatusTransitionMock =
  jest.fn();

const validateCompanyOwnershipMock =
  jest.fn();

const createCompanyMock =
  jest.fn();

const findCompanyByIdMock =
  jest.fn();

const findCompanyByOwnerIdMock =
  jest.fn();

const findOwnerCompaniesMock =
  jest.fn();

const updateCompanyMock =
  jest.fn();

const deleteCompanyMock =
  jest.fn();

jest.unstable_mockModule(
  "../../config/database.js",
  () => ({
    sequelize: {
      transaction:
        transactionMock
    }
  })
);

jest.unstable_mockModule(
  "../../services/companyVerificationHistory.service.js",
  () => ({
    recordCompanyVerificationTransition:
      recordCompanyVerificationTransitionMock
  })
);

jest.unstable_mockModule(
  "../../utils/companyStatusTransition.js",
  () => ({
    validateCompanyStatusTransition:
      validateCompanyStatusTransitionMock
  })
);

jest.unstable_mockModule(
  "../../utils/companyOwnership.js",
  () => ({
    default:
      validateCompanyOwnershipMock
  })
);

jest.unstable_mockModule(
  "../../repositories/company.repository.js",
  () => ({
    createCompany:
      createCompanyMock,

    findCompanyById:
      findCompanyByIdMock,

    findCompanyByOwnerId:
      findCompanyByOwnerIdMock,

    findOwnerCompanies:
      findOwnerCompaniesMock,

    updateCompany:
      updateCompanyMock,

    deleteCompany:
      deleteCompanyMock
  })
);

const {
  createCompanyService,
  getMyCompaniesService,
  getCompanyByIdService,
  updateCompanyService,
  updateMyCompanyService,
  deleteCompanyService,
  submitMyCompanyForVerification,
  verifyCompany,
  rejectCompanyVerification
} = await import(
  "../../services/company.service.js"
);

describe(
  "Company service",
  () => {
    const ownerId =
      "11111111-1111-1111-1111-111111111111";

    const companyId =
      "22222222-2222-2222-2222-222222222222";

    const adminId =
      "33333333-3333-3333-3333-333333333333";

    const transaction = {
      LOCK: {
        UPDATE:
          "UPDATE"
      }
    };

    const createCompleteCompany = (
      overrides = {}
    ) => ({
      id:
        companyId,

      ownerId,

      companyName:
        "CareerForge Technologies",

      description:
        "A software company.",

      website:
        "https://careerforge.example",

      industry:
        "Software",

      companySize:
        "51-200",

      location:
        "Vijayawada",

      logoUrl:
        "https://res.cloudinary.com/demo/logo.png",

      logoPublicId:
        "careerforge/company-logos/company-logo",

      status:
        "DRAFT",

      verificationReason:
        null,

      ...overrides
    });

    beforeEach(() => {
      jest.clearAllMocks();

      validateCompanyOwnershipMock
        .mockReturnValue(
          true
        );

      validateCompanyStatusTransitionMock
        .mockReturnValue(
          true
        );

      recordCompanyVerificationTransitionMock
        .mockResolvedValue({
          id: 1
        });

      transactionMock
        .mockImplementation(
          async (callback) =>
            callback(
              transaction
            )
        );
    });

    test(
      "creates a company with DRAFT status and generated slug",
      async () => {
        createCompanyMock
          .mockImplementation(
            async (companyData) => ({
              id:
                companyId,

              ...companyData
            })
          );

        const result =
          await createCompanyService({
            ownerId,

            companyName:
              "CareerForge Technologies",

            companyEmail:
              "company@example.com",

            website:
              "https://careerforge.example",

            industry:
              "Software"
          });

        expect(
          createCompanyMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            ownerId,

            companyName:
              "CareerForge Technologies",

            status:
              "DRAFT",

            slug:
              expect.stringMatching(
                /^careerforge-technologies-[a-f0-9]{8}$/
              )
          })
        );

        expect(result.status).toBe(
          "DRAFT"
        );
      }
    );

    test(
      "returns companies belonging to the owner",
      async () => {
        const companies = [
          createCompleteCompany()
        ];

        findOwnerCompaniesMock
          .mockResolvedValue(
            companies
          );

        const result =
          await getMyCompaniesService(
            ownerId
          );

        expect(
          findOwnerCompaniesMock
        ).toHaveBeenCalledWith(
          ownerId
        );

        expect(result).toBe(
          companies
        );
      }
    );

    test(
      "returns company after validating ownership",
      async () => {
        const company =
          createCompleteCompany();

        findCompanyByIdMock
          .mockResolvedValue(
            company
          );

        const result =
          await getCompanyByIdService({
            companyId,
            ownerId
          });

        expect(
          validateCompanyOwnershipMock
        ).toHaveBeenCalledWith(
          company,
          ownerId
        );

        expect(result).toBe(
          company
        );
      }
    );

    test(
      "removes protected fields before updating a company",
      async () => {
        const company =
          createCompleteCompany();

        const updatedCompany = {
          ...company,

          description:
            "Updated description"
        };

        findCompanyByIdMock
          .mockResolvedValue(
            company
          );

        updateCompanyMock
          .mockResolvedValue(
            updatedCompany
          );

        const result =
          await updateCompanyService({
            companyId,
            ownerId,

            updateData: {
              description:
                "Updated description",

              website:
                "https://updated.example",

              ownerId:
                "malicious-owner",

              status:
                "VERIFIED",

              verificationReason:
                "Malicious reason",

              logoUrl:
                "malicious-logo",

              id:
                "malicious-id"
            }
          });

        expect(
          updateCompanyMock
        ).toHaveBeenCalledWith(
          companyId,
          {
            description:
              "Updated description",

            website:
              "https://updated.example"
          }
        );

        expect(result).toBe(
          updatedCompany
        );
      }
    );

    test(
      "updates only supported fields through own-company update",
      async () => {
        const company =
          createCompleteCompany();

        const updatedCompany = {
          ...company,

          description:
            "Updated company",

          companySize:
            "201-500"
        };

        findCompanyByOwnerIdMock
          .mockResolvedValue(
            company
          );

        updateCompanyMock
          .mockResolvedValue(
            updatedCompany
          );

        const result =
          await updateMyCompanyService({
            ownerId,

            updateData: {
              description:
                "Updated company",

              companySize:
                "201-500",

              companyName:
                "Unsupported change",

              status:
                "VERIFIED"
            }
          });

        expect(
          updateCompanyMock
        ).toHaveBeenCalledWith(
          companyId,
          {
            description:
              "Updated company",

            companySize:
              "201-500"
          }
        );

        expect(result).toBe(
          updatedCompany
        );
      }
    );

    test(
      "rejects own-company update with no supported fields",
      async () => {
        findCompanyByOwnerIdMock
          .mockResolvedValue(
            createCompleteCompany()
          );

        await expect(
          updateMyCompanyService({
            ownerId,

            updateData: {
              companyName:
                "Unsupported",

              status:
                "VERIFIED"
            }
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              400,

            code:
              "COMPANY_UPDATE_FIELDS_REQUIRED"
          })
        );

        expect(
          updateCompanyMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "deletes a company after ownership validation",
      async () => {
        const company =
          createCompleteCompany();

        findCompanyByIdMock
          .mockResolvedValue(
            company
          );

        deleteCompanyMock
          .mockResolvedValue(
            company
          );

        const result =
          await deleteCompanyService({
            companyId,
            ownerId
          });

        expect(
          validateCompanyOwnershipMock
        ).toHaveBeenCalledWith(
          company,
          ownerId
        );

        expect(
          deleteCompanyMock
        ).toHaveBeenCalledWith(
          companyId
        );

        expect(result).toEqual({
          message:
            "Company deleted successfully."
        });
      }
    );

    test(
      "submits a complete DRAFT company for verification",
      async () => {
        const company =
          createCompleteCompany();

        const pendingCompany = {
          ...company,

          status:
            "PENDING_VERIFICATION"
        };

        findCompanyByOwnerIdMock
          .mockResolvedValue(
            company
          );

        findCompanyByIdMock
          .mockResolvedValue(
            company
          );

        updateCompanyMock
          .mockResolvedValue(
            pendingCompany
          );

        const result =
          await submitMyCompanyForVerification({
            ownerId
          });

        expect(
          validateCompanyStatusTransitionMock
        ).toHaveBeenCalledWith(
          "DRAFT",
          "PENDING_VERIFICATION"
        );

        expect(
          updateCompanyMock
        ).toHaveBeenCalledWith(
          companyId,
          {
            status:
              "PENDING_VERIFICATION",

            verificationReason:
              null
          },
          {
            transaction
          }
        );

        expect(
          recordCompanyVerificationTransitionMock
        ).toHaveBeenCalledWith({
          companyId,

          oldStatus:
            "DRAFT",

          newStatus:
            "PENDING_VERIFICATION",

          reason:
            null,

          performedBy:
            ownerId,

          transaction
        });

        expect(result).toBe(
          pendingCompany
        );
      }
    );

    test(
      "rejects submission when company is not in DRAFT status",
      async () => {
        findCompanyByOwnerIdMock
          .mockResolvedValue(
            createCompleteCompany({
              status:
                "PENDING_VERIFICATION"
            })
          );

        await expect(
          submitMyCompanyForVerification({
            ownerId
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              409,

            code:
              "COMPANY_NOT_IN_DRAFT_STATUS"
          })
        );

        expect(
          transactionMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "verifies a pending company and records the admin",
      async () => {
        const company =
          createCompleteCompany({
            status:
              "PENDING_VERIFICATION"
          });

        const verifiedCompany = {
          ...company,

          status:
            "VERIFIED"
        };

        findCompanyByIdMock
          .mockResolvedValue(
            company
          );

        updateCompanyMock
          .mockResolvedValue(
            verifiedCompany
          );

        const result =
          await verifyCompany({
            companyId,

            performedBy:
              adminId
          });

        expect(
          updateCompanyMock
        ).toHaveBeenCalledWith(
          companyId,
          {
            status:
              "VERIFIED",

            verificationReason:
              null
          },
          {
            transaction
          }
        );

        expect(
          recordCompanyVerificationTransitionMock
        ).toHaveBeenCalledWith({
          companyId,

          oldStatus:
            "PENDING_VERIFICATION",

          newStatus:
            "VERIFIED",

          reason:
            null,

          performedBy:
            adminId,

          transaction
        });

        expect(result).toBe(
          verifiedCompany
        );
      }
    );

    test(
      "rejects a pending company and records the reason",
      async () => {
        const rejectionReason =
          "Company documents could not be verified.";

        const company =
          createCompleteCompany({
            status:
              "PENDING_VERIFICATION"
          });

        const rejectedCompany = {
          ...company,

          status:
            "REJECTED",

          verificationReason:
            rejectionReason
        };

        findCompanyByIdMock
          .mockResolvedValue(
            company
          );

        updateCompanyMock
          .mockResolvedValue(
            rejectedCompany
          );

        const result =
          await rejectCompanyVerification({
            companyId,

            verificationReason:
              `  ${rejectionReason}  `,

            performedBy:
              adminId
          });

        expect(
          updateCompanyMock
        ).toHaveBeenCalledWith(
          companyId,
          {
            status:
              "REJECTED",

            verificationReason:
              rejectionReason
          },
          {
            transaction
          }
        );

        expect(
          recordCompanyVerificationTransitionMock
        ).toHaveBeenCalledWith({
          companyId,

          oldStatus:
            "PENDING_VERIFICATION",

          newStatus:
            "REJECTED",

          reason:
            rejectionReason,

          performedBy:
            adminId,

          transaction
        });

        expect(result).toBe(
          rejectedCompany
        );
      }
    );

    test(
      "requires a reason when rejecting a company",
      async () => {
        findCompanyByIdMock
          .mockResolvedValue(
            createCompleteCompany({
              status:
                "PENDING_VERIFICATION"
            })
          );

        await expect(
          rejectCompanyVerification({
            companyId,

            verificationReason:
              "   ",

            performedBy:
              adminId
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              400,

            code:
              "COMPANY_REJECTION_REASON_REQUIRED"
          })
        );

        expect(
          updateCompanyMock
        ).not.toHaveBeenCalled();

        expect(
          recordCompanyVerificationTransitionMock
        ).not.toHaveBeenCalled();
      }
    );
  }
);