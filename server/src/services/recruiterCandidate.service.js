import JobSeekerProfile from
  "../models/jobSeekerProfile.model.js";

import JobSeekerSkill from
  "../models/jobSeekerSkill.model.js";

import JobSeekerEducation from
  "../models/jobSeekerEducation.model.js";

import JobSeekerExperience from
  "../models/jobSeekerExperience.model.js";

import JobSeekerProject from
  "../models/jobSeekerProject.model.js";

import JobSeekerCertification from
  "../models/jobSeekerCertification.model.js";

import JobSeekerSocialLink from
  "../models/jobSeekerSocialLink.model.js";

import JobSeekerJobPreference from
  "../models/jobSeekerJobPreference.model.js";

import AppError from
  "../utils/AppError.js";

const mapCandidateProfile = (
  profile
) => {

  return {
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
      profile.skills || [],

    educations:
      profile.educations || [],

    experiences:
      profile.experiences || [],

    projects:
      profile.projects || [],

    certifications:
      profile.certifications || [],

    socialLinks:
      profile.socialLinks || [],

    jobPreference:
      profile.jobPreference || null
  };
};

const getRecruiterCandidateProfile =
  async (
    profileId
  ) => {

    const profile =
      await JobSeekerProfile.findByPk(
        profileId,
        {
          include: [
            {
              model: JobSeekerSkill,
              as: "skills"
            },
            {
              model: JobSeekerEducation,
              as: "educations"
            },
            {
              model: JobSeekerExperience,
              as: "experiences"
            },
            {
              model: JobSeekerProject,
              as: "projects"
            },
            {
              model: JobSeekerCertification,
              as: "certifications"
            },
            {
              model: JobSeekerSocialLink,
              as: "socialLinks"
            },
            {
              model: JobSeekerJobPreference,
              as: "jobPreference"
            }
          ]
        }
      );

    if (!profile) {

      throw new AppError(
        "Candidate profile not found",
        404,
        "CANDIDATE_NOT_FOUND"
      );
    }

    return mapCandidateProfile(
      profile
    );

  };


export {
  getRecruiterCandidateProfile
};