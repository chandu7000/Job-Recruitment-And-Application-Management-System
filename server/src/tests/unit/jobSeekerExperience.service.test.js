import {
  jest
} from "@jest/globals";

const transactionMock =
  jest.fn();

const findOrCreateProfileMock =
  jest.fn();

const createExperienceMock =
  jest.fn();

const findExperiencesMock =
  jest.fn();

const findExperienceByIdMock =
  jest.fn();

const updateExperienceMock =
  jest.fn();

const deleteExperienceMock =
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
  "../../repositories/jobSeekerProfile.repository.js",
  () => ({
    findOrCreateJobSeekerProfile:
      findOrCreateProfileMock
  })
);

jest.unstable_mockModule(
  "../../repositories/jobSeekerExperience.repository.js",
  () => ({
    createJobSeekerExperience:
      createExperienceMock,

    findJobSeekerExperiencesByProfileId:
      findExperiencesMock,

    findJobSeekerExperienceByIdAndProfileId:
      findExperienceByIdMock,

    updateJobSeekerExperience:
      updateExperienceMock,

    deleteJobSeekerExperience:
      deleteExperienceMock
  })
);

const {
  getMyExperiences,
  addMyExperience,
  updateMyExperience,
  removeMyExperience
} = await import(
  "../../services/jobSeekerExperience.service.js"
);

describe(
  "Job seeker experience service",
  () => {
    const userId = "user-1";
    const profileId = "profile-1";
    const experienceId = "experience-1";

    const transaction = {
      LOCK: {
        UPDATE: "UPDATE"
      }
    };

    beforeEach(() => {
      jest.clearAllMocks();

      transactionMock.mockImplementation(
        async (callback) =>
          callback(transaction)
      );

      findOrCreateProfileMock
        .mockResolvedValue({
          profile: {
            id: profileId,
            userId
          },
          created: false
        });
    });

    test(
      "returns all experience entries",
      async () => {
        const experiences = [
          {
            id: experienceId
          }
        ];

        findExperiencesMock
          .mockResolvedValue(
            experiences
          );

        const result =
          await getMyExperiences({
            userId
          });

        expect(
          findExperiencesMock
        ).toHaveBeenCalledWith(
          profileId
        );

        expect(result).toBe(
          experiences
        );
      }
    );

    test(
      "adds a completed experience",
      async () => {
        const experienceData = {
          companyName:
            "Example Company",

          startDate:
            "2022-01-01",

          endDate:
            "2024-01-01",

          isCurrent:
            false
        };

        createExperienceMock
          .mockResolvedValue({
            id: experienceId
          });

        await addMyExperience({
          userId,
          experienceData
        });

        expect(
          createExperienceMock
        ).toHaveBeenCalledWith({
          ...experienceData,
          jobSeekerProfileId:
            profileId
        });
      }
    );

    test(
      "sets end date to null for current employment",
      async () => {
        createExperienceMock
          .mockResolvedValue({
            id: experienceId
          });

        await addMyExperience({
          userId,

          experienceData: {
            companyName:
              "Current Company",

            startDate:
              "2024-01-01",

            endDate:
              "2025-01-01",

            isCurrent:
              true
          }
        });

        expect(
          createExperienceMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            isCurrent: true,
            endDate: null
          })
        );
      }
    );

    test(
      "rejects end date earlier than start date",
      async () => {
        await expect(
          addMyExperience({
            userId,

            experienceData: {
              startDate:
                "2024-01-01",

              endDate:
                "2023-01-01",

              isCurrent:
                false
            }
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode: 400,
            code:
              "INVALID_EXPERIENCE_DATE_RANGE"
          })
        );

        expect(
          createExperienceMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "updates an existing experience",
      async () => {
        const experience = {
          id: experienceId,
          startDate:
            "2022-01-01",
          endDate:
            "2024-01-01",
          isCurrent:
            false
        };

        findExperienceByIdMock
          .mockResolvedValue(
            experience
          );

        updateExperienceMock
          .mockResolvedValue({
            ...experience,
            companyName:
              "Updated Company"
          });

        await updateMyExperience({
          userId,
          experienceId,

          experienceData: {
            companyName:
              "Updated Company"
          }
        });

        expect(
          updateExperienceMock
        ).toHaveBeenCalledWith(
          experience,
          {
            companyName:
              "Updated Company"
          },
          {
            transaction
          }
        );
      }
    );

    test(
      "sets end date to null when updated to current employment",
      async () => {
        const experience = {
          id: experienceId,
          startDate:
            "2022-01-01",
          endDate:
            "2024-01-01",
          isCurrent:
            false
        };

        findExperienceByIdMock
          .mockResolvedValue(
            experience
          );

        updateExperienceMock
          .mockResolvedValue({
            ...experience,
            isCurrent: true,
            endDate: null
          });

        await updateMyExperience({
          userId,
          experienceId,

          experienceData: {
            isCurrent: true
          }
        });

        expect(
          updateExperienceMock
        ).toHaveBeenCalledWith(
          experience,
          {
            isCurrent: true,
            endDate: null
          },
          {
            transaction
          }
        );
      }
    );

    test(
      "throws when experience is not found for update",
      async () => {
        findExperienceByIdMock
          .mockResolvedValue(
            null
          );

        await expect(
          updateMyExperience({
            userId,
            experienceId,
            experienceData: {}
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode: 404,
            code:
              "JOB_SEEKER_EXPERIENCE_NOT_FOUND"
          })
        );
      }
    );

    test(
      "removes an existing experience",
      async () => {
        const experience = {
          id: experienceId
        };

        findExperienceByIdMock
          .mockResolvedValue(
            experience
          );

        const result =
          await removeMyExperience({
            userId,
            experienceId
          });

        expect(
          deleteExperienceMock
        ).toHaveBeenCalledWith(
          experience,
          {
            transaction
          }
        );

        expect(result).toBeUndefined();
      }
    );

    test(
      "throws when experience is not found for removal",
      async () => {
        findExperienceByIdMock
          .mockResolvedValue(
            null
          );

        await expect(
          removeMyExperience({
            userId,
            experienceId
          })
        ).rejects.toEqual(
          expect.objectContaining({
            code:
              "JOB_SEEKER_EXPERIENCE_NOT_FOUND"
          })
        );

        expect(
          deleteExperienceMock
        ).not.toHaveBeenCalled();
      }
    );
  }
);