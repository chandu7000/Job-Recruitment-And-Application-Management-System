import {
  randomUUID
} from "node:crypto";

import {
  sequelize
} from "../config/database.js";

import {
  recordCompanyVerificationTransition
} from "./companyVerificationHistory.service.js";

import {
  COMPANY_STATUSES
} from "../constants/company.constants.js";

import {
  validateCompanyStatusTransition
} from "../utils/companyStatusTransition.js";

import AppError from "../utils/AppError.js";

import validateCompanyOwnership from "../utils/companyOwnership.js";

import {
  createCompany,
  findCompanyById,
  findCompanyByOwnerId,
  findOwnerCompanies,
  updateCompany,
  deleteCompany
} from "../repositories/company.repository.js";

const generateCompanySlug = (
  companyName
) => {
  const normalizedName =
    companyName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const uniqueSuffix =
    randomUUID()
      .replace(/-/g, "")
      .slice(0, 8);

  return `${normalizedName || "company"
    }-${uniqueSuffix}`;
};

const createCompanyService = async ({
  ownerId,
  companyName,
  companyEmail,
  companyPhone,
  website,
  industry,
  companySize,
  foundedYear,
  description,
  location,
  address,
  city,
  state,
  country,
  postalCode
}) => {
  const slug =
    generateCompanySlug(
      companyName
    );

  return createCompany({
    ownerId,
    companyName,
    slug,
    companyEmail,
    companyPhone,
    website,
    industry,
    companySize,
    foundedYear,
    description,
    location,
    address,
    city,
    state,
    country,
    postalCode,
    status:
      COMPANY_STATUSES.DRAFT
  });
};

const getMyCompaniesService = async (
  ownerId
) => {
  return findOwnerCompanies(
    ownerId
  );
};

const getCompanyByIdService = async ({
  companyId,
  ownerId
}) => {
  const company =
    await findCompanyById(
      companyId
    );

  validateCompanyOwnership(
    company,
    ownerId
  );

  return company;
};

const updateCompanyService = async ({
  companyId,
  ownerId,
  updateData
}) => {
  const company =
    await findCompanyById(
      companyId
    );

  validateCompanyOwnership(
    company,
    ownerId
  );

  const protectedFields = [
    "id",
    "ownerId",
    "slug",
    "status",
    "verificationReason",
    "logoUrl",
    "logoPublicId",
    "createdAt",
    "updatedAt",
    "deletedAt"
  ];

  const sanitizedUpdateData =
    Object.fromEntries(
      Object.entries(
        updateData
      ).filter(
        ([field]) =>
          !protectedFields.includes(
            field
          )
      )
    );

  const updatedCompany =
    await updateCompany(
      companyId,
      sanitizedUpdateData
    );

  if (!updatedCompany) {
    throw new AppError(
      "Unable to update company.",
      500,
      "COMPANY_UPDATE_FAILED"
    );
  }

  return updatedCompany;
};

const deleteCompanyService = async ({
  companyId,
  ownerId
}) => {
  const company =
    await findCompanyById(
      companyId
    );

  validateCompanyOwnership(
    company,
    ownerId
  );

  const deletedCompany =
    await deleteCompany(
      companyId
    );

  if (!deletedCompany) {
    throw new AppError(
      "Unable to delete company.",
      500,
      "COMPANY_DELETE_FAILED"
    );
  }

  return {
    message:
      "Company deleted successfully."
  };
};

const changeCompanyStatus = async ({
  companyId,
  nextStatus,
  verificationReason = null,
  performedBy
}) => {
  return sequelize.transaction(
    async (transaction) => {
      const company =
        await findCompanyById(
          companyId,
          {
            transaction,
            lock:
              transaction.LOCK.UPDATE
          }
        );

      if (!company) {
        throw new AppError(
          "Company not found.",
          404,
          "COMPANY_NOT_FOUND"
        );
      }

      const oldStatus =
        company.status;

      validateCompanyStatusTransition(
        oldStatus,
        nextStatus
      );

      const statusData = {
        status: nextStatus
      };

      if (
        nextStatus ===
        COMPANY_STATUSES.REJECTED
      ) {
        if (
          !verificationReason ||
          !verificationReason.trim()
        ) {
          throw new AppError(
            "Verification reason is required when rejecting a company.",
            400,
            "COMPANY_REJECTION_REASON_REQUIRED"
          );
        }

        statusData.verificationReason =
          verificationReason.trim();
      } else {
        statusData.verificationReason =
          null;
      }

      const updatedCompany =
        await updateCompany(
          companyId,
          statusData,
          {
            transaction
          }
        );

      if (!updatedCompany) {
        throw new AppError(
          "Unable to update company status.",
          500,
          "COMPANY_STATUS_UPDATE_FAILED"
        );
      }

      await recordCompanyVerificationTransition({
        companyId,
        oldStatus,
        newStatus:
          nextStatus,

        reason:
          statusData.verificationReason,

        performedBy,
        transaction
      });

      return updatedCompany;
    }
  );
};

const submitCompanyForVerification =
  async ({
    companyId,
    ownerId
  }) => {
    const company =
      await findCompanyById(
        companyId
      );

    validateCompanyOwnership(
      company,
      ownerId
    );

    return changeCompanyStatus({
      companyId,

      nextStatus:
        COMPANY_STATUSES.PENDING_VERIFICATION,

      performedBy:
        ownerId
    });
  };

const verifyCompany = async ({
  companyId,
  performedBy
}) => {
  return changeCompanyStatus({
    companyId,

    nextStatus:
      COMPANY_STATUSES.VERIFIED,

    performedBy
  });
};

const rejectCompanyVerification =
  async ({
    companyId,
    verificationReason,
    performedBy
  }) => {
    return changeCompanyStatus({
      companyId,

      nextStatus:
        COMPANY_STATUSES.REJECTED,

      verificationReason,
      performedBy
    });
  };

const markCompanyAsResubmitted =
  async ({
    companyId,
    ownerId
  }) => {
    const company =
      await findCompanyById(
        companyId
      );

    validateCompanyOwnership(
      company,
      ownerId
    );

    return changeCompanyStatus({
      companyId,

      nextStatus:
        COMPANY_STATUSES.RESUBMITTED,

      performedBy:
        ownerId
    });
  };

const updateMyCompanyService = async ({
  ownerId,
  updateData
}) => {
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

  const allowedFields = [
    "description",
    "website",
    "industry",
    "location",
    "companySize"
  ];

  const sanitizedUpdateData =
    Object.fromEntries(
      Object.entries(
        updateData
      ).filter(
        ([field]) =>
          allowedFields.includes(field)
      )
    );

  if (
    Object.keys(
      sanitizedUpdateData
    ).length === 0
  ) {
    throw new AppError(
      "At least one supported company field is required.",
      400,
      "COMPANY_UPDATE_FIELDS_REQUIRED"
    );
  }

  const updatedCompany =
    await updateCompany(
      company.id,
      sanitizedUpdateData
    );

  if (!updatedCompany) {
    throw new AppError(
      "Unable to update company.",
      500,
      "COMPANY_UPDATE_FAILED"
    );
  }

  return updatedCompany;
};

const validateCompanyVerificationDetails = (
  company
) => {
  const missingFields = [];

  if (!company.companyName?.trim()) {
    missingFields.push(
      "companyName"
    );
  }

  if (!company.description?.trim()) {
    missingFields.push(
      "description"
    );
  }

  if (!company.website?.trim()) {
    missingFields.push(
      "website"
    );
  }

  if (!company.industry?.trim()) {
    missingFields.push(
      "industry"
    );
  }

  if (
    !company.logoUrl ||
    !company.logoPublicId
  ) {
    missingFields.push(
      "logo"
    );
  }

  if (
    missingFields.length > 0
  ) {
    throw new AppError(
      `Complete the following company fields before verification: ${missingFields.join(", ")}.`,
      400,
      "COMPANY_VERIFICATION_DETAILS_INCOMPLETE"
    );
  }

  return true;
};

const submitMyCompanyForVerification =
  async ({
    ownerId
  }) => {
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

    if (
      company.ownerId !== ownerId
    ) {
      throw new AppError(
        "You are not allowed to submit this company for verification.",
        403,
        "COMPANY_ACCESS_FORBIDDEN"
      );
    }

    validateCompanyVerificationDetails(
      company
    );

    if (
      company.status !==
      COMPANY_STATUSES.DRAFT
    ) {
      throw new AppError(
        "Only a company in DRAFT status can be submitted for verification.",
        409,
        "COMPANY_NOT_IN_DRAFT_STATUS"
      );
    }

    return changeCompanyStatus({
      companyId:
        company.id,

      nextStatus:
        COMPANY_STATUSES
          .PENDING_VERIFICATION,

      performedBy:
        ownerId
    });
  };

export {
  createCompanyService,
  getMyCompaniesService,
  getCompanyByIdService,
  updateCompanyService,
  updateMyCompanyService,
  deleteCompanyService,
  changeCompanyStatus,
  submitCompanyForVerification,
  submitMyCompanyForVerification,
  verifyCompany,
  rejectCompanyVerification,
  markCompanyAsResubmitted,
  validateCompanyVerificationDetails
};