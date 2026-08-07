import {
  jest
} from "@jest/globals";

const findCompanyByOwnerIdMock =
  jest.fn();

const updateCompanyLogoByOwnerIdMock =
  jest.fn();

const clearCompanyLogoByOwnerIdMock =
  jest.fn();

const uploadCompanyLogoMock =
  jest.fn();

const deleteCloudinaryAssetMock =
  jest.fn();

const validateCompanyLogoMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/company.repository.js",
  () => ({
    findCompanyByOwnerId:
      findCompanyByOwnerIdMock,

    updateCompanyLogoByOwnerId:
      updateCompanyLogoByOwnerIdMock,

    clearCompanyLogoByOwnerId:
      clearCompanyLogoByOwnerIdMock
  })
);

jest.unstable_mockModule(
  "../../utils/cloudinaryUpload.js",
  () => ({
    uploadCompanyLogo:
      uploadCompanyLogoMock,

    deleteCloudinaryAsset:
      deleteCloudinaryAssetMock
  })
);

jest.unstable_mockModule(
  "../../utils/fileValidation.js",
  () => ({
    validateCompanyLogo:
      validateCompanyLogoMock
  })
);

const {
  uploadOwnedCompanyLogo,
  deleteOwnedCompanyLogo
} = await import(
  "../../services/companyLogo.service.js"
);

describe(
  "Company logo service",
  () => {
    const ownerId =
      "11111111-1111-1111-1111-111111111111";

    const companyId =
      "22222222-2222-2222-2222-222222222222";

    const file = {
      fieldname:
        "companyLogo",

      originalname:
        "company-logo.png",

      mimetype:
        "image/png",

      size:
        1024,

      buffer:
        Buffer.from(
          "company-logo-content"
        )
    };

    beforeEach(() => {
      jest.clearAllMocks();

      validateCompanyLogoMock
        .mockReturnValue({
          extension:
            ".png",

          originalName:
            file.originalname,

          mimeType:
            file.mimetype,

          size:
            file.size
        });

      deleteCloudinaryAssetMock
        .mockResolvedValue({
          result:
            "ok"
        });
    });

    describe(
      "uploadOwnedCompanyLogo",
      () => {
        test(
          "uploads and stores a company logo successfully",
          async () => {
            const company = {
              id:
                companyId,

              ownerId,

              logoUrl:
                null,

              logoPublicId:
                null
            };

            const uploadResult = {
              secure_url:
                "https://res.cloudinary.com/demo/company-logo.png",

              public_id:
                `careerforge/company-logos/company-${companyId}-logo`
            };

            const updatedCompany = {
              ...company,

              logoUrl:
                uploadResult.secure_url,

              logoPublicId:
                uploadResult.public_id
            };

            findCompanyByOwnerIdMock
              .mockResolvedValue(
                company
              );

            uploadCompanyLogoMock
              .mockResolvedValue(
                uploadResult
              );

            updateCompanyLogoByOwnerIdMock
              .mockResolvedValue(
                updatedCompany
              );

            const result =
              await uploadOwnedCompanyLogo(
                ownerId,
                file
              );

            expect(
              validateCompanyLogoMock
            ).toHaveBeenCalledWith(
              file
            );

            expect(
              findCompanyByOwnerIdMock
            ).toHaveBeenCalledWith(
              ownerId
            );

            expect(
              uploadCompanyLogoMock
            ).toHaveBeenCalledWith(
              file.buffer,
              `company-${companyId}-logo`
            );

            expect(
              updateCompanyLogoByOwnerIdMock
            ).toHaveBeenCalledWith(
              ownerId,
              {
                logoUrl:
                  uploadResult.secure_url,

                logoPublicId:
                  uploadResult.public_id
              }
            );

            expect(
              deleteCloudinaryAssetMock
            ).not.toHaveBeenCalled();

            expect(result).toBe(
              updatedCompany
            );
          }
        );

        test(
          "replaces an existing logo and deletes the old Cloudinary asset",
          async () => {
            const oldPublicId =
              "careerforge/company-logos/old-company-logo";

            const company = {
              id:
                companyId,

              ownerId,

              logoUrl:
                "https://res.cloudinary.com/demo/old-logo.png",

              logoPublicId:
                oldPublicId
            };

            const uploadResult = {
              secure_url:
                "https://res.cloudinary.com/demo/new-logo.png",

              public_id:
                "careerforge/company-logos/new-company-logo"
            };

            const updatedCompany = {
              ...company,

              logoUrl:
                uploadResult.secure_url,

              logoPublicId:
                uploadResult.public_id
            };

            findCompanyByOwnerIdMock
              .mockResolvedValue(
                company
              );

            uploadCompanyLogoMock
              .mockResolvedValue(
                uploadResult
              );

            updateCompanyLogoByOwnerIdMock
              .mockResolvedValue(
                updatedCompany
              );

            const result =
              await uploadOwnedCompanyLogo(
                ownerId,
                file
              );

            expect(
              deleteCloudinaryAssetMock
            ).toHaveBeenCalledWith(
              oldPublicId,
              "image"
            );

            expect(result).toBe(
              updatedCompany
            );
          }
        );

        test(
          "does not delete the old asset when Cloudinary returns the same public ID",
          async () => {
            const samePublicId =
              `careerforge/company-logos/company-${companyId}-logo`;

            const company = {
              id:
                companyId,

              ownerId,

              logoUrl:
                "https://res.cloudinary.com/demo/old-logo.png",

              logoPublicId:
                samePublicId
            };

            const uploadResult = {
              secure_url:
                "https://res.cloudinary.com/demo/new-logo.png",

              public_id:
                samePublicId
            };

            findCompanyByOwnerIdMock
              .mockResolvedValue(
                company
              );

            uploadCompanyLogoMock
              .mockResolvedValue(
                uploadResult
              );

            updateCompanyLogoByOwnerIdMock
              .mockResolvedValue({
                ...company,

                logoUrl:
                  uploadResult.secure_url
              });

            await uploadOwnedCompanyLogo(
              ownerId,
              file
            );

            expect(
              deleteCloudinaryAssetMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "continues successfully when old logo cleanup fails",
          async () => {
            const company = {
              id:
                companyId,

              ownerId,

              logoPublicId:
                "old-public-id"
            };

            const uploadResult = {
              secure_url:
                "https://res.cloudinary.com/demo/new-logo.png",

              public_id:
                "new-public-id"
            };

            const updatedCompany = {
              ...company,

              logoUrl:
                uploadResult.secure_url,

              logoPublicId:
                uploadResult.public_id
            };

            findCompanyByOwnerIdMock
              .mockResolvedValue(
                company
              );

            uploadCompanyLogoMock
              .mockResolvedValue(
                uploadResult
              );

            updateCompanyLogoByOwnerIdMock
              .mockResolvedValue(
                updatedCompany
              );

            deleteCloudinaryAssetMock
              .mockRejectedValueOnce(
                new Error(
                  "Cloudinary cleanup failed"
                )
              );

            const consoleErrorSpy =
              jest
                .spyOn(
                  console,
                  "error"
                )
                .mockImplementation(
                  () => {}
                );

            const result =
              await uploadOwnedCompanyLogo(
                ownerId,
                file
              );

            expect(result).toBe(
              updatedCompany
            );

            expect(
              consoleErrorSpy
            ).toHaveBeenCalled();

            consoleErrorSpy
              .mockRestore();
          }
        );

        test(
          "deletes the newly uploaded asset when database update fails",
          async () => {
            const company = {
              id:
                companyId,

              ownerId,

              logoPublicId:
                null
            };

            const uploadResult = {
              secure_url:
                "https://res.cloudinary.com/demo/new-logo.png",

              public_id:
                "new-public-id"
            };

            const databaseError =
              new Error(
                "Database update failed"
              );

            findCompanyByOwnerIdMock
              .mockResolvedValue(
                company
              );

            uploadCompanyLogoMock
              .mockResolvedValue(
                uploadResult
              );

            updateCompanyLogoByOwnerIdMock
              .mockRejectedValue(
                databaseError
              );

            await expect(
              uploadOwnedCompanyLogo(
                ownerId,
                file
              )
            ).rejects.toBe(
              databaseError
            );

            expect(
              deleteCloudinaryAssetMock
            ).toHaveBeenCalledWith(
              uploadResult.public_id,
              "image"
            );
          }
        );

        test(
          "rolls back the uploaded asset when repository returns null",
          async () => {
            const company = {
              id:
                companyId,

              ownerId,

              logoPublicId:
                null
            };

            const uploadResult = {
              secure_url:
                "https://res.cloudinary.com/demo/new-logo.png",

              public_id:
                "new-public-id"
            };

            findCompanyByOwnerIdMock
              .mockResolvedValue(
                company
              );

            uploadCompanyLogoMock
              .mockResolvedValue(
                uploadResult
              );

            updateCompanyLogoByOwnerIdMock
              .mockResolvedValue(
                null
              );

            await expect(
              uploadOwnedCompanyLogo(
                ownerId,
                file
              )
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  500,

                code:
                  "COMPANY_LOGO_UPDATE_FAILED"
              })
            );

            expect(
              deleteCloudinaryAssetMock
            ).toHaveBeenCalledWith(
              uploadResult.public_id,
              "image"
            );
          }
        );

        test(
          "throws when the company does not exist",
          async () => {
            findCompanyByOwnerIdMock
              .mockResolvedValue(
                null
              );

            await expect(
              uploadOwnedCompanyLogo(
                ownerId,
                file
              )
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  404,

                code:
                  "COMPANY_NOT_FOUND"
              })
            );

            expect(
              uploadCompanyLogoMock
            ).not.toHaveBeenCalled();

            expect(
              updateCompanyLogoByOwnerIdMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "stops before repository and Cloudinary calls when validation fails",
          async () => {
            const validationError =
              Object.assign(
                new Error(
                  "Unsupported company logo"
                ),
                {
                  statusCode:
                    415,

                  code:
                    "UNSUPPORTED_FILE_TYPE"
                }
              );

            validateCompanyLogoMock
              .mockImplementation(
                () => {
                  throw validationError;
                }
              );

            await expect(
              uploadOwnedCompanyLogo(
                ownerId,
                file
              )
            ).rejects.toBe(
              validationError
            );

            expect(
              findCompanyByOwnerIdMock
            ).not.toHaveBeenCalled();

            expect(
              uploadCompanyLogoMock
            ).not.toHaveBeenCalled();

            expect(
              updateCompanyLogoByOwnerIdMock
            ).not.toHaveBeenCalled();
          }
        );
      }
    );

    describe(
      "deleteOwnedCompanyLogo",
      () => {
        test(
          "deletes the Cloudinary asset and clears database logo fields",
          async () => {
            const company = {
              id:
                companyId,

              ownerId,

              logoUrl:
                "https://res.cloudinary.com/demo/company-logo.png",

              logoPublicId:
                "careerforge/company-logos/company-logo"
            };

            const clearedCompany = {
              ...company,

              logoUrl:
                null,

              logoPublicId:
                null
            };

            findCompanyByOwnerIdMock
              .mockResolvedValue(
                company
              );

            clearCompanyLogoByOwnerIdMock
              .mockResolvedValue(
                clearedCompany
              );

            const result =
              await deleteOwnedCompanyLogo(
                ownerId
              );

            expect(
              deleteCloudinaryAssetMock
            ).toHaveBeenCalledWith(
              company.logoPublicId,
              "image"
            );

            expect(
              clearCompanyLogoByOwnerIdMock
            ).toHaveBeenCalledWith(
              ownerId
            );

            expect(result).toBe(
              clearedCompany
            );
          }
        );

        test(
          "throws when company does not exist",
          async () => {
            findCompanyByOwnerIdMock
              .mockResolvedValue(
                null
              );

            await expect(
              deleteOwnedCompanyLogo(
                ownerId
              )
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  404,

                code:
                  "COMPANY_NOT_FOUND"
              })
            );

            expect(
              deleteCloudinaryAssetMock
            ).not.toHaveBeenCalled();

            expect(
              clearCompanyLogoByOwnerIdMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "throws when the company has no logo",
          async () => {
            findCompanyByOwnerIdMock
              .mockResolvedValue({
                id:
                  companyId,

                ownerId,

                logoUrl:
                  null,

                logoPublicId:
                  null
              });

            await expect(
              deleteOwnedCompanyLogo(
                ownerId
              )
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  404,

                code:
                  "COMPANY_LOGO_NOT_FOUND"
              })
            );

            expect(
              deleteCloudinaryAssetMock
            ).not.toHaveBeenCalled();

            expect(
              clearCompanyLogoByOwnerIdMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "throws when database logo clearing fails",
          async () => {
            const company = {
              id:
                companyId,

              ownerId,

              logoUrl:
                "https://res.cloudinary.com/demo/company-logo.png",

              logoPublicId:
                "company-logo-public-id"
            };

            findCompanyByOwnerIdMock
              .mockResolvedValue(
                company
              );

            clearCompanyLogoByOwnerIdMock
              .mockResolvedValue(
                null
              );

            await expect(
              deleteOwnedCompanyLogo(
                ownerId
              )
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  500,

                code:
                  "COMPANY_LOGO_DELETE_FAILED"
              })
            );

            expect(
              deleteCloudinaryAssetMock
            ).toHaveBeenCalledWith(
              company.logoPublicId,
              "image"
            );
          }
        );

        test(
          "does not clear database fields when Cloudinary deletion fails",
          async () => {
            const company = {
              id:
                companyId,

              ownerId,

              logoPublicId:
                "company-logo-public-id"
            };

            const cloudinaryError =
              new Error(
                "Cloudinary deletion failed"
              );

            findCompanyByOwnerIdMock
              .mockResolvedValue(
                company
              );

            deleteCloudinaryAssetMock
              .mockRejectedValue(
                cloudinaryError
              );

            await expect(
              deleteOwnedCompanyLogo(
                ownerId
              )
            ).rejects.toBe(
              cloudinaryError
            );

            expect(
              clearCompanyLogoByOwnerIdMock
            ).not.toHaveBeenCalled();
          }
        );
      }
    );
  }
);