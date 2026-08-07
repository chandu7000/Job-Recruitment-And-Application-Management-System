import {
  COMPANY_STATUSES
} from "../constants/company.constants.js";

import {
  findCompaniesByStatus
} from "../repositories/company.repository.js";

import {
  verifyCompany,
  rejectCompanyVerification
} from "./company.service.js";

const getPendingCompanies = async ({
  page = 1,
  limit = 20
} = {}) => {
  const normalizedPage =
    Math.max(
      Number(page) || 1,
      1
    );

  const normalizedLimit =
    Math.min(
      Math.max(
        Number(limit) || 20,
        1
      ),
      100
    );

  const result =
    await findCompaniesByStatus(
      COMPANY_STATUSES
        .PENDING_VERIFICATION,
      {
        page:
          normalizedPage,

        limit:
          normalizedLimit
      }
    );

  return {
    companies:
      result.rows,

    pagination: {
      total:
        result.count,

      page:
        normalizedPage,

      limit:
        normalizedLimit,

      totalPages:
        Math.ceil(
          result.count /
          normalizedLimit
        )
    }
  };
};

const approveCompanyVerification =
  async ({
    companyId,
    adminId
  }) => {
    return verifyCompany({
      companyId,

      performedBy:
        adminId
    });
  };

const rejectCompanyByAdmin =
  async ({
    companyId,
    adminId,
    reason
  }) => {
    return rejectCompanyVerification({
      companyId,

      verificationReason:
        reason,

      performedBy:
        adminId
    });
  };

export {
  getPendingCompanies,
  approveCompanyVerification,
  rejectCompanyByAdmin
};