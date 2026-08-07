import {
  findCompanyByOwnerId,
  updateCompanyLogoByOwnerId,
  clearCompanyLogoByOwnerId
} from "../repositories/company.repository.js";

import {
  uploadCompanyLogo,
  deleteCloudinaryAsset
} from "../utils/cloudinaryUpload.js";

import {
  validateCompanyLogo
} from "../utils/fileValidation.js";

import AppError from "../utils/AppError.js";

const getOwnedCompanyOrThrow = async (
  ownerId
) => {
  const company =
    await findCompanyByOwnerId(
      ownerId
    );

  if (!company) {
    throw new AppError(
      "Company not found.",
      404,
      "COMPANY_NOT_FOUND"
    );
  }

  return company;
};

const uploadOwnedCompanyLogo = async (
  ownerId,
  file
) => {
  validateCompanyLogo(file);

  const company =
    await getOwnedCompanyOrThrow(
      ownerId
    );

  const oldLogoPublicId =
    company.logoPublicId;

  const publicId =
    `company-${company.id}-logo`;

  const uploadResult =
    await uploadCompanyLogo(
      file.buffer,
      publicId
    );

  try {
    const updatedCompany =
      await updateCompanyLogoByOwnerId(
        ownerId,
        {
          logoUrl:
            uploadResult.secure_url,

          logoPublicId:
            uploadResult.public_id
        }
      );

    if (!updatedCompany) {
      throw new AppError(
        "Unable to update company logo.",
        500,
        "COMPANY_LOGO_UPDATE_FAILED"
      );
    }

    if (
      oldLogoPublicId &&
      oldLogoPublicId !==
        uploadResult.public_id
    ) {
      try {
        await deleteCloudinaryAsset(
          oldLogoPublicId,
          "image"
        );
      } catch (cleanupError) {
        console.error(
          "Old company logo cleanup failed:",
          cleanupError.message
        );
      }
    }

    return updatedCompany;
  } catch (error) {
    try {
      await deleteCloudinaryAsset(
        uploadResult.public_id,
        "image"
      );
    } catch (cleanupError) {
      console.error(
        "Uploaded company logo rollback failed:",
        cleanupError.message
      );
    }

    throw error;
  }
};

const deleteOwnedCompanyLogo = async (
  ownerId
) => {
  const company =
    await getOwnedCompanyOrThrow(
      ownerId
    );

  if (!company.logoPublicId) {
    throw new AppError(
      "Company logo not found.",
      404,
      "COMPANY_LOGO_NOT_FOUND"
    );
  }

  const logoPublicId =
    company.logoPublicId;

  await deleteCloudinaryAsset(
    logoPublicId,
    "image"
  );

  const updatedCompany =
    await clearCompanyLogoByOwnerId(
      ownerId
    );

  if (!updatedCompany) {
    throw new AppError(
      "Unable to clear company logo.",
      500,
      "COMPANY_LOGO_DELETE_FAILED"
    );
  }

  return updatedCompany;
};

export {
  uploadOwnedCompanyLogo,
  deleteOwnedCompanyLogo
};