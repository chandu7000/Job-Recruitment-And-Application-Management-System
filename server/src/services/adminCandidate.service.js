import User from
  "../models/user.model.js";

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

const mapAdminCandidateProfile = (
  profile
) => {

  return {

    candidateId:
      profile.id,

    user: profile.user
      ? {
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
      }
      : null,

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

const getAdminCandidateProfile =
  async (
    profileId
  ) => {

    const profile =
      await JobSeekerProfile.findByPk(
        profileId,
        {
          include: [
            {
              model: User,
              as: "user",
              attributes: [
                "id",
                "email",
                "role",
                "status",
                "createdAt"
              ]
            },

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
        "Candidate profile not found.",
        404,
        "CANDIDATE_NOT_FOUND"
      );
    }

    return mapAdminCandidateProfile(
      profile
    );

  };


export {
  getAdminCandidateProfile
};