import {
  getSimilarPublicJobs
} from "../services/publicSimilarJob.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";

const listSimilarPublicJobs =
  async (
    req,
    res,
    next
  ) => {
    try {
      const result =
        await getSimilarPublicJobs({
          jobId:
            req.params.jobId,

          limit:
            req.query.limit
        });

      return sendSuccess(
        res,
        200,
        "Similar public jobs fetched successfully.",
        result.jobs,
        result.meta
      );
    } catch (error) {
      return next(error);
    }
  };

export {
  listSimilarPublicJobs
};