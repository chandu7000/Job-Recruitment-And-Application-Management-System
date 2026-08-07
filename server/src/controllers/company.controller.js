import {
  createCompanyService,
  getMyCompaniesService,
  getCompanyByIdService,
  updateCompanyService,
  updateMyCompanyService,
  deleteCompanyService,
  submitMyCompanyForVerification
} from "../services/company.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";

const createCompany = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await createCompanyService({
        ...req.body,
        ownerId: req.user.id
      });

    return sendSuccess(
      res,
      201,
      "Company created successfully.",
      result
    );
  } catch (error) {
    next(error);
  }
};

const getMyCompanies = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await getMyCompaniesService(
        req.user.id
      );

    return sendSuccess(
      res,
      200,
      "Companies fetched successfully.",
      result
    );
  } catch (error) {
    next(error);
  }
};

const getCompany = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await getCompanyByIdService({
        companyId:
          req.params.companyId,

        ownerId:
          req.user.id
      });
    return sendSuccess(
      res,
      200,
      "Company fetched successfully.",
      result
    );
  } catch (error) {
    next(error);
  }
};

const updateCompanyController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await updateCompanyService({
        companyId:
          req.params.companyId,

        ownerId:
          req.user.id,

        updateData:
          req.body
      });

    return sendSuccess(
      res,
      200,
      "Company updated successfully.",
      result
    );
  } catch (error) {
    next(error);
  }
};

const deleteCompanyController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await deleteCompanyService({
        companyId:
          req.params.companyId,

        ownerId:
          req.user.id
      });

    return sendSuccess(
      res,
      200,
      result.message,
      {}
    );
  } catch (error) {
    next(error);
  }
};

const updateMyCompany = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await updateMyCompanyService({
        ownerId:
          req.user.id,

        updateData:
          req.body
      });

    return sendSuccess(
      res,
      200,
      "Company updated successfully.",
      result
    );
  } catch (error) {
    next(error);
  }
};

const submitMyCompanyVerification =
  async (
    req,
    res,
    next
  ) => {
    try {
      const company =
        await submitMyCompanyForVerification({
          ownerId:
            req.user.id
        });

      return sendSuccess(
        res,
        200,
        "Company submitted for verification successfully.",
        company
      );
    } catch (error) {
      return next(error);
    }
  };

export {
  createCompany,
  getMyCompanies,
  getCompany,
  updateMyCompany,
  submitMyCompanyVerification,
  updateCompanyController as updateCompany,
  deleteCompanyController as deleteCompany
};