import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import JobSeekerProfile from "../models/jobSeekerProfile.model.js";
import JobSeekerSkill from "../models/jobSeekerSkill.model.js";
import JobSeekerEducation from "../models/jobSeekerEducation.model.js";
import JobSeekerExperience from "../models/jobSeekerExperience.model.js";
import JobSeekerProject from "../models/jobSeekerProject.model.js";
import JobSeekerCertification from "../models/jobSeekerCertification.model.js";
import JobSeekerSocialLink from "../models/jobSeekerSocialLink.model.js";
import JobSeekerJobPreference from "../models/jobSeekerJobPreference.model.js";
import AppError from "../utils/AppError.js";

const profileIncludes = [
  { model: JobSeekerSkill, as: "skills" },
  { model: JobSeekerEducation, as: "educations" },
  { model: JobSeekerExperience, as: "experiences" },
  { model: JobSeekerProject, as: "projects" },
  { model: JobSeekerCertification, as: "certifications" },
  { model: JobSeekerSocialLink, as: "socialLinks" },
  { model: JobSeekerJobPreference, as: "jobPreference" }
];

const mapCandidateProfile = (profile) => ({
  id: profile.id,
  firstName: profile.firstName,
  lastName: profile.lastName,
  location: profile.location,
  headline: profile.headline,
  biography: profile.biography,
  profileImageUrl: profile.profileImageUrl,
  resumeUrl: profile.resumeUrl,
  resumeOriginalName: profile.resumeOriginalName,
  skills: profile.skills || [],
  educations: profile.educations || [],
  experiences: profile.experiences || [],
  projects: profile.projects || [],
  certifications: profile.certifications || [],
  socialLinks: profile.socialLinks || [],
  jobPreference: profile.jobPreference || null
});

const findProfileById = (profileId) =>
  JobSeekerProfile.findByPk(profileId, { include: profileIncludes });

const findProfileByUserId = (userId) =>
  JobSeekerProfile.findOne({ where: { userId }, include: profileIncludes });

export const getRecruiterCandidateProfile = async ({ recruiterId, profileId }) => {
  const profile = await findProfileById(profileId);

  if (!profile) {
    throw new AppError("Candidate profile not found", 404, "CANDIDATE_NOT_FOUND");
  }

  const ownedApplication = await Application.findOne({
    where: { candidateId: profile.userId },
    attributes: ["id"],
    include: [{
      model: Job,
      as: "job",
      required: true,
      where: { createdBy: recruiterId },
      attributes: ["id"]
    }]
  });

  if (!ownedApplication) {
    throw new AppError(
      "You are not authorized to view this candidate profile.",
      403,
      "CANDIDATE_ACCESS_REQUIRED"
    );
  }

  return mapCandidateProfile(profile);
};

export const getRecruiterCandidateProfileByUserId = async (candidateId) => {
  const profile = await findProfileByUserId(candidateId);
  return profile ? mapCandidateProfile(profile) : null;
};
