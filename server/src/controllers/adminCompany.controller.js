import {
  getPendingCompanies,
  approveCompanyVerification,
  rejectCompanyByAdmin
} from "../services/adminCompany.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";

const getPendingCompanyList = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await getPendingCompanies({
        page:
          req.query.page,

        limit:
          req.query.limit
      });

    return sendSuccess(
      res,
      200,
      "Pending companies fetched successfully.",
      result
    );
  } catch (error) {
    return next(error);
  }
};

const verifyCompanyByAdmin = async (
  req,
  res,
  next
) => {
  try {
    const company =
      await approveCompanyVerification({
        companyId:
          req.params.id,

        adminId:
          req.user.id
      });

    return sendSuccess(
      res,
      200,
      "Company verified successfully.",
      company
    );
  } catch (error) {
    return next(error);
  }
};

const rejectCompanyByAdminController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const company =
        await rejectCompanyByAdmin({
          companyId:
            req.params.id,

          adminId:
            req.user.id,

          reason:
            req.body.reason
        });

      return sendSuccess(
        res,
        200,
        "Company rejected successfully.",
        company
      );
    } catch (error) {
      return next(error);
    }
  };

export {
  getPendingCompanyList,
  verifyCompanyByAdmin,
  rejectCompanyByAdminController
};