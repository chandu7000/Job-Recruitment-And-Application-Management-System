import {
  jest
} from "@jest/globals";

const transactionMock =
  jest.fn();

const findOrCreateProfileMock =
  jest.fn();

const createEducationMock =
  jest.fn();

const findEducationsMock =
  jest.fn();

const findEducationByIdMock =
  jest.fn();

const updateEducationMock =
  jest.fn();

const deleteEducationMock =
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
  "../../repositories/jobSeekerEducation.repository.js",
  () => ({
    createJobSeekerEducation:
      createEducationMock,

    findJobSeekerEducationsByProfileId:
      findEducationsMock,

    findJobSeekerEducationByIdAndProfileId:
      findEducationByIdMock,

    updateJobSeekerEducation:
      updateEducationMock,

    deleteJobSeekerEducation:
      deleteEducationMock
  })
);

const {
  getMyEducations,
  addMyEducation,
  updateMyEducation,
  removeMyEducation
} = await import(
  "../../services/jobSeekerEducation.service.js"
);

describe(
  "Job seeker education service",
  () => {
    const userId = "user-1";
    const profileId = "profile-1";
    const educationId = "education-1";

    const transaction = {
      LOCK: {
        UPDATE: "UPDATE"
      }
    };

    const profileResult = {
      profile: {
        id: profileId,
        userId
      },
      created: false
    };

    beforeEach(() => {
      jest.clearAllMocks();

      transactionMock.mockImplementation(
        async (callback) =>
          callback(transaction)
      );

      findOrCreateProfileMock
        .mockResolvedValue(
          profileResult
        );
    });

    test(
      "returns all education entries",
      async () => {
        const educations = [
          {
            id: educationId
          }
        ];

        findEducationsMock
          .mockResolvedValue(
            educations
          );

        const result =
          await getMyEducations({
            userId
          });

        expect(
          findEducationsMock
        ).toHaveBeenCalledWith(
          profileId
        );

        expect(result).toBe(
          educations
        );
      }
    );

    test(
      "adds a valid education entry",
      async () => {
        const educationData = {
          institutionName: "JNTUK",
          startDate: "2020-06-01",
          endDate: "2024-05-01"
        };

        const createdEducation = {
          id: educationId,
          ...educationData,
          jobSeekerProfileId:
            profileId
        };

        createEducationMock
          .mockResolvedValue(
            createdEducation
          );

        const result =
          await addMyEducation({
            userId,
            educationData
          });

        expect(
          createEducationMock
        ).toHaveBeenCalledWith({
          ...educationData,
          jobSeekerProfileId:
            profileId
        });

        expect(result).toBe(
          createdEducation
        );
      }
    );

    test(
      "rejects education with end date earlier than start date",
      async () => {
        await expect(
          addMyEducation({
            userId,

            educationData: {
              startDate:
                "2024-01-01",

              endDate:
                "2023-01-01"
            }
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode: 400,
            code:
              "INVALID_EDUCATION_DATE_RANGE"
          })
        );

        expect(
          findOrCreateProfileMock
        ).not.toHaveBeenCalled();

        expect(
          createEducationMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "updates an existing education entry",
      async () => {
        const education = {
          id: educationId,
          startDate:
            "2020-01-01",
          endDate:
            "2024-01-01"
        };

        const educationData = {
          endDate:
            "2024-06-01"
        };

        const updatedEducation = {
          ...education,
          ...educationData
        };

        findEducationByIdMock
          .mockResolvedValue(
            education
          );

        updateEducationMock
          .mockResolvedValue(
            updatedEducation
          );

        const result =
          await updateMyEducation({
            userId,
            educationId,
            educationData
          });

        expect(
          findEducationByIdMock
        ).toHaveBeenCalledWith(
          educationId,
          profileId,
          {
            transaction,
            lock:
              transaction.LOCK.UPDATE
          }
        );

        expect(
          updateEducationMock
        ).toHaveBeenCalledWith(
          education,
          educationData,
          {
            transaction
          }
        );

        expect(result).toBe(
          updatedEducation
        );
      }
    );

    test(
      "rejects invalid date range during update",
      async () => {
        findEducationByIdMock
          .mockResolvedValue({
            id: educationId,
            startDate:
              "2020-01-01",
            endDate:
              "2024-01-01"
          });

        await expect(
          updateMyEducation({
            userId,
            educationId,

            educationData: {
              startDate:
                "2025-01-01"
            }
          })
        ).rejects.toEqual(
          expect.objectContaining({
            code:
              "INVALID_EDUCATION_DATE_RANGE"
          })
        );

        expect(
          updateEducationMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "throws when education entry is not found for update",
      async () => {
        findEducationByIdMock
          .mockResolvedValue(
            null
          );

        await expect(
          updateMyEducation({
            userId,
            educationId,
            educationData: {}
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode: 404,
            code:
              "JOB_SEEKER_EDUCATION_NOT_FOUND"
          })
        );
      }
    );

    test(
      "removes an existing education entry",
      async () => {
        const education = {
          id: educationId
        };

        findEducationByIdMock
          .mockResolvedValue(
            education
          );

        const result =
          await removeMyEducation({
            userId,
            educationId
          });

        expect(
          deleteEducationMock
        ).toHaveBeenCalledWith(
          education,
          {
            transaction
          }
        );

        expect(result).toBeUndefined();
      }
    );

    test(
      "throws when education entry is not found for removal",
      async () => {
        findEducationByIdMock
          .mockResolvedValue(
            null
          );

        await expect(
          removeMyEducation({
            userId,
            educationId
          })
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode: 404,
            code:
              "JOB_SEEKER_EDUCATION_NOT_FOUND"
          })
        );

        expect(
          deleteEducationMock
        ).not.toHaveBeenCalled();
      }
    );
  }
);