import { jest } from "@jest/globals";

const findByPkMock = jest.fn();
const findOneProfileMock = jest.fn();
const findOwnedApplicationMock = jest.fn();

const associatedModels = {
  skill: { modelName: "JobSeekerSkill" },
  education: { modelName: "JobSeekerEducation" },
  experience: { modelName: "JobSeekerExperience" },
  project: { modelName: "JobSeekerProject" },
  certification: { modelName: "JobSeekerCertification" },
  socialLink: { modelName: "JobSeekerSocialLink" },
  preference: { modelName: "JobSeekerJobPreference" }
};

jest.unstable_mockModule("../../models/application.model.js", () => ({
  default: { findOne: findOwnedApplicationMock }
}));
jest.unstable_mockModule("../../models/job.model.js", () => ({
  default: { modelName: "Job" }
}));
jest.unstable_mockModule("../../models/jobSeekerProfile.model.js", () => ({
  default: { findByPk: findByPkMock, findOne: findOneProfileMock }
}));
jest.unstable_mockModule("../../models/jobSeekerSkill.model.js", () => ({ default: associatedModels.skill }));
jest.unstable_mockModule("../../models/jobSeekerEducation.model.js", () => ({ default: associatedModels.education }));
jest.unstable_mockModule("../../models/jobSeekerExperience.model.js", () => ({ default: associatedModels.experience }));
jest.unstable_mockModule("../../models/jobSeekerProject.model.js", () => ({ default: associatedModels.project }));
jest.unstable_mockModule("../../models/jobSeekerCertification.model.js", () => ({ default: associatedModels.certification }));
jest.unstable_mockModule("../../models/jobSeekerSocialLink.model.js", () => ({ default: associatedModels.socialLink }));
jest.unstable_mockModule("../../models/jobSeekerJobPreference.model.js", () => ({ default: associatedModels.preference }));

const {
  getRecruiterCandidateProfile,
  getRecruiterCandidateProfileByUserId
} = await import("../../services/recruiterCandidate.service.js");

const profile = {
  id: "11111111-1111-4111-8111-111111111111",
  userId: "22222222-2222-4222-8222-222222222222",
  firstName: "Chandra",
  lastName: "Sekhar",
  location: "Vijayawada",
  headline: "Java Backend Developer",
  biography: "Backend developer profile",
  profileImageUrl: "https://example.com/profile.jpg",
  resumeUrl: "https://example.com/resume.pdf",
  resumeOriginalName: "resume.pdf",
  phoneNumber: "9876543210",
  addressLine1: "Private address",
  skills: [{ id: 1, skillName: "Java" }],
  educations: [],
  experiences: [],
  projects: [],
  certifications: [],
  socialLinks: [],
  jobPreference: null
};

describe("Recruiter candidate service", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns recruiter-visible candidate data when an owned application exists", async () => {
    findByPkMock.mockResolvedValue(profile);
    findOwnedApplicationMock.mockResolvedValue({ id: "application-1" });

    const result = await getRecruiterCandidateProfile({
      recruiterId: "recruiter-1",
      profileId: profile.id
    });

    expect(result.firstName).toBe("Chandra");
    expect(result.skills).toEqual(profile.skills);
    expect(result).not.toHaveProperty("phoneNumber");
    expect(result).not.toHaveProperty("addressLine1");
    expect(findOwnedApplicationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidateId: profile.userId }
      })
    );
  });

  test("blocks a recruiter without an application to the recruiter's jobs", async () => {
    findByPkMock.mockResolvedValue(profile);
    findOwnedApplicationMock.mockResolvedValue(null);

    await expect(getRecruiterCandidateProfile({
      recruiterId: "recruiter-2",
      profileId: profile.id
    })).rejects.toEqual(expect.objectContaining({
      statusCode: 403,
      code: "CANDIDATE_ACCESS_REQUIRED"
    }));
  });

  test("throws when candidate profile does not exist", async () => {
    findByPkMock.mockResolvedValue(null);

    await expect(getRecruiterCandidateProfile({
      recruiterId: "recruiter-1",
      profileId: profile.id
    })).rejects.toEqual(expect.objectContaining({
      statusCode: 404,
      code: "CANDIDATE_NOT_FOUND"
    }));
  });

  test("loads a candidate by user id for an already ownership-checked application", async () => {
    findOneProfileMock.mockResolvedValue(profile);

    const result = await getRecruiterCandidateProfileByUserId(profile.userId);

    expect(result).toEqual(expect.objectContaining({
      id: profile.id,
      firstName: profile.firstName,
      resumeUrl: profile.resumeUrl
    }));
    expect(findOneProfileMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: profile.userId } })
    );
  });

  test("returns null when an application candidate has no profile", async () => {
    findOneProfileMock.mockResolvedValue(null);
    await expect(getRecruiterCandidateProfileByUserId(profile.userId)).resolves.toBeNull();
  });
});
