import {
  getPublicJobs,
  getPublicJobById,
  getPublicJobBySlug
} from "../services/publicJob.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";

const listPublicJobs = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await getPublicJobs({
        query:
          req.query
      });

    return sendSuccess(
      res,
      200,
      "Public jobs fetched successfully.",
      result.jobs,
      result.pagination
    );
  } catch (error) {
    return next(error);
  }
};

const getPublicJobDetailsById =
  async (
    req,
    res,
    next
  ) => {
    try {
      const job =
        await getPublicJobById({
          jobId:
            req.params.jobId
        });

      return sendSuccess(
        res,
        200,
        "Public job fetched successfully.",
        job
      );
    } catch (error) {
      return next(error);
    }
  };

const getPublicJobDetailsBySlug =
  async (
    req,
    res,
    next
  ) => {
    try {
      const job =
        await getPublicJobBySlug({
          slug:
            req.params.slug
        });

      return sendSuccess(
        res,
        200,
        "Public job fetched successfully.",
        job
      );
    } catch (error) {
      return next(error);
    }
  };

export {
  listPublicJobs,
  getPublicJobDetailsById,
  getPublicJobDetailsBySlug
};