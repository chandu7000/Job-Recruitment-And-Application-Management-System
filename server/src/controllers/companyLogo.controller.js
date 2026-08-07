import {
  uploadOwnedCompanyLogo,
  deleteOwnedCompanyLogo
} from "../services/companyLogo.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";

const uploadCompanyLogo = async (
  req,
  res,
  next
) => {
  try {
    const company =
      await uploadOwnedCompanyLogo(
        req.user.id,
        req.file
      );

    return sendSuccess(
      res,
      200,
      "Company logo uploaded successfully.",
      {
        logoUrl:
          company.logoUrl,

        logoPublicId:
          company.logoPublicId
      }
    );
  } catch (error) {
    return next(error);
  }
};

const deleteCompanyLogo = async (
  req,
  res,
  next
) => {
  try {
    await deleteOwnedCompanyLogo(
      req.user.id
    );

    return sendSuccess(
      res,
      200,
      "Company logo deleted successfully.",
      {}
    );
  } catch (error) {
    return next(error);
  }
};

export {
  uploadCompanyLogo,
  deleteCompanyLogo
};