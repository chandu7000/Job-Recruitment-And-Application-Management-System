import AppError from
  "../utils/AppError.js";

import {
  sanitizePublicCompanyDetail
} from "../utils/publicResponseSanitizer.js";

import {
  validatePublicCompanyEligibility
} from "../utils/publicCompanyEligibility.js";

import {
  findPublicCompanyCandidateById,
  findPublicCompanyCandidateBySlug
} from "../repositories/publicCompany.repository.js";

const getPublicCompanyCandidate =
  async ({
    type,
    value
  }) => {
    if (
      type === "id"
    ) {
      return findPublicCompanyCandidateById(
        value
      );
    }

    return findPublicCompanyCandidateBySlug(
      value
    );
  };

const getPublicCompanyDetails =
  async ({
    type,
    value
  }) => {
    let company;

    try {
      company =
        await getPublicCompanyCandidate({
          type,
          value
        });
    } catch (error) {
      if (
        error instanceof AppError
      ) {
        throw error;
      }

      throw new AppError(
        "Unable to fetch public company details.",
        500,
        "PUBLIC_COMPANY_DETAILS_FETCH_FAILED"
      );
    }

    validatePublicCompanyEligibility(
      company
    );

    return sanitizePublicCompanyDetail(
      company
    );
  };

const getPublicCompanyById =
  async ({
    companyId
  }) => {
    return getPublicCompanyDetails({
      type:
        "id",

      value:
        companyId
    });
  };

const getPublicCompanyBySlug =
  async ({
    slug
  }) => {
    return getPublicCompanyDetails({
      type:
        "slug",

      value:
        slug
    });
  };

export {
  getPublicCompanyCandidate,
  getPublicCompanyDetails,
  getPublicCompanyById,
  getPublicCompanyBySlug
};