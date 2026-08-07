import {
  jest
} from "@jest/globals";

const findProfileMock =
  jest.fn();

const findOrCreatePreferenceMock =
  jest.fn();

const findPreferenceMock =
  jest.fn();

const updatePreferenceMock =
  jest.fn();

const deletePreferenceMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/jobSeekerProfile.repository.js",
  () => ({
    findJobSeekerProfileByUserId:
      findProfileMock
  })
);

jest.unstable_mockModule(
  "../../repositories/jobSeekerJobPreference.repository.js",
  () => ({
    default: {
      findOrCreateByProfileId:
        findOrCreatePreferenceMock,

      findByProfileId:
        findPreferenceMock,

      update:
        updatePreferenceMock,

      delete:
        deletePreferenceMock
    }
  })
);

const {
  default: preferenceService
} = await import(
  "../../services/jobSeekerJobPreference.service.js"
);

describe(
  "Job seeker job preference service",
  () => {
    const userId = "user-1";
    const profileId = "profile-1";

    const defaultPreference = {
      preferredJobRoles: [],
      preferredLocations: [],
      employmentTypes: [],
      workModes: [],
      expectedSalary: null,
      salaryCurrency: "INR",
      noticePeriodDays: null,
      willingToRelocate: false,
      availabilityStatus:
        "OPEN_TO_OPPORTUNITIES"
    };

    beforeEach(() => {
      jest.clearAllMocks();

      findProfileMock.mockResolvedValue({
        id: profileId,
        userId
      });
    });

    test(
      "throws when profile does not exist",
      async () => {
        findProfileMock.mockResolvedValue(
          null
        );

        await expect(
          preferenceService
            .getJobPreference(userId)
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode: 404,
            code:
              "JOB_SEEKER_PROFILE_NOT_FOUND"
          })
        );
      }
    );

    test(
      "gets or creates job preference using defaults",
      async () => {
        const preference = {
          id:
            "preference-1"
        };

        findOrCreatePreferenceMock
          .mockResolvedValue([
            preference,
            true
          ]);

        const result =
          await preferenceService
            .getJobPreference(userId);

        expect(
          findOrCreatePreferenceMock
        ).toHaveBeenCalledWith(
          profileId,
          defaultPreference
        );

        expect(result).toBe(
          preference
        );
      }
    );

    test(
      "returns existing job preference",
      async () => {
        const preference = {
          id:
            "preference-1"
        };

        findOrCreatePreferenceMock
          .mockResolvedValue([
            preference,
            false
          ]);

        const result =
          await preferenceService
            .getJobPreference(userId);

        expect(result).toBe(
          preference
        );
      }
    );

    test(
      "updates job preference",
      async () => {
        const preference = {
          id:
            "preference-1"
        };

        const updateData = {
          expectedSalary:
            800000,

          willingToRelocate:
            true
        };

        findOrCreatePreferenceMock
          .mockResolvedValue([
            preference,
            false
          ]);

        updatePreferenceMock
          .mockResolvedValue({
            ...preference,
            ...updateData
          });

        const result =
          await preferenceService
            .updateJobPreference(
              userId,
              updateData
            );

        expect(
          updatePreferenceMock
        ).toHaveBeenCalledWith(
          preference,
          updateData
        );

        expect(result).toEqual(
          expect.objectContaining(
            updateData
          )
        );
      }
    );

    test(
      "deletes job preference",
      async () => {
        const preference = {
          id:
            "preference-1"
        };

        findPreferenceMock
          .mockResolvedValue(
            preference
          );

        const result =
          await preferenceService
            .deleteJobPreference(
              userId
            );

        expect(
          findPreferenceMock
        ).toHaveBeenCalledWith(
          profileId
        );

        expect(
          deletePreferenceMock
        ).toHaveBeenCalledWith(
          preference
        );

        expect(result).toEqual({
          message:
            "Job preference deleted successfully"
        });
      }
    );

    test(
      "throws when job preference does not exist for deletion",
      async () => {
        findPreferenceMock
          .mockResolvedValue(
            null
          );

        await expect(
          preferenceService
            .deleteJobPreference(
              userId
            )
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode: 404,
            code:
              "JOB_PREFERENCE_NOT_FOUND"
          })
        );

        expect(
          deletePreferenceMock
        ).not.toHaveBeenCalled();
      }
    );
  }
);