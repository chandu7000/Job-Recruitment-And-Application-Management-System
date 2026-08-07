import {
  COMPANY_STATUSES
} from "../constants/company.constants.js";

import AppError from "./AppError.js";

const validateCompanyJobEligibility = (
  company
) => {
  if (
    company.status !==
    COMPANY_STATUSES.VERIFIED
  ) {
    throw new AppError(
      "Jobs can be created only for a verified company.",
      409,
      "COMPANY_NOT_VERIFIED"
    );
  }

  return true;
};

export default validateCompanyJobEligibility;