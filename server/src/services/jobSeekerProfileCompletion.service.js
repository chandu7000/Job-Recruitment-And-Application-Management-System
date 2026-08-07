import {
  findJobSeekerProfileByUserId
} from "../repositories/jobSeekerProfile.repository.js";

import {
  findJobSeekerSkillsByProfileId
} from "../repositories/jobSeekerSkill.repository.js";

import {
  findJobSeekerEducationsByProfileId
} from "../repositories/jobSeekerEducation.repository.js";

import {
  findJobSeekerExperiencesByProfileId
} from "../repositories/jobSeekerExperience.repository.js";

import jobSeekerProjectRepository
from "../repositories/jobSeekerProject.repository.js";

import jobSeekerCertificationRepository
from "../repositories/jobSeekerCertification.repository.js";

import jobSeekerSocialLinkRepository
from "../repositories/jobSeekerSocialLink.repository.js";

import jobSeekerJobPreferenceRepository
from "../repositories/jobSeekerJobPreference.repository.js";

import AppError from "../utils/AppError.js";


const calculatePercentage = (
  completed,
  total
) => {

  return Math.round(
    (completed / total) * 100
  );

};


const getProfileCompletion =
  async (
    userId
  ) => {


    const profile =
      await findJobSeekerProfileByUserId(
        userId
      );


    if (!profile) {

      throw new AppError(
        "Job seeker profile not found.",
        404,
        "JOB_SEEKER_PROFILE_NOT_FOUND"
      );

    }



    const skills =
      await findJobSeekerSkillsByProfileId(
        profile.id
      );


    const educations =
      await findJobSeekerEducationsByProfileId(
        profile.id
      );


    const experiences =
      await findJobSeekerExperiencesByProfileId(
        profile.id
      );


    const projects =
      await jobSeekerProjectRepository
        .findAllByProfileId(
          profile.id
        );


    const certifications =
      await jobSeekerCertificationRepository
        .findAllByProfileId(
          profile.id
        );


    const socialLinks =
      await jobSeekerSocialLinkRepository
        .findAllByProfileId(
          profile.id
        );


    const jobPreference =
      await jobSeekerJobPreferenceRepository
        .findByProfileId(
          profile.id
        );



    const sections = [];

    const missingSections = [];



    // Personal Information

    const personalCompleted =
      profile.firstName &&
      profile.lastName &&
      profile.phoneNumber &&
      profile.location;


    if (personalCompleted) {

      sections.push(
        "personal"
      );

    } else {

      missingSections.push(
        "personal"
      );

    }



    // Headline

    if (profile.headline) {

      sections.push(
        "headline"
      );

    } else {

      missingSections.push(
        "headline"
      );

    }



    // Biography

    if (profile.biography) {

      sections.push(
        "biography"
      );

    } else {

      missingSections.push(
        "biography"
      );

    }



    // Profile Image

    if (profile.profileImageUrl) {

      sections.push(
        "profileImage"
      );

    } else {

      missingSections.push(
        "profileImage"
      );

    }



    // Resume

    if (profile.resumeUrl) {

      sections.push(
        "resume"
      );

    } else {

      missingSections.push(
        "resume"
      );

    }



    // Skills

    if (skills.length > 0) {

      sections.push(
        "skills"
      );

    } else {

      missingSections.push(
        "skills"
      );

    }



    // Education

    if (educations.length > 0) {

      sections.push(
        "education"
      );

    } else {

      missingSections.push(
        "education"
      );

    }



    // Experience

    if (experiences.length > 0) {

      sections.push(
        "experience"
      );

    } else {

      missingSections.push(
        "experience"
      );

    }



    // Projects

    if (projects.length > 0) {

      sections.push(
        "projects"
      );

    } else {

      missingSections.push(
        "projects"
      );

    }



    // Certifications

    if (certifications.length > 0) {

      sections.push(
        "certifications"
      );

    } else {

      missingSections.push(
        "certifications"
      );

    }



    // Social Links

    if (socialLinks.length > 0) {

      sections.push(
        "socialLinks"
      );

    } else {

      missingSections.push(
        "socialLinks"
      );

    }



    // Job Preferences

    if (jobPreference) {

      sections.push(
        "jobPreferences"
      );

    } else {

      missingSections.push(
        "jobPreferences"
      );

    }



    const totalSections = 12;


    return {

      completionPercentage:
        calculatePercentage(
          sections.length,
          totalSections
        ),

      completedSections:
        sections,

      missingSections

    };

  };


export {
  getProfileCompletion
};