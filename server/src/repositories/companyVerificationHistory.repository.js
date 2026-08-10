import CompanyVerificationHistory from
  "../models/companyVerificationHistory.model.js";

const createCompanyVerificationHistory =
  async (
    historyData,
    { transaction } = {}
  ) => {
    return CompanyVerificationHistory.create(
      historyData,
      {
        transaction
      }
    );
  };

const findCompanyVerificationHistory =
  async (
    companyId,
    { transaction } = {}
  ) => {
    return CompanyVerificationHistory.findAll({
      where: {
        companyId
      },

      order: [
        [
          "created_at",
          "DESC"
        ]
      ],

      transaction
    });
  };

const findLatestCompanyVerificationHistory =
  async (
    companyId,
    { transaction } = {}
  ) => {
    return CompanyVerificationHistory.findOne({
      where: {
        companyId
      },

      order: [
        [
          "created_at",
          "DESC"
        ]
      ],

      transaction
    });
  };

export {
  createCompanyVerificationHistory,
  findCompanyVerificationHistory,
  findLatestCompanyVerificationHistory
};