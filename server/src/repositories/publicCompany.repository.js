import Company from
  "../models/company.model.js";

const PUBLIC_COMPANY_DETAIL_ATTRIBUTES =
  Object.freeze([
    "id",
    "companyName",
    "slug",
    "description",
    "website",
    "industry",
    "companySize",
    "foundedYear",
    "location",
    "city",
    "state",
    "country",
    "logoUrl",

    // Internal eligibility fields
    "status",
    "deletedAt"
  ]);

const findPublicCompanyCandidateById =
  async (
    companyId,
    {
      transaction
    } = {}
  ) => {
    return Company.findByPk(
      companyId,
      {
        attributes:
          PUBLIC_COMPANY_DETAIL_ATTRIBUTES,

        paranoid:
          false,

        transaction
      }
    );
  };

const findPublicCompanyCandidateBySlug =
  async (
    slug,
    {
      transaction
    } = {}
  ) => {
    return Company.findOne({
      where: {
        slug
      },

      attributes:
        PUBLIC_COMPANY_DETAIL_ATTRIBUTES,

      paranoid:
        false,

      transaction
    });
  };

export {
  PUBLIC_COMPANY_DETAIL_ATTRIBUTES,
  findPublicCompanyCandidateById,
  findPublicCompanyCandidateBySlug
};