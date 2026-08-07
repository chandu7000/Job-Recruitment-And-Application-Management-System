import AppError from "./AppError.js";

const validateCompanyOwnership = (
  company,
  authenticatedUserId
) => {
  if (!company) {
    throw new AppError(
      "Company not found.",
      404,
      "COMPANY_NOT_FOUND"
    );
  }

  if (
    String(company.ownerId) !==
    String(authenticatedUserId)
  ) {
    throw new AppError(
      "You are not allowed to access this company.",
      403,
      "COMPANY_ACCESS_FORBIDDEN"
    );
  }

  return true;
};

export default validateCompanyOwnership;