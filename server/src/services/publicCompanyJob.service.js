import AppError from
  "../utils/AppError.js";

import {
  validatePublicCompanyEligibility
} from "../utils/publicCompanyEligibility.js";

import {
  getPublicJobs
} from "./publicJob.service.js";

import {
  findPublicCompanyCandidateById,
  findPublicCompanyCandidateBySlug
} from "../repositories/publicCompany.repository.js";

const findPublicCompanyForJobs =
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

const getPublicCompanyJobs =
  async ({
    type,
    value,
    query = {},
    now = new Date()
  }) => {
    let company;

    try {
      company =
        await findPublicCompanyForJobs({
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
        "Unable to fetch public company jobs.",
        500,
        "PUBLIC_COMPANY_JOBS_FETCH_FAILED"
      );
    }

    validatePublicCompanyEligibility(
      company
    );

    /*
     * The company ID from the validated URL company
     * must override any client-provided companyId query.
     */
    const result =
      await getPublicJobs({
        query: {
          ...query,

          companyId:
            company.id
        },

        now
      });

    return {
      company,
      jobs:
        result.jobs,
      pagination:
        result.pagination
    };
  };

const getPublicCompanyJobsById =
  async ({
    companyId,
    query = {},
    now = new Date()
  }) => {
    return getPublicCompanyJobs({
      type:
        "id",

      value:
        companyId,

      query,
      now
    });
  };

const getPublicCompanyJobsBySlug =
  async ({
    companySlug,
    query = {},
    now = new Date()
  }) => {
    return getPublicCompanyJobs({
      type:
        "slug",

      value:
        companySlug,

      query,
      now
    });
  };

export {
  findPublicCompanyForJobs,
  getPublicCompanyJobs,
  getPublicCompanyJobsById,
  getPublicCompanyJobsBySlug
};