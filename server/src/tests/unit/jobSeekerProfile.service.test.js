import {
  jest
} from "@jest/globals";

const findJobSeekerProfileByUserIdMock =
  jest.fn();

const findOrCreateJobSeekerProfileMock =
  jest.fn();

const updateJobSeekerProfileByUserIdMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/jobSeekerProfile.repository.js",
  () => ({
    findJobSeekerProfileByUserId:
      findJobSeekerProfileByUserIdMock,

    findOrCreateJobSeekerProfile:
      findOrCreateJobSeekerProfileMock,

    updateJobSeekerProfileByUserId:
      updateJobSeekerProfileByUserIdMock
  })
);

const {
  getJobSeekerProfile,
  updateJobSeekerProfile
} = await import(
  "../../services/jobSeekerProfile.service.js"
);

describe(
  "Job seeker profile service",
  () => {
    const userId =
      "11111111-1111-1111-1111-111111111111";

    const profileId =
      "22222222-2222-2222-2222-222222222222";

    const profile = {
      id:
        profileId,

      userId,

      firstName:
        "Chandra",

      lastName:
        "Sekhar",

      headline:
        "Java Backend Developer"
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe(
      "getJobSeekerProfile",
      () => {
        test(
          "returns an existing job seeker profile",
          async () => {
            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                profile
              );

            const result =
              await getJobSeekerProfile({
                userId
              });

            expect(
              findJobSeekerProfileByUserIdMock
            ).toHaveBeenCalledWith(
              userId
            );

            expect(
              findOrCreateJobSeekerProfileMock
            ).not.toHaveBeenCalled();

            expect(result).toBe(
              profile
            );
          }
        );

        test(
          "creates and returns a profile when one does not exist",
          async () => {
            const createdProfile = {
              id:
                profileId,

              userId
            };

            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                null
              );

            findOrCreateJobSeekerProfileMock
              .mockResolvedValue({
                profile:
                  createdProfile,

                created:
                  true
              });

            const result =
              await getJobSeekerProfile({
                userId
              });

            expect(
              findOrCreateJobSeekerProfileMock
            ).toHaveBeenCalledWith(
              userId
            );

            expect(result).toBe(
              createdProfile
            );
          }
        );

        test(
          "returns an existing profile returned by findOrCreate",
          async () => {
            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                null
              );

            findOrCreateJobSeekerProfileMock
              .mockResolvedValue({
                profile,

                created:
                  false
              });

            const result =
              await getJobSeekerProfile({
                userId
              });

            expect(result).toBe(
              profile
            );
          }
        );

        test(
          "propagates profile lookup errors",
          async () => {
            const databaseError =
              new Error(
                "Profile lookup failed"
              );

            findJobSeekerProfileByUserIdMock
              .mockRejectedValue(
                databaseError
              );

            await expect(
              getJobSeekerProfile({
                userId
              })
            ).rejects.toBe(
              databaseError
            );

            expect(
              findOrCreateJobSeekerProfileMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "propagates find-or-create errors",
          async () => {
            const databaseError =
              new Error(
                "Profile creation failed"
              );

            findJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                null
              );

            findOrCreateJobSeekerProfileMock
              .mockRejectedValue(
                databaseError
              );

            await expect(
              getJobSeekerProfile({
                userId
              })
            ).rejects.toBe(
              databaseError
            );
          }
        );
      }
    );

    describe(
      "updateJobSeekerProfile",
      () => {
        test(
          "updates and returns an existing profile",
          async () => {
            const profileData = {
              firstName:
                "Chandra",

              lastName:
                "Sekhar",

              headline:
                "Updated Backend Developer"
            };

            const updatedProfile = {
              ...profile,
              ...profileData
            };

            updateJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                updatedProfile
              );

            const result =
              await updateJobSeekerProfile({
                userId,
                profileData
              });

            expect(
              updateJobSeekerProfileByUserIdMock
            ).toHaveBeenCalledWith(
              userId,
              profileData
            );

            expect(
              findOrCreateJobSeekerProfileMock
            ).not.toHaveBeenCalled();

            expect(result).toBe(
              updatedProfile
            );
          }
        );

        test(
          "creates a missing profile and updates it",
          async () => {
            const profileData = {
              firstName:
                "Chandra",

              headline:
                "Java Developer"
            };

            const createdProfile = {
              id:
                profileId,

              userId
            };

            const updatedProfile = {
              ...createdProfile,
              ...profileData
            };

            updateJobSeekerProfileByUserIdMock
              .mockResolvedValueOnce(
                null
              )
              .mockResolvedValueOnce(
                updatedProfile
              );

            findOrCreateJobSeekerProfileMock
              .mockResolvedValue({
                profile:
                  createdProfile,

                created:
                  true
              });

            const result =
              await updateJobSeekerProfile({
                userId,
                profileData
              });

            expect(
              findOrCreateJobSeekerProfileMock
            ).toHaveBeenCalledWith(
              userId
            );

            expect(
              updateJobSeekerProfileByUserIdMock
            ).toHaveBeenCalledTimes(
              2
            );

            expect(
              updateJobSeekerProfileByUserIdMock
            ).toHaveBeenNthCalledWith(
              1,
              userId,
              profileData
            );

            expect(
              updateJobSeekerProfileByUserIdMock
            ).toHaveBeenNthCalledWith(
              2,
              userId,
              profileData
            );

            expect(result).toBe(
              updatedProfile
            );
          }
        );

        test(
          "throws when findOrCreate returns no profile",
          async () => {
            const profileData = {
              firstName:
                "Chandra"
            };

            updateJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                null
              );

            findOrCreateJobSeekerProfileMock
              .mockResolvedValue({
                profile:
                  null,

                created:
                  false
              });

            await expect(
              updateJobSeekerProfile({
                userId,
                profileData
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  500,

                code:
                  "JOB_SEEKER_PROFILE_UPDATE_FAILED"
              })
            );

            expect(
              updateJobSeekerProfileByUserIdMock
            ).toHaveBeenCalledTimes(
              2
            );
          }
        );

        test(
          "throws when profile still cannot be updated after creation",
          async () => {
            const profileData = {
              firstName:
                "Chandra"
            };

            updateJobSeekerProfileByUserIdMock
              .mockResolvedValue(
                null
              );

            findOrCreateJobSeekerProfileMock
              .mockResolvedValue({
                profile: {
                  id:
                    profileId,

                  userId
                },

                created:
                  true
              });

            await expect(
              updateJobSeekerProfile({
                userId,
                profileData
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  500,

                code:
                  "JOB_SEEKER_PROFILE_UPDATE_FAILED"
              })
            );
          }
        );

        test(
          "propagates the initial update error",
          async () => {
            const databaseError =
              new Error(
                "Profile update failed"
              );

            updateJobSeekerProfileByUserIdMock
              .mockRejectedValue(
                databaseError
              );

            await expect(
              updateJobSeekerProfile({
                userId,

                profileData: {
                  firstName:
                    "Chandra"
                }
              })
            ).rejects.toBe(
              databaseError
            );

            expect(
              findOrCreateJobSeekerProfileMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "propagates find-or-create errors during update",
          async () => {
            const databaseError =
              new Error(
                "Profile creation failed"
              );

            updateJobSeekerProfileByUserIdMock
              .mockResolvedValueOnce(
                null
              );

            findOrCreateJobSeekerProfileMock
              .mockRejectedValue(
                databaseError
              );

            await expect(
              updateJobSeekerProfile({
                userId,

                profileData: {
                  firstName:
                    "Chandra"
                }
              })
            ).rejects.toBe(
              databaseError
            );

            expect(
              updateJobSeekerProfileByUserIdMock
            ).toHaveBeenCalledTimes(
              1
            );
          }
        );

        test(
          "propagates the second update error after profile creation",
          async () => {
            const databaseError =
              new Error(
                "Second update failed"
              );

            updateJobSeekerProfileByUserIdMock
              .mockResolvedValueOnce(
                null
              )
              .mockRejectedValueOnce(
                databaseError
              );

            findOrCreateJobSeekerProfileMock
              .mockResolvedValue({
                profile: {
                  id:
                    profileId,

                  userId
                },

                created:
                  true
              });

            await expect(
              updateJobSeekerProfile({
                userId,

                profileData: {
                  firstName:
                    "Chandra"
                }
              })
            ).rejects.toBe(
              databaseError
            );

            expect(
              updateJobSeekerProfileByUserIdMock
            ).toHaveBeenCalledTimes(
              2
            );
          }
        );
      }
    );
  }
);