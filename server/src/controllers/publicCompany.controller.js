import {
  getPublicCompanyById,
  getPublicCompanyBySlug
} from "../services/publicCompany.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";

const getPublicCompanyDetailsById =
  async (
    req,
    res,
    next
  ) => {
    try {
      const company =
        await getPublicCompanyById({
          companyId:
            req.params.companyId
        });

      return sendSuccess(
        res,
        200,
        "Public company fetched successfully.",
        company
      );
    } catch (error) {
      return next(error);
    }
  };

const getPublicCompanyDetailsBySlug =
  async (
    req,
    res,
    next
  ) => {
    try {
      const company =
        await getPublicCompanyBySlug({
          slug:
            req.params.slug
        });

      return sendSuccess(
        res,
        200,
        "Public company fetched successfully.",
        company
      );
    } catch (error) {
      return next(error);
    }
  };

export {
  getPublicCompanyDetailsById,
  getPublicCompanyDetailsBySlug
};