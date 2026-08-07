import {
  jest
} from "@jest/globals";

const findJobSeekerProfileByUserIdMock =
  jest.fn();

const updateJobSeekerUploadsByUserIdMock =
  jest.fn();

const clearJobSeekerProfileImageByUserIdMock =
  jest.fn();

const clearJobSeekerResumeByUserIdMock =
  jest.fn();

const uploadProfileImageMock =
  jest.fn();

const uploadResumeMock =
  jest.fn();

const deleteCloudinaryAssetMock =
  jest.fn();

const validateProfileImageMock =
  jest.fn();

const validateResumeMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/jobSeekerProfile.repository.js",
  () => ({
    findJobSeekerProfileByUserId:
      findJobSeekerProfileByUserIdMock,

    updateJobSeekerUploadsByUserId:
      updateJobSeekerUploadsByUserIdMock,

    clearJobSeekerProfileImageByUserId:
      clearJobSeekerProfileImageByUserIdMock,

    clearJobSeekerResumeByUserId:
      clearJobSeekerResumeByUserIdMock
  })
);

jest.unstable_mockModule(
  "../../utils/cloudinaryUpload.js",
  () => ({
    uploadProfileImage:
      uploadProfileImageMock,

    uploadResume:
      uploadResumeMock,

    deleteCloudinaryAsset:
      deleteCloudinaryAssetMock
  })
);

jest.unstable_mockModule(
  "../../utils/fileValidation.js",
  () => ({
    validateProfileImage:
      validateProfileImageMock,

    validateResume:
      validateResumeMock
  })
);

const {
  uploadJobSeekerProfileImage,
  uploadJobSeekerResume,
  deleteJobSeekerProfileImage,
  deleteJobSeekerResume
} = await import(
  "../../services/jobSeekerUpload.service.js"
);

describe(
  "Job seeker upload service",
  () => {
    const userId =
      "11111111-1111-1111-1111-111111111111";

    const profileId =
      "22222222-2222-2222-2222-222222222222";

    const profileImageFile = {
      fieldname:
        "profileImage",

      originalname:
        "profile.png",

      mimetype:
        "image/png",

      size:
        1024,

      buffer:
        Buffer.from(
          "profile-image-content"
        )
    };

    const resumeFile = {
      fieldname:
        "resume",

      originalname:
        "resume.pdf",

      mimetype:
        "application/pdf",

      size:
        2048,

      buffer:
        Buffer.from(
          "resume-content"
        )
    };

    const createProfile = (
      overrides = {}
    ) => ({
      id:
        profileId,

      userId,

      profileImageUrl:
        null,

      profileImagePublicId:
        null,

      resumeUrl:
        null,

      resumePublicId:
        null,

      resumeOriginalName:
        null,

      ...overrides
    });

    beforeEach(() => {
      jest.clearAllMocks();

      validateProfileImageMock
        .mockReturnValue({
          extension:
            ".png",

          originalName:
            profileImageFile.originalname,

          mimeType:
            profileImageFile.mimetype,

          size:
            profileImageFile.size
        });

      validateResumeMock
        .mockReturnValue({
          extension:
            ".pdf",

          originalName:
            resumeFile.originalname,

          mimeType:
            resumeFile.mimetype,

          size:
            resumeFile.size
        });

      deleteCloudinaryAssetMock
        .mockResolvedValue({
          result:
            "ok"
        });
    });

    describe(
      "uploadJobSeekerProfileImage",
      () => {
        test(
          "uploads and stores a profile image successfully",
          async () => {
            const profile =
              createProfile();

            const uploadResult = {
              secure_url:
                "https://example.com/profile.png",

              public_id:
                "job-seeker-profile-image"
            };

            const updatedProfile = {
              ...profile,

              profileImageUrl:
                uploadResult.secure_url,

              profileImagePublicId:
                uploadResult.public_id
            };

            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                profile
              );

            uploadProfileImageMock
              .mockResolvedValue(
                uploadResult
              );

            updateJobSeekerUploadsByUserIdMock
              .mockResolvedValue(
                updatedProfile
              );

            const result =
              await uploadJobSeekerProfileImage(
                userId,
                profileImageFile
              );

            expect(
              validateProfileImageMock
            ).toHaveBeenCalledWith(
              profileImageFile
            );

            expect(
              findJobSeekerProfileByUserIdMock
            ).toHaveBeenCalledWith(
              userId
            );

            expect(
              uploadProfileImageMock
            ).toHaveBeenCalledWith(
              profileImageFile.buffer,
              `job-seeker-${profileId}`
            );

            expect(
              updateJobSeekerUploadsByUserIdMock
            ).toHaveBeenCalledWith(
              userId,
              {
                profileImageUrl:
                  uploadResult.secure_url,

                profileImagePublicId:
                  uploadResult.public_id
              }
            );

            expect(
              deleteCloudinaryAssetMock
            ).not.toHaveBeenCalled();

            expect(result).toBe(
              updatedProfile
            );
          }
        );

        test(
          "replaces an old profile image",
          async () => {
            const profile =
              createProfile({
                profileImagePublicId:
                  "old-profile-image"
              });

            const uploadResult = {
              secure_url:
                "https://example.com/new-profile.png",

              public_id:
                "new-profile-image"
            };

            const updatedProfile = {
              ...profile,

              profileImageUrl:
                uploadResult.secure_url,

              profileImagePublicId:
                uploadResult.public_id
            };

            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                profile
              );

            uploadProfileImageMock
              .mockResolvedValue(
                uploadResult
              );

            updateJobSeekerUploadsByUserIdMock
              .mockResolvedValue(
                updatedProfile
              );

            const result =
              await uploadJobSeekerProfileImage(
                userId,
                profileImageFile
              );

            expect(
              deleteCloudinaryAssetMock
            ).toHaveBeenCalledWith(
              "old-profile-image",
              "image"
            );

            expect(result).toBe(
              updatedProfile
            );
          }
        );

        test(
          "does not delete the old image when public IDs are equal",
          async () => {
            const samePublicId =
              "same-profile-image";

            const profile =
              createProfile({
                profileImagePublicId:
                  samePublicId
              });

            const uploadResult = {
              secure_url:
                "https://example.com/profile.png",

              public_id:
                samePublicId
            };

            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                profile
              );

            uploadProfileImageMock
              .mockResolvedValue(
                uploadResult
              );

            updateJobSeekerUploadsByUserIdMock
              .mockResolvedValue({
                ...profile,

                profileImageUrl:
                  uploadResult.secure_url
              });

            await uploadJobSeekerProfileImage(
              userId,
              profileImageFile
            );

            expect(
              deleteCloudinaryAssetMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "continues when old profile image cleanup fails",
          async () => {
            const profile =
              createProfile({
                profileImagePublicId:
                  "old-profile-image"
              });

            const uploadResult = {
              secure_url:
                "https://example.com/new-profile.png",

              public_id:
                "new-profile-image"
            };

            const updatedProfile = {
              ...profile,

              profileImageUrl:
                uploadResult.secure_url,

              profileImagePublicId:
                uploadResult.public_id
            };

            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                profile
              );

            uploadProfileImageMock
              .mockResolvedValue(
                uploadResult
              );

            updateJobSeekerUploadsByUserIdMock
              .mockResolvedValue(
                updatedProfile
              );

            deleteCloudinaryAssetMock
              .mockRejectedValueOnce(
                new Error(
                  "Cleanup failed"
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
              await uploadJobSeekerProfileImage(
                userId,
                profileImageFile
              );

            expect(result).toBe(
              updatedProfile
            );

            expect(
              consoleErrorSpy
            ).toHaveBeenCalled();

            consoleErrorSpy
              .mockRestore();
          }
        );

        test(
          "deletes the newly uploaded image when database update fails",
          async () => {
            const databaseError =
              new Error(
                "Database update failed"
              );

            const uploadResult = {
              secure_url:
                "https://example.com/profile.png",

              public_id:
                "new-profile-image"
            };

            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                createProfile()
              );

            uploadProfileImageMock
              .mockResolvedValue(
                uploadResult
              );

            updateJobSeekerUploadsByUserIdMock
              .mockRejectedValue(
                databaseError
              );

            await expect(
              uploadJobSeekerProfileImage(
                userId,
                profileImageFile
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
          "throws when the job seeker profile does not exist",
          async () => {
            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                null
              );

            await expect(
              uploadJobSeekerProfileImage(
                userId,
                profileImageFile
              )
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  404,

                code:
                  "JOB_SEEKER_PROFILE_NOT_FOUND"
              })
            );

            expect(
              uploadProfileImageMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "stops when profile image validation fails",
          async () => {
            const validationError =
              Object.assign(
                new Error(
                  "Unsupported profile image"
                ),
                {
                  statusCode:
                    415,

                  code:
                    "UNSUPPORTED_FILE_TYPE"
                }
              );

            validateProfileImageMock
              .mockImplementation(
                () => {
                  throw validationError;
                }
              );

            await expect(
              uploadJobSeekerProfileImage(
                userId,
                profileImageFile
              )
            ).rejects.toBe(
              validationError
            );

            expect(
              findJobSeekerProfileByUserIdMock
            ).not.toHaveBeenCalled();

            expect(
              uploadProfileImageMock
            ).not.toHaveBeenCalled();
          }
        );
      }
    );

    describe(
      "uploadJobSeekerResume",
      () => {
        test(
          "uploads and stores a resume successfully",
          async () => {
            const profile =
              createProfile();

            const uploadResult = {
              secure_url:
                "https://example.com/resume.pdf",

              public_id:
                "job-seeker-resume"
            };

            const updatedProfile = {
              ...profile,

              resumeUrl:
                uploadResult.secure_url,

              resumePublicId:
                uploadResult.public_id,

              resumeOriginalName:
                resumeFile.originalname
            };

            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                profile
              );

            uploadResumeMock
              .mockResolvedValue(
                uploadResult
              );

            updateJobSeekerUploadsByUserIdMock
              .mockResolvedValue(
                updatedProfile
              );

            const result =
              await uploadJobSeekerResume(
                userId,
                resumeFile
              );

            expect(
              validateResumeMock
            ).toHaveBeenCalledWith(
              resumeFile
            );

            expect(
              uploadResumeMock
            ).toHaveBeenCalledWith(
              resumeFile.buffer,
              `job-seeker-${profileId}-resume`
            );

            expect(
              updateJobSeekerUploadsByUserIdMock
            ).toHaveBeenCalledWith(
              userId,
              {
                resumeUrl:
                  uploadResult.secure_url,

                resumePublicId:
                  uploadResult.public_id,

                resumeOriginalName:
                  resumeFile.originalname
              }
            );

            expect(result).toBe(
              updatedProfile
            );
          }
        );

        test(
          "replaces an old resume",
          async () => {
            const profile =
              createProfile({
                resumePublicId:
                  "old-resume"
              });

            const uploadResult = {
              secure_url:
                "https://example.com/new-resume.pdf",

              public_id:
                "new-resume"
            };

            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                profile
              );

            uploadResumeMock
              .mockResolvedValue(
                uploadResult
              );

            updateJobSeekerUploadsByUserIdMock
              .mockResolvedValue({
                ...profile,

                resumeUrl:
                  uploadResult.secure_url,

                resumePublicId:
                  uploadResult.public_id
              });

            await uploadJobSeekerResume(
              userId,
              resumeFile
            );

            expect(
              deleteCloudinaryAssetMock
            ).toHaveBeenCalledWith(
              "old-resume",
              "raw"
            );
          }
        );

        test(
          "does not delete old resume when public IDs are equal",
          async () => {
            const samePublicId =
              "same-resume";

            const profile =
              createProfile({
                resumePublicId:
                  samePublicId
              });

            const uploadResult = {
              secure_url:
                "https://example.com/resume.pdf",

              public_id:
                samePublicId
            };

            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                profile
              );

            uploadResumeMock
              .mockResolvedValue(
                uploadResult
              );

            updateJobSeekerUploadsByUserIdMock
              .mockResolvedValue(
                profile
              );

            await uploadJobSeekerResume(
              userId,
              resumeFile
            );

            expect(
              deleteCloudinaryAssetMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "deletes newly uploaded resume when database update fails",
          async () => {
            const databaseError =
              new Error(
                "Database update failed"
              );

            const uploadResult = {
              secure_url:
                "https://example.com/resume.pdf",

              public_id:
                "new-resume"
            };

            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                createProfile()
              );

            uploadResumeMock
              .mockResolvedValue(
                uploadResult
              );

            updateJobSeekerUploadsByUserIdMock
              .mockRejectedValue(
                databaseError
              );

            await expect(
              uploadJobSeekerResume(
                userId,
                resumeFile
              )
            ).rejects.toBe(
              databaseError
            );

            expect(
              deleteCloudinaryAssetMock
            ).toHaveBeenCalledWith(
              uploadResult.public_id,
              "raw"
            );
          }
        );

        test(
          "stops when resume validation fails",
          async () => {
            const validationError =
              Object.assign(
                new Error(
                  "Unsupported resume"
                ),
                {
                  statusCode:
                    415,

                  code:
                    "UNSUPPORTED_FILE_TYPE"
                }
              );

            validateResumeMock
              .mockImplementation(
                () => {
                  throw validationError;
                }
              );

            await expect(
              uploadJobSeekerResume(
                userId,
                resumeFile
              )
            ).rejects.toBe(
              validationError
            );

            expect(
              findJobSeekerProfileByUserIdMock
            ).not.toHaveBeenCalled();

            expect(
              uploadResumeMock
            ).not.toHaveBeenCalled();
          }
        );
      }
    );

    describe(
      "deleteJobSeekerProfileImage",
      () => {
        test(
          "deletes profile image successfully",
          async () => {
            const profile =
              createProfile({
                profileImagePublicId:
                  "profile-image-public-id"
              });

            const clearedProfile =
              createProfile();

            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                profile
              );

            clearJobSeekerProfileImageByUserIdMock
              .mockResolvedValue(
                clearedProfile
              );

            const result =
              await deleteJobSeekerProfileImage(
                userId
              );

            expect(
              deleteCloudinaryAssetMock
            ).toHaveBeenCalledWith(
              profile.profileImagePublicId,
              "image"
            );

            expect(
              clearJobSeekerProfileImageByUserIdMock
            ).toHaveBeenCalledWith(
              userId
            );

            expect(result).toBe(
              clearedProfile
            );
          }
        );

        test(
          "throws when profile image does not exist",
          async () => {
            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                createProfile()
              );

            await expect(
              deleteJobSeekerProfileImage(
                userId
              )
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  404,

                code:
                  "PROFILE_IMAGE_NOT_FOUND"
              })
            );

            expect(
              deleteCloudinaryAssetMock
            ).not.toHaveBeenCalled();
          }
        );
      }
    );

    describe(
      "deleteJobSeekerResume",
      () => {
        test(
          "deletes resume successfully",
          async () => {
            const profile =
              createProfile({
                resumePublicId:
                  "resume-public-id"
              });

            const clearedProfile =
              createProfile();

            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                profile
              );

            clearJobSeekerResumeByUserIdMock
              .mockResolvedValue(
                clearedProfile
              );

            const result =
              await deleteJobSeekerResume(
                userId
              );

            expect(
              deleteCloudinaryAssetMock
            ).toHaveBeenCalledWith(
              profile.resumePublicId,
              "raw"
            );

            expect(
              clearJobSeekerResumeByUserIdMock
            ).toHaveBeenCalledWith(
              userId
            );

            expect(result).toBe(
              clearedProfile
            );
          }
        );

        test(
          "throws when resume does not exist",
          async () => {
            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                createProfile()
              );

            await expect(
              deleteJobSeekerResume(
                userId
              )
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  404,

                code:
                  "RESUME_NOT_FOUND"
              })
            );

            expect(
              deleteCloudinaryAssetMock
            ).not.toHaveBeenCalled();
          }
        );
      }
    );
  }
);