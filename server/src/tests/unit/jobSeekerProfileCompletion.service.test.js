import {
  jest
} from "@jest/globals";

const findJobSeekerProfileByUserIdMock =
  jest.fn();

const findJobSeekerSkillsByProfileIdMock =
  jest.fn();

const findJobSeekerEducationsByProfileIdMock =
  jest.fn();

const findJobSeekerExperiencesByProfileIdMock =
  jest.fn();

const findProjectsByProfileIdMock =
  jest.fn();

const findCertificationsByProfileIdMock =
  jest.fn();

const findSocialLinksByProfileIdMock =
  jest.fn();

const findJobPreferenceByProfileIdMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/jobSeekerProfile.repository.js",
  () => ({
    findJobSeekerProfileByUserId:
      findJobSeekerProfileByUserIdMock
  })
);

jest.unstable_mockModule(
  "../../repositories/jobSeekerSkill.repository.js",
  () => ({
    findJobSeekerSkillsByProfileId:
      findJobSeekerSkillsByProfileIdMock
  })
);

jest.unstable_mockModule(
  "../../repositories/jobSeekerEducation.repository.js",
  () => ({
    findJobSeekerEducationsByProfileId:
      findJobSeekerEducationsByProfileIdMock
  })
);

jest.unstable_mockModule(
  "../../repositories/jobSeekerExperience.repository.js",
  () => ({
    findJobSeekerExperiencesByProfileId:
      findJobSeekerExperiencesByProfileIdMock
  })
);

jest.unstable_mockModule(
  "../../repositories/jobSeekerProject.repository.js",
  () => ({
    default: {
      findAllByProfileId:
        findProjectsByProfileIdMock
    }
  })
);

jest.unstable_mockModule(
  "../../repositories/jobSeekerCertification.repository.js",
  () => ({
    default: {
      findAllByProfileId:
        findCertificationsByProfileIdMock
    }
  })
);

jest.unstable_mockModule(
  "../../repositories/jobSeekerSocialLink.repository.js",
  () => ({
    default: {
      findAllByProfileId:
        findSocialLinksByProfileIdMock
    }
  })
);

jest.unstable_mockModule(
  "../../repositories/jobSeekerJobPreference.repository.js",
  () => ({
    default: {
      findByProfileId:
        findJobPreferenceByProfileIdMock
    }
  })
);

const {
  getProfileCompletion
} = await import(
  "../../services/jobSeekerProfileCompletion.service.js"
);

describe(
  "Job seeker profile completion service",
  () => {
    const userId =
      "11111111-1111-1111-1111-111111111111";

    const profileId =
      "22222222-2222-2222-2222-222222222222";

    const completeProfile = {
      id:
        profileId,

      userId,

      firstName:
        "Chandra",

      lastName:
        "Sekhar",

      phoneNumber:
        "9876543210",

      location:
        "Vijayawada",

      headline:
        "Java Backend Developer",

      biography:
        "Backend developer profile",

      profileImageUrl:
        "https://example.com/profile.jpg",

      resumeUrl:
        "https://example.com/resume.pdf"
    };

    beforeEach(() => {
      jest.clearAllMocks();

      findJobSeekerProfileByUserIdMock
        .mockResolvedValue(
          completeProfile
        );

      findJobSeekerSkillsByProfileIdMock
        .mockResolvedValue([
          {
            id: 1,
            skillName:
              "Java"
          }
        ]);

      findJobSeekerEducationsByProfileIdMock
        .mockResolvedValue([
          {
            id: 1
          }
        ]);

      findJobSeekerExperiencesByProfileIdMock
        .mockResolvedValue([
          {
            id: 1
          }
        ]);

      findProjectsByProfileIdMock
        .mockResolvedValue([
          {
            id: 1
          }
        ]);

      findCertificationsByProfileIdMock
        .mockResolvedValue([
          {
            id: 1
          }
        ]);

      findSocialLinksByProfileIdMock
        .mockResolvedValue([
          {
            id: 1
          }
        ]);

      findJobPreferenceByProfileIdMock
        .mockResolvedValue({
          id: 1
        });
    });

    test(
      "returns 100 percent for a fully completed profile",
      async () => {
        const result =
          await getProfileCompletion(
            userId
          );

        expect(result).toEqual({
          completionPercentage:
            100,

          completedSections: [
            "personal",
            "headline",
            "biography",
            "profileImage",
            "resume",
            "skills",
            "education",
            "experience",
            "projects",
            "certifications",
            "socialLinks",
            "jobPreferences"
          ],

          missingSections: []
        });
      }
    );

    test(
      "throws when job seeker profile does not exist",
      async () => {
        findJobSeekerProfileByUserIdMock
          .mockResolvedValue(
            null
          );

        await expect(
          getProfileCompletion(
            userId
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
          findJobSeekerSkillsByProfileIdMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "returns zero percent when every section is missing",
      async () => {
        findJobSeekerProfileByUserIdMock
          .mockResolvedValue({
            id:
              profileId,

            firstName:
              null,

            lastName:
              null,

            phoneNumber:
              null,

            location:
              null,

            headline:
              null,

            biography:
              null,

            profileImageUrl:
              null,

            resumeUrl:
              null
          });

        findJobSeekerSkillsByProfileIdMock
          .mockResolvedValue([]);

        findJobSeekerEducationsByProfileIdMock
          .mockResolvedValue([]);

        findJobSeekerExperiencesByProfileIdMock
          .mockResolvedValue([]);

        findProjectsByProfileIdMock
          .mockResolvedValue([]);

        findCertificationsByProfileIdMock
          .mockResolvedValue([]);

        findSocialLinksByProfileIdMock
          .mockResolvedValue([]);

        findJobPreferenceByProfileIdMock
          .mockResolvedValue(
            null
          );

        const result =
          await getProfileCompletion(
            userId
          );

        expect(result).toEqual({
          completionPercentage:
            0,

          completedSections: [],

          missingSections: [
            "personal",
            "headline",
            "biography",
            "profileImage",
            "resume",
            "skills",
            "education",
            "experience",
            "projects",
            "certifications",
            "socialLinks",
            "jobPreferences"
          ]
        });
      }
    );

    test(
      "marks personal section missing when one required personal field is absent",
      async () => {
        findJobSeekerProfileByUserIdMock
          .mockResolvedValue({
            ...completeProfile,

            phoneNumber:
              null
          });

        const result =
          await getProfileCompletion(
            userId
          );

        expect(
          result.completedSections
        ).not.toContain(
          "personal"
        );

        expect(
          result.missingSections
        ).toContain(
          "personal"
        );

        expect(
          result.completionPercentage
        ).toBe(92);
      }
    );

    test(
      "marks headline as missing",
      async () => {
        findJobSeekerProfileByUserIdMock
          .mockResolvedValue({
            ...completeProfile,

            headline:
              null
          });

        const result =
          await getProfileCompletion(
            userId
          );

        expect(
          result.missingSections
        ).toContain(
          "headline"
        );

        expect(
          result.completionPercentage
        ).toBe(92);
      }
    );

    test(
      "marks biography as missing",
      async () => {
        findJobSeekerProfileByUserIdMock
          .mockResolvedValue({
            ...completeProfile,

            biography:
              null
          });

        const result =
          await getProfileCompletion(
            userId
          );

        expect(
          result.missingSections
        ).toContain(
          "biography"
        );
      }
    );

    test(
      "marks profile image as missing",
      async () => {
        findJobSeekerProfileByUserIdMock
          .mockResolvedValue({
            ...completeProfile,

            profileImageUrl:
              null
          });

        const result =
          await getProfileCompletion(
            userId
          );

        expect(
          result.missingSections
        ).toContain(
          "profileImage"
        );
      }
    );

    test(
      "marks resume as missing",
      async () => {
        findJobSeekerProfileByUserIdMock
          .mockResolvedValue({
            ...completeProfile,

            resumeUrl:
              null
          });

        const result =
          await getProfileCompletion(
            userId
          );

        expect(
          result.missingSections
        ).toContain(
          "resume"
        );
      }
    );

    test(
      "marks empty collection sections as missing",
      async () => {
        findJobSeekerSkillsByProfileIdMock
          .mockResolvedValue([]);

        findJobSeekerEducationsByProfileIdMock
          .mockResolvedValue([]);

        findJobSeekerExperiencesByProfileIdMock
          .mockResolvedValue([]);

        findProjectsByProfileIdMock
          .mockResolvedValue([]);

        findCertificationsByProfileIdMock
          .mockResolvedValue([]);

        findSocialLinksByProfileIdMock
          .mockResolvedValue([]);

        const result =
          await getProfileCompletion(
            userId
          );

        expect(
          result.missingSections
        ).toEqual(
          expect.arrayContaining([
            "skills",
            "education",
            "experience",
            "projects",
            "certifications",
            "socialLinks"
          ])
        );

        expect(
          result.completionPercentage
        ).toBe(50);
      }
    );

    test(
      "marks job preference as missing when not found",
      async () => {
        findJobPreferenceByProfileIdMock
          .mockResolvedValue(
            null
          );

        const result =
          await getProfileCompletion(
            userId
          );

        expect(
          result.missingSections
        ).toContain(
          "jobPreferences"
        );

        expect(
          result.completionPercentage
        ).toBe(92);
      }
    );

    test(
      "uses the profile ID for every related repository lookup",
      async () => {
        await getProfileCompletion(
          userId
        );

        expect(
          findJobSeekerSkillsByProfileIdMock
        ).toHaveBeenCalledWith(
          profileId
        );

        expect(
          findJobSeekerEducationsByProfileIdMock
        ).toHaveBeenCalledWith(
          profileId
        );

        expect(
          findJobSeekerExperiencesByProfileIdMock
        ).toHaveBeenCalledWith(
          profileId
        );

        expect(
          findProjectsByProfileIdMock
        ).toHaveBeenCalledWith(
          profileId
        );

        expect(
          findCertificationsByProfileIdMock
        ).toHaveBeenCalledWith(
          profileId
        );

        expect(
          findSocialLinksByProfileIdMock
        ).toHaveBeenCalledWith(
          profileId
        );

        expect(
          findJobPreferenceByProfileIdMock
        ).toHaveBeenCalledWith(
          profileId
        );
      }
    );

    test(
      "propagates related repository errors",
      async () => {
        const repositoryError =
          new Error(
            "Skills lookup failed"
          );

        findJobSeekerSkillsByProfileIdMock
          .mockRejectedValue(
            repositoryError
          );

        await expect(
          getProfileCompletion(
            userId
          )
        ).rejects.toBe(
          repositoryError
        );
      }
    );
  }
);