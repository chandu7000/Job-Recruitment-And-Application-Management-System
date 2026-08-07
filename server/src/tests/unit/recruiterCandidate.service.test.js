import {
  jest
} from "@jest/globals";

const findByPkMock =
  jest.fn();

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
  getRecruiterCandidateProfile
} = await import(
  "../../services/recruiterCandidate.service.js"
);

describe(
  "Recruiter candidate service",
  () => {
    const profileId =
      "11111111-1111-1111-1111-111111111111";

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "fetches a candidate with all recruiter-visible associations",
      async () => {
        const profile = {
          id:
            profileId,

          firstName:
            "Chandra",

          lastName:
            "Sekhar",

          location:
            "Vijayawada",

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

          skills: [
            {
              id:
                1,

              skillName:
                "Java"
            }
          ],

          educations: [
            {
              id:
                2,

              institutionName:
                "JNTUK"
            }
          ],

          experiences: [
            {
              id:
                3,

              companyName:
                "Example Company"
            }
          ],

          projects: [
            {
              id:
                4,

              projectName:
                "CareerForge"
            }
          ],

          certifications: [
            {
              id:
                5,

              certificationName:
                "Java Certification"
            }
          ],

          socialLinks: [
            {
              id:
                6,

              platform:
                "LINKEDIN"
            }
          ],

          jobPreference: {
            id:
              7,

            salaryCurrency:
              "INR"
          }
        };

        findByPkMock
          .mockResolvedValue(
            profile
          );

        const result =
          await getRecruiterCandidateProfile(
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
          id:
            profile.id,

          firstName:
            profile.firstName,

          lastName:
            profile.lastName,

          location:
            profile.location,

          headline:
            profile.headline,

          biography:
            profile.biography,

          profileImageUrl:
            profile.profileImageUrl,

          resumeUrl:
            profile.resumeUrl,

          resumeOriginalName:
            profile.resumeOriginalName,

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
      "returns empty arrays and null defaults when associations are undefined",
      async () => {
        findByPkMock
          .mockResolvedValue({
            id:
              profileId,

            firstName:
              "Chandra",

            lastName:
              "Sekhar"
          });

        const result =
          await getRecruiterCandidateProfile(
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
      "preserves empty association values",
      async () => {
        findByPkMock
          .mockResolvedValue({
            id:
              profileId,

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
          await getRecruiterCandidateProfile(
            profileId
          );

        expect(result).toEqual(
          expect.objectContaining({
            skills: [],
            educations: [],
            experiences: [],
            projects: [],
            certifications: [],
            socialLinks: [],
            jobPreference:
              null
          })
        );
      }
    );

    test(
      "does not expose private candidate contact fields",
      async () => {
        findByPkMock
          .mockResolvedValue({
            id:
              profileId,

            firstName:
              "Chandra",

            lastName:
              "Sekhar",

            phoneNumber:
              "9876543210",

            addressLine1:
              "Private address",

            city:
              "Vijayawada",

            skills: []
          });

        const result =
          await getRecruiterCandidateProfile(
            profileId
          );

        expect(result).not.toHaveProperty(
          "phoneNumber"
        );

        expect(result).not.toHaveProperty(
          "addressLine1"
        );

        expect(result).not.toHaveProperty(
          "city"
        );
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
          getRecruiterCandidateProfile(
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
            "Candidate query failed"
          );

        findByPkMock
          .mockRejectedValue(
            databaseError
          );

        await expect(
          getRecruiterCandidateProfile(
            profileId
          )
        ).rejects.toBe(
          databaseError
        );
      }
    );
  }
);