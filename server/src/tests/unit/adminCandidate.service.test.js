import {
  jest
} from "@jest/globals";

const findByPkMock =
  jest.fn();

const UserModel = {
  modelName:
    "User"
};

const JobSeekerSkillModel = {
  modelName:
    "JobSeekerSkill"
};

const JobSeekerEducationModel = {
  modelName:
    "JobSeekerEducation"
};

const JobSeekerExperienceModel = {
  modelName:
    "JobSeekerExperience"
};

const JobSeekerProjectModel = {
  modelName:
    "JobSeekerProject"
};

const JobSeekerCertificationModel = {
  modelName:
    "JobSeekerCertification"
};

const JobSeekerSocialLinkModel = {
  modelName:
    "JobSeekerSocialLink"
};

const JobSeekerJobPreferenceModel = {
  modelName:
    "JobSeekerJobPreference"
};

jest.unstable_mockModule(
  "../../models/user.model.js",
  () => ({
    default:
      UserModel
  })
);

jest.unstable_mockModule(
  "../../models/jobSeekerProfile.model.js",
  () => ({
    default: {
      findByPk:
        findByPkMock
    }
  })
);

jest.unstable_mockModule(
  "../../models/jobSeekerSkill.model.js",
  () => ({
    default:
      JobSeekerSkillModel
  })
);

jest.unstable_mockModule(
  "../../models/jobSeekerEducation.model.js",
  () => ({
    default:
      JobSeekerEducationModel
  })
);

jest.unstable_mockModule(
  "../../models/jobSeekerExperience.model.js",
  () => ({
    default:
      JobSeekerExperienceModel
  })
);

jest.unstable_mockModule(
  "../../models/jobSeekerProject.model.js",
  () => ({
    default:
      JobSeekerProjectModel
  })
);

jest.unstable_mockModule(
  "../../models/jobSeekerCertification.model.js",
  () => ({
    default:
      JobSeekerCertificationModel
  })
);

jest.unstable_mockModule(
  "../../models/jobSeekerSocialLink.model.js",
  () => ({
    default:
      JobSeekerSocialLinkModel
  })
);

jest.unstable_mockModule(
  "../../models/jobSeekerJobPreference.model.js",
  () => ({
    default:
      JobSeekerJobPreferenceModel
  })
);

const {
  getAdminCandidateProfile
} = await import(
  "../../services/adminCandidate.service.js"
);

describe(
  "Admin candidate service",
  () => {
    const profileId =
      "11111111-1111-1111-1111-111111111111";

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "fetches a candidate profile with all required associations",
      async () => {
        const profile = {
          id:
            profileId,

          firstName:
            "Chandra",

          lastName:
            "Sekhar",

          phoneNumber:
            "9876543210",

          location:
            "Vijayawada",

          addressLine1:
            "Main Road",

          addressLine2:
            "Near Bus Stand",

          city:
            "Vijayawada",

          state:
            "Andhra Pradesh",

          country:
            "India",

          postalCode:
            "520001",

          headline:
            "Java Backend Developer",

          biography:
            "Backend developer profile",

          profileImageUrl:
            "https://example.com/profile.jpg",

          resumeUrl:
            "https://example.com/resume.pdf",

          resumeOriginalName:
            "resume.pdf",

          user: {
            id:
              "22222222-2222-2222-2222-222222222222",

            email:
              "candidate@example.com",

            role:
              "JOB_SEEKER",

            status:
              "ACTIVE",

            createdAt:
              new Date(
                "2026-01-01T00:00:00.000Z"
              )
          },

          skills: [
            {
              id: 1,
              skillName:
                "Java"
            }
          ],

          educations: [
            {
              id: 2,
              institutionName:
                "JNTUK"
            }
          ],

          experiences: [
            {
              id: 3,
              companyName:
                "Example Company"
            }
          ],

          projects: [
            {
              id: 4,
              projectName:
                "CareerForge"
            }
          ],

          certifications: [
            {
              id: 5,
              certificationName:
                "Java Certification"
            }
          ],

          socialLinks: [
            {
              id: 6,
              platform:
                "LINKEDIN"
            }
          ],

          jobPreference: {
            id: 7,
            salaryCurrency:
              "INR"
          }
        };

        findByPkMock
          .mockResolvedValue(
            profile
          );

        const result =
          await getAdminCandidateProfile(
            profileId
          );

        expect(
          findByPkMock
        ).toHaveBeenCalledWith(
          profileId,
          {
            include: [
              {
                model:
                  UserModel,

                as:
                  "user",

                attributes: [
                  "id",
                  "email",
                  "role",
                  "status",
                  "createdAt"
                ]
              },
              {
                model:
                  JobSeekerSkillModel,

                as:
                  "skills"
              },
              {
                model:
                  JobSeekerEducationModel,

                as:
                  "educations"
              },
              {
                model:
                  JobSeekerExperienceModel,

                as:
                  "experiences"
              },
              {
                model:
                  JobSeekerProjectModel,

                as:
                  "projects"
              },
              {
                model:
                  JobSeekerCertificationModel,

                as:
                  "certifications"
              },
              {
                model:
                  JobSeekerSocialLinkModel,

                as:
                  "socialLinks"
              },
              {
                model:
                  JobSeekerJobPreferenceModel,

                as:
                  "jobPreference"
              }
            ]
          }
        );

        expect(result).toEqual({
          candidateId:
            profile.id,

          user: {
            id:
              profile.user.id,

            email:
              profile.user.email,

            role:
              profile.user.role,

            status:
              profile.user.status,

            createdAt:
              profile.user.createdAt
          },

          personalInformation: {
            firstName:
              profile.firstName,

            lastName:
              profile.lastName,

            phoneNumber:
              profile.phoneNumber,

            location:
              profile.location,

            addressLine1:
              profile.addressLine1,

            addressLine2:
              profile.addressLine2,

            city:
              profile.city,

            state:
              profile.state,

            country:
              profile.country,

            postalCode:
              profile.postalCode
          },

          professionalInformation: {
            headline:
              profile.headline,

            biography:
              profile.biography
          },

          profileImage:
            profile.profileImageUrl,

          resume: {
            url:
              profile.resumeUrl,

            originalName:
              profile.resumeOriginalName
          },

          skills:
            profile.skills,

          educations:
            profile.educations,

          experiences:
            profile.experiences,

          projects:
            profile.projects,

          certifications:
            profile.certifications,

          socialLinks:
            profile.socialLinks,

          jobPreference:
            profile.jobPreference
        });
      }
    );

    test(
      "returns null user when the candidate has no associated user",
      async () => {
        findByPkMock
          .mockResolvedValue({
            id:
              profileId,

            user:
              null,

            skills: [],
            educations: [],
            experiences: [],
            projects: [],
            certifications: [],
            socialLinks: [],
            jobPreference:
              null
          });

        const result =
          await getAdminCandidateProfile(
            profileId
          );

        expect(result.user).toBeNull();

        expect(result.skills).toEqual([]);
        expect(result.educations).toEqual([]);
        expect(result.experiences).toEqual([]);
        expect(result.projects).toEqual([]);
        expect(result.certifications).toEqual([]);
        expect(result.socialLinks).toEqual([]);
        expect(result.jobPreference).toBeNull();
      }
    );

    test(
      "uses empty defaults when association values are undefined",
      async () => {
        findByPkMock
          .mockResolvedValue({
            id:
              profileId,

            user:
              null
          });

        const result =
          await getAdminCandidateProfile(
            profileId
          );

        expect(result.skills).toEqual([]);
        expect(result.educations).toEqual([]);
        expect(result.experiences).toEqual([]);
        expect(result.projects).toEqual([]);
        expect(result.certifications).toEqual([]);
        expect(result.socialLinks).toEqual([]);
        expect(result.jobPreference).toBeNull();
      }
    );

    test(
      "throws when candidate profile does not exist",
      async () => {
        findByPkMock
          .mockResolvedValue(
            null
          );

        await expect(
          getAdminCandidateProfile(
            profileId
          )
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode:
              404,

            code:
              "CANDIDATE_NOT_FOUND"
          })
        );
      }
    );

    test(
      "propagates database errors",
      async () => {
        const databaseError =
          new Error(
            "Database query failed"
          );

        findByPkMock
          .mockRejectedValue(
            databaseError
          );

        await expect(
          getAdminCandidateProfile(
            profileId
          )
        ).rejects.toBe(
          databaseError
        );
      }
    );
  }
);