import {
  getPublicCompanyJobsById,
  getPublicCompanyJobsBySlug
} from "../services/publicCompanyJob.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";

const listPublicCompanyJobsById =
  async (
    req,
    res,
    next
  ) => {
    try {
      const result =
        await getPublicCompanyJobsById({
          companyId:
            req.params.companyId,

          query:
            req.query
        });

      return sendSuccess(
        res,
        200,
        "Public company jobs fetched successfully.",
        result.jobs,
        result.pagination
      );
    } catch (error) {
      return next(error);
    }
  };

const listPublicCompanyJobsBySlug =
  async (
    req,
    res,
    next
  ) => {
    try {
      const result =
        await getPublicCompanyJobsBySlug({
          companySlug:
            req.params.companySlug,

          query:
            req.query
        });

      return sendSuccess(
        res,
        200,
        "Public company jobs fetched successfully.",
        result.jobs,
        result.pagination
      );
    } catch (error) {
      return next(error);
    }
  };

export {
  listPublicCompanyJobsById,
  listPublicCompanyJobsBySlug
};