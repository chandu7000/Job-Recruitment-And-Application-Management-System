const PUBLIC_JOB_LIST_FIELDS =
  Object.freeze([
    "id",
    "title",
    "slug",
    "skills",
    "location",
    "workMode",
    "employmentType",
    "experienceLevel",
    "minimumExperience",
    "maximumExperience",
    "minimumSalary",
    "maximumSalary",
    "salaryCurrency",
    "vacancies",
    "applicationDeadline",
    "publishedAt",
    "viewCount"
  ]);

const PUBLIC_JOB_DETAIL_FIELDS =
  Object.freeze([
    "id",
    "title",
    "slug",
    "description",
    "responsibilities",
    "requirements",
    "skills",
    "location",
    "workMode",
    "employmentType",
    "experienceLevel",
    "minimumExperience",
    "maximumExperience",
    "minimumSalary",
    "maximumSalary",
    "salaryCurrency",
    "vacancies",
    "applicationDeadline",
    "publishedAt",
    "viewCount"
  ]);

const PUBLIC_COMPANY_SUMMARY_FIELDS =
  Object.freeze([
    "id",
    "companyName",
    "slug",
    "industry",
    "companySize",
    "location",
    "city",
    "state",
    "country",
    "logoUrl"
  ]);

const PUBLIC_COMPANY_DETAIL_FIELDS =
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
    "logoUrl"
  ]);

const convertToPlainObject = (
  entity
) => {
  if (
    entity === null ||
    entity === undefined
  ) {
    return null;
  }

  if (
    typeof entity.toJSON ===
    "function"
  ) {
    return entity.toJSON();
  }

  if (
    typeof entity.get ===
    "function"
  ) {
    return entity.get({
      plain: true
    });
  }

  if (
    typeof entity ===
    "object" &&
    !Array.isArray(entity)
  ) {
    return {
      ...entity
    };
  }

  return null;
};

const pickPublicFields = (
  source,
  allowedFields
) => {
  const plainSource =
    convertToPlainObject(
      source
    );

  if (!plainSource) {
    return null;
  }

  return Object.fromEntries(
    allowedFields
      .filter((field) =>
        Object.prototype
          .hasOwnProperty.call(
            plainSource,
            field
          )
      )
      .map((field) => [
        field,
        plainSource[field]
      ])
  );
};

const sanitizePublicCompanySummary =
  (
    company
  ) => {
    return pickPublicFields(
      company,
      PUBLIC_COMPANY_SUMMARY_FIELDS
    );
  };

const sanitizePublicCompanyDetail =
  (
    company
  ) => {
    return pickPublicFields(
      company,
      PUBLIC_COMPANY_DETAIL_FIELDS
    );
  };

const sanitizePublicJobListItem =
  (
    job
  ) => {
    const plainJob =
      convertToPlainObject(
        job
      );

    if (!plainJob) {
      return null;
    }

    const publicJob =
      pickPublicFields(
        plainJob,
        PUBLIC_JOB_LIST_FIELDS
      );

    return {
      ...publicJob,

      company:
        sanitizePublicCompanySummary(
          plainJob.company ??
          null
        )
    };
  };

const sanitizePublicJobDetail =
  (
    job
  ) => {
    const plainJob =
      convertToPlainObject(
        job
      );

    if (!plainJob) {
      return null;
    }

    const publicJob =
      pickPublicFields(
        plainJob,
        PUBLIC_JOB_DETAIL_FIELDS
      );

    return {
      ...publicJob,

      company:
        sanitizePublicCompanySummary(
          plainJob.company ??
          null
        )
    };
  };

const sanitizePublicJobList = (
  jobs = []
) => {
  if (!Array.isArray(jobs)) {
    return [];
  }

  return jobs
    .map(
      sanitizePublicJobListItem
    )
    .filter(Boolean);
};

export {
  PUBLIC_JOB_LIST_FIELDS,
  PUBLIC_JOB_DETAIL_FIELDS,
  PUBLIC_COMPANY_SUMMARY_FIELDS,
  PUBLIC_COMPANY_DETAIL_FIELDS,
  convertToPlainObject,
  pickPublicFields,
  sanitizePublicCompanySummary,
  sanitizePublicCompanyDetail,
  sanitizePublicJobListItem,
  sanitizePublicJobDetail,
  sanitizePublicJobList
};