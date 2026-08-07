import {
  jest
} from "@jest/globals";

const createRecruiterProfileMock =
  jest.fn();

const findRecruiterProfileByUserIdMock =
  jest.fn();

const updateRecruiterProfileByUserIdMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/recruiterProfile.repository.js",
  () => ({
    createRecruiterProfile:
      createRecruiterProfileMock,

    findRecruiterProfileByUserId:
      findRecruiterProfileByUserIdMock,

    updateRecruiterProfileByUserId:
      updateRecruiterProfileByUserIdMock
  })
);

const {
  getRecruiterProfile,
  updateRecruiterProfile,
  validateRecruiterProfileOwnership
} = await import(
  "../../services/recruiterProfile.service.js"
);

describe(
  "Recruiter profile service",
  () => {
    const userId =
      "11111111-1111-1111-1111-111111111111";

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "returns an existing recruiter profile",
      async () => {
        const existingProfile = {
          id:
            "22222222-2222-2222-2222-222222222222",

          userId,

          firstName:
            "Chandra"
        };

        findRecruiterProfileByUserIdMock
          .mockResolvedValue(
            existingProfile
          );

        const result =
          await getRecruiterProfile({
            userId
          });

        expect(
          findRecruiterProfileByUserIdMock
        ).toHaveBeenCalledWith(
          userId
        );

        expect(
          createRecruiterProfileMock
        ).not.toHaveBeenCalled();

        expect(result).toBe(
          existingProfile
        );
      }
    );

    test(
      "creates a recruiter profile when one does not exist",
      async () => {
        const createdProfile = {
          id:
            "22222222-2222-2222-2222-222222222222",

          userId
        };

        findRecruiterProfileByUserIdMock
          .mockResolvedValue(
            null
          );

        createRecruiterProfileMock
          .mockResolvedValue(
            createdProfile
          );

        const result =
          await getRecruiterProfile({
            userId
          });

        expect(
          createRecruiterProfileMock
        ).toHaveBeenCalledWith({
          userId
        });

        expect(result).toBe(
          createdProfile
        );
      }
    );

    test(
      "returns the existing profile after a unique constraint race",
      async () => {
        const existingProfile = {
          id:
            "22222222-2222-2222-2222-222222222222",

          userId
        };

        findRecruiterProfileByUserIdMock
          .mockResolvedValueOnce(
            null
          )
          .mockResolvedValueOnce(
            existingProfile
          );

        createRecruiterProfileMock
          .mockRejectedValue({
            name:
              "SequelizeUniqueConstraintError"
          });

        const result =
          await getRecruiterProfile({
            userId
          });

        expect(
          findRecruiterProfileByUserIdMock
        ).toHaveBeenCalledTimes(
          2
        );

        expect(result).toBe(
          existingProfile
        );
      }
    );

    test(
      "throws when recruiter profile creation fails",
      async () => {
        findRecruiterProfileByUserIdMock
          .mockResolvedValue(
            null
          );

        createRecruiterProfileMock
          .mockRejectedValue(
            new Error(
              "Database failure"
            )
          );

        await expect(
          getRecruiterProfile({
            userId
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              500,

            code:
              "RECRUITER_PROFILE_CREATION_FAILED"
          })
        );
      }
    );

    test(
      "throws when unique constraint occurs but profile still cannot be found",
      async () => {
        findRecruiterProfileByUserIdMock
          .mockResolvedValue(
            null
          );

        createRecruiterProfileMock
          .mockRejectedValue({
            name:
              "SequelizeUniqueConstraintError"
          });

        await expect(
          getRecruiterProfile({
            userId
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              500,

            code:
              "RECRUITER_PROFILE_CREATION_FAILED"
          })
        );

        expect(
          findRecruiterProfileByUserIdMock
        ).toHaveBeenCalledTimes(
          2
        );
      }
    );

    test(
      "updates an existing recruiter profile",
      async () => {
        const profileData = {
          firstName:
            "Chandra",

          designation:
            "Technical Recruiter"
        };

        const updatedProfile = {
          id:
            "22222222-2222-2222-2222-222222222222",

          userId,

          ...profileData
        };

        updateRecruiterProfileByUserIdMock
          .mockResolvedValue(
            updatedProfile
          );

        const result =
          await updateRecruiterProfile({
            userId,
            profileData
          });

        expect(
          updateRecruiterProfileByUserIdMock
        ).toHaveBeenCalledWith(
          userId,
          profileData
        );

        expect(
          createRecruiterProfileMock
        ).not.toHaveBeenCalled();

        expect(result).toBe(
          updatedProfile
        );
      }
    );

    test(
      "creates and then updates a missing recruiter profile",
      async () => {
        const profileData = {
          firstName:
            "Chandra"
        };

        const createdProfile = {
          id:
            "22222222-2222-2222-2222-222222222222",

          userId
        };

        const updatedProfile = {
          ...createdProfile,
          ...profileData
        };

        updateRecruiterProfileByUserIdMock
          .mockResolvedValueOnce(
            null
          )
          .mockResolvedValueOnce(
            updatedProfile
          );

        createRecruiterProfileMock
          .mockResolvedValue(
            createdProfile
          );

        const result =
          await updateRecruiterProfile({
            userId,
            profileData
          });

        expect(
          createRecruiterProfileMock
        ).toHaveBeenCalledWith({
          userId
        });

        expect(
          updateRecruiterProfileByUserIdMock
        ).toHaveBeenCalledTimes(
          2
        );

        expect(result).toBe(
          updatedProfile
        );
      }
    );

    test(
      "continues updating when profile creation hits a unique constraint",
      async () => {
        const profileData = {
          firstName:
            "Chandra"
        };

        const updatedProfile = {
          id:
            "22222222-2222-2222-2222-222222222222",

          userId,

          ...profileData
        };

        updateRecruiterProfileByUserIdMock
          .mockResolvedValueOnce(
            null
          )
          .mockResolvedValueOnce(
            updatedProfile
          );

        createRecruiterProfileMock
          .mockRejectedValue({
            name:
              "SequelizeUniqueConstraintError"
          });

        const result =
          await updateRecruiterProfile({
            userId,
            profileData
          });

        expect(
          updateRecruiterProfileByUserIdMock
        ).toHaveBeenCalledTimes(
          2
        );

        expect(result).toBe(
          updatedProfile
        );
      }
    );

    test(
      "throws when creating a missing profile fails",
      async () => {
        updateRecruiterProfileByUserIdMock
          .mockResolvedValue(
            null
          );

        createRecruiterProfileMock
          .mockRejectedValue(
            new Error(
              "Database failure"
            )
          );

        await expect(
          updateRecruiterProfile({
            userId,

            profileData: {
              firstName:
                "Chandra"
            }
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              500,

            code:
              "RECRUITER_PROFILE_CREATION_FAILED"
          })
        );
      }
    );

    test(
      "throws when recruiter profile still cannot be updated",
      async () => {
        updateRecruiterProfileByUserIdMock
          .mockResolvedValue(
            null
          );

        createRecruiterProfileMock
          .mockResolvedValue({
            id:
              "22222222-2222-2222-2222-222222222222",

            userId
          });

        await expect(
          updateRecruiterProfile({
            userId,

            profileData: {
              firstName:
                "Chandra"
            }
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              500,

            code:
              "RECRUITER_PROFILE_UPDATE_FAILED"
          })
        );

        expect(
          updateRecruiterProfileByUserIdMock
        ).toHaveBeenCalledTimes(
          2
        );
      }
    );

    test(
      "allows recruiter profile ownership",
      () => {
        expect(
          validateRecruiterProfileOwnership({
            authenticatedUserId:
              10,

            profileUserId:
              "10"
          })
        ).toBe(true);
      }
    );

    test(
      "rejects another recruiter's profile",
      () => {
        expect(() =>
          validateRecruiterProfileOwnership({
            authenticatedUserId:
              10,

            profileUserId:
              20
          })
        ).toThrow(
          expect.objectContaining({
            statusCode:
              403,

            code:
              "RECRUITER_PROFILE_ACCESS_FORBIDDEN"
          })
        );
      }
    );
  }
);