import Company from "../models/company.model.js";

const createCompany = async (
  companyData,
  { transaction } = {}
) => {
  return Company.create(
    companyData,
    {
      transaction
    }
  );
};

const findCompanyById = async (
  id,
  { transaction, lock } = {}
) => {
  return Company.findByPk(
    id,
    {
      transaction,
      lock
    }
  );
};

const findCompanyBySlug = async (
  slug,
  { transaction } = {}
) => {
  return Company.findOne({
    where: {
      slug
    },
    transaction
  });
};

const findOwnerCompanies = async (
  ownerId,
  { transaction } = {}
) => {
  return Company.findAll({
    where: {
      ownerId
    },

    order: [
      [
        "createdAt",
        "DESC"
      ]
    ],

    transaction
  });
};

const updateCompany = async (
  id,
  data,
  { transaction } = {}
) => {
  const company =
    await findCompanyById(
      id,
      {
        transaction,

        lock:
          transaction
            ? transaction.LOCK.UPDATE
            : undefined
      }
    );

  if (!company) {
    return null;
  }

  await company.update(
    data,
    {
      transaction
    }
  );

  return company;
};

const deleteCompany = async (
  id,
  { transaction } = {}
) => {
  const company =
    await findCompanyById(
      id,
      {
        transaction,

        lock:
          transaction
            ? transaction.LOCK.UPDATE
            : undefined
      }
    );

  if (!company) {
    return null;
  }

  await company.destroy({
    transaction
  });

  return company;
};

const findCompanyByOwnerId = async (
  ownerId,
  { transaction, lock } = {}
) => {
  return Company.findOne({
    where: {
      ownerId
    },
    transaction,
    lock,
    order: [
      [
        "createdAt",
        "DESC"
      ]
    ]
  });
};

const updateCompanyLogoByOwnerId = async (
  ownerId,
  logoData,
  { transaction } = {}
) => {
  const company =
    await findCompanyByOwnerId(
      ownerId,
      {
        transaction,
        lock:
          transaction
            ? transaction.LOCK.UPDATE
            : undefined
      }
    );

  if (!company) {
    return null;
  }

  await company.update(
    {
      logoUrl:
        logoData.logoUrl,

      logoPublicId:
        logoData.logoPublicId
    },
    {
      transaction
    }
  );

  return company;
};

const clearCompanyLogoByOwnerId = async (
  ownerId,
  { transaction } = {}
) => {
  const company =
    await findCompanyByOwnerId(
      ownerId,
      {
        transaction,
        lock:
          transaction
            ? transaction.LOCK.UPDATE
            : undefined
      }
    );

  if (!company) {
    return null;
  }

  await company.update(
    {
      logoUrl: null,
      logoPublicId: null
    },
    {
      transaction
    }
  );

  return company;
};

const findCompaniesByStatus = async (
  status,
  {
    page = 1,
    limit = 20,
    transaction
  } = {}
) => {
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

  const offset =
    (normalizedPage - 1) *
    normalizedLimit;

  return Company.findAndCountAll({
    where: {
      status
    },

    limit:
      normalizedLimit,

    offset,

    order: [
      [
        "createdAt",
        "ASC"
      ]
    ],

    transaction
  });
};

export {
  createCompany,
  findCompanyById,
  findCompanyBySlug,
  findCompanyByOwnerId,
  findOwnerCompanies,
  findCompaniesByStatus,
  updateCompany,
  updateCompanyLogoByOwnerId,
  clearCompanyLogoByOwnerId,
  deleteCompany
};