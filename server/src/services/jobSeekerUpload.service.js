import {
  findJobSeekerProfileByUserId,
  updateJobSeekerUploadsByUserId,
  clearJobSeekerProfileImageByUserId,
  clearJobSeekerResumeByUserId
} from "../repositories/jobSeekerProfile.repository.js";

import {
  uploadProfileImage,
  uploadResume,
  deleteCloudinaryAsset
} from "../utils/cloudinaryUpload.js";

import {
  validateProfileImage,
  validateResume
} from "../utils/fileValidation.js";

const getProfileOrThrow = async (
  userId
) => {
  const profile =
    await findJobSeekerProfileByUserId(
      userId
    );

  if (!profile) {
    const error = new Error(
      "Job seeker profile not found"
    );

    error.statusCode = 404;
    error.code =
      "JOB_SEEKER_PROFILE_NOT_FOUND";

    throw error;
  }

  return profile;
};

const uploadJobSeekerProfileImage =
  async (
    userId,
    file
  ) => {
    validateProfileImage(file);

    const profile =
      await getProfileOrThrow(
        userId
      );

    const oldPublicId =
      profile.profileImagePublicId;

    const publicId =
      `job-seeker-${profile.id}`;

    const uploadResult =
      await uploadProfileImage(
        file.buffer,
        publicId
      );

    try {
      const updatedProfile =
        await updateJobSeekerUploadsByUserId(
          userId,
          {
            profileImageUrl:
              uploadResult.secure_url,

            profileImagePublicId:
              uploadResult.public_id
          }
        );

      if (
        oldPublicId &&
        oldPublicId !== uploadResult.public_id
      ) {
        try {
          await deleteCloudinaryAsset(
            oldPublicId,
            "image"
          );
        } catch (cleanupError) {
          console.error(
            "Old profile image cleanup failed:",
            cleanupError.message
          );
        }
      }

      return updatedProfile;
    } catch (error) {
      await deleteCloudinaryAsset(
        uploadResult.public_id,
        "image"
      );

      throw error;
    }
  };

const uploadJobSeekerResume =
  async (
    userId,
    file
  ) => {
    const fileMetadata =
      validateResume(file);

    const profile =
      await getProfileOrThrow(
        userId
      );

    const oldResumePublicId =
      profile.resumePublicId;

    const publicId =
      `job-seeker-${profile.id}-resume`;

    const uploadResult =
      await uploadResume(
        file.buffer,
        publicId
      );

    try {
      const updatedProfile =
        await updateJobSeekerUploadsByUserId(
          userId,
          {
            resumeUrl:
              uploadResult.secure_url,

            resumePublicId:
              uploadResult.public_id,

            resumeOriginalName:
              fileMetadata.originalName
          }
        );

      if (
        oldResumePublicId &&
        oldResumePublicId !== uploadResult.public_id
      ) {
        try {
          await deleteCloudinaryAsset(
            oldResumePublicId,
            "raw"
          );
        } catch (cleanupError) {
          console.error(
            "Old resume cleanup failed:",
            cleanupError.message
          );
        }
      }

      return updatedProfile;
    } catch (error) {
      await deleteCloudinaryAsset(
        uploadResult.public_id,
        "raw"
      );

      throw error;
    }
  };

const getJobSeekerResume =
  async (
    userId
  ) => {
    const profile =
      await getProfileOrThrow(
        userId
      );

    if (
      !profile.resumeUrl ||
      !profile.resumePublicId
    ) {
      const error = new Error(
        "Resume not found"
      );

      error.statusCode = 404;
      error.code =
        "RESUME_NOT_FOUND";

      throw error;
    }

    return {
      resumeUrl:
        profile.resumeUrl,

      resumeOriginalName:
        profile.resumeOriginalName ||
        "resume.pdf"
    };
  };

const deleteJobSeekerProfileImage =
  async (
    userId
  ) => {
    const profile =
      await getProfileOrThrow(
        userId
      );

    if (
      !profile.profileImagePublicId
    ) {
      const error = new Error(
        "Profile image not found"
      );

      error.statusCode = 404;
      error.code =
        "PROFILE_IMAGE_NOT_FOUND";

      throw error;
    }

    await deleteCloudinaryAsset(
      profile.profileImagePublicId,
      "image"
    );

    return clearJobSeekerProfileImageByUserId(
      userId
    );
  };

const deleteJobSeekerResume =
  async (
    userId
  ) => {
    const profile =
      await getProfileOrThrow(
        userId
      );

    if (
      !profile.resumePublicId
    ) {
      const error = new Error(
        "Resume not found"
      );

      error.statusCode = 404;
      error.code =
        "RESUME_NOT_FOUND";

      throw error;
    }

    await deleteCloudinaryAsset(
      profile.resumePublicId,
      "raw"
    );

    return clearJobSeekerResumeByUserId(
      userId
    );
  };

export {
  uploadJobSeekerProfileImage,
  uploadJobSeekerResume,
  getJobSeekerResume,
  deleteJobSeekerProfileImage,
  deleteJobSeekerResume
};