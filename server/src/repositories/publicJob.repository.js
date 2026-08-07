import {
  Op,
  col,
  cast,
  literal,
  where as sequelizeWhere
} from "sequelize";

import {
  sequelize
} from "../config/database.js";

import Job from "../models/job.model.js";

import {
  JOB_STATUSES
} from "../constants/job.constants.js";

import {
  COMPANY_STATUSES
} from "../constants/company.constants.js";

import {
  PUBLIC_JOB_SORTS,
  PUBLIC_JOB_DEFAULT_SORT
} from "../constants/publicJob.constants.js";

const PUBLIC_JOB_ATTRIBUTES =
  Object.freeze([
    "id",
    "companyId",
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

const PUBLIC_JOB_DETAIL_ATTRIBUTES =
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
    "viewCount",

    // Internal eligibility fields.
    "status",
    "deletedAt"
  ]);

const PUBLIC_COMPANY_DETAIL_ATTRIBUTES =
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
    "logoUrl",

    // Internal eligibility fields.
    "status",
    "deletedAt"
  ]);

const PUBLIC_COMPANY_SUMMARY_ATTRIBUTES =
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
    "logoUrl",
    "status"
  ]);

const normalizePublicSearch = (
  search
) => {
  return typeof search === "string"
    ? search.trim()
    : "";
};

const normalizeOptionalFilter = (
  value
) => {
  return typeof value === "string"
    ? value.trim()
    : "";
};

const normalizeSkillsFilter = (
  skills
) => {
  const values =
    Array.isArray(skills)
      ? skills
      : typeof skills === "string"
        ? skills.split(",")
        : [];

  return [
    ...new Set(
      values
        .map((skill) =>
          typeof skill === "string"
            ? skill.trim()
            : ""
        )
        .filter(Boolean)
    )
  ];
};

const isDefinedNumber = (
  value
) => {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(
      Number(value)
    )
  );
};

const normalizePublicSort = (
  sort
) => {
  return typeof sort === "string" &&
    sort.trim()
    ? sort.trim()
    : PUBLIC_JOB_DEFAULT_SORT;
};

const buildRelevanceExpression = (
  search
) => {
  const normalizedSearch =
    normalizePublicSearch(
      search
    );

  if (!normalizedSearch) {
    return null;
  }

  const exactValue =
    sequelize.escape(
      normalizedSearch
    );

  const partialValue =
    sequelize.escape(
      `%${normalizedSearch}%`
    );

  return literal(`
    CASE
      WHEN LOWER(\`Job\`.\`title\`) =
           LOWER(${exactValue})
        THEN 1

      WHEN LOWER(\`Job\`.\`title\`) LIKE
           LOWER(${partialValue})
        THEN 2

      WHEN LOWER(
        CAST(\`Job\`.\`skills\` AS CHAR)
      ) LIKE LOWER(${partialValue})
        THEN 3

      WHEN LOWER(
        \`company\`.\`company_name\`
      ) LIKE LOWER(${partialValue})
        THEN 4

      WHEN LOWER(
        \`Job\`.\`location\`
      ) LIKE LOWER(${partialValue})
        THEN 5

      ELSE 6
    END
  `);
};

const buildPublicJobOrder = ({
  sort =
  PUBLIC_JOB_DEFAULT_SORT,
  search
} = {}) => {
  const normalizedSort =
    normalizePublicSort(
      sort
    );

  switch (normalizedSort) {
    case PUBLIC_JOB_SORTS.OLDEST:
      return [
        [
          "publishedAt",
          "ASC"
        ],
        [
          "id",
          "ASC"
        ]
      ];

    case PUBLIC_JOB_SORTS.DEADLINE_SOON:
      return [
        [
          "applicationDeadline",
          "ASC"
        ],
        [
          "publishedAt",
          "DESC"
        ],
        [
          "id",
          "DESC"
        ]
      ];

    case PUBLIC_JOB_SORTS.SALARY_ASCENDING:
      return [
        [
          "minimumSalary",
          "ASC"
        ],
        [
          "maximumSalary",
          "ASC"
        ],
        [
          "publishedAt",
          "DESC"
        ],
        [
          "id",
          "DESC"
        ]
      ];

    case PUBLIC_JOB_SORTS.SALARY_DESCENDING:
      return [
        [
          "maximumSalary",
          "DESC"
        ],
        [
          "minimumSalary",
          "DESC"
        ],
        [
          "publishedAt",
          "DESC"
        ],
        [
          "id",
          "DESC"
        ]
      ];

    case PUBLIC_JOB_SORTS.TITLE_ASCENDING:
      return [
        [
          "title",
          "ASC"
        ],
        [
          "publishedAt",
          "DESC"
        ],
        [
          "id",
          "DESC"
        ]
      ];

    case PUBLIC_JOB_SORTS.TITLE_DESCENDING:
      return [
        [
          "title",
          "DESC"
        ],
        [
          "publishedAt",
          "DESC"
        ],
        [
          "id",
          "DESC"
        ]
      ];

    case PUBLIC_JOB_SORTS.RELEVANCE: {
      const relevanceExpression =
        buildRelevanceExpression(
          search
        );

      if (!relevanceExpression) {
        return [
          [
            "publishedAt",
            "DESC"
          ],
          [
            "id",
            "DESC"
          ]
        ];
      }

      return [
        [
          relevanceExpression,
          "ASC"
        ],
        [
          "publishedAt",
          "DESC"
        ],
        [
          "id",
          "DESC"
        ]
      ];
    }

    case PUBLIC_JOB_SORTS.LATEST:
    default:
      return [
        [
          "publishedAt",
          "DESC"
        ],
        [
          "id",
          "DESC"
        ]
      ];
  }
};

const buildPublicJobWhere = ({
  now = new Date(),
  search,
  location,
  workMode,
  employmentType,
  experienceLevel,
  skills,
  minimumSalary,
  maximumSalary,
  companyId,
  publishedFrom,
  publishedTo,
  deadlineFrom,
  deadlineTo
} = {}) => {
  const where = {
    status:
      JOB_STATUSES.PUBLISHED,

    applicationDeadline: {
      [Op.ne]: null,
      [Op.gte]: now
    }
  };

  const normalizedSearch =
    normalizePublicSearch(
      search
    );

  if (normalizedSearch) {
    const searchPattern =
      `%${normalizedSearch}%`;

    where[Op.or] = [
      {
        title: {
          [Op.like]:
            searchPattern
        }
      },

      {
        location: {
          [Op.like]:
            searchPattern
        }
      },

      sequelizeWhere(
        cast(
          col("Job.skills"),
          "CHAR"
        ),
        {
          [Op.like]:
            searchPattern
        }
      ),

      sequelizeWhere(
        col(
          "company.company_name"
        ),
        {
          [Op.like]:
            searchPattern
        }
      )
    ];
  }

  const normalizedLocation =
    normalizeOptionalFilter(
      location
    );

  if (normalizedLocation) {
    where.location = {
      [Op.like]:
        `%${normalizedLocation}%`
    };
  }

  const normalizedWorkMode =
    normalizeOptionalFilter(
      workMode
    );

  if (normalizedWorkMode) {
    where.workMode =
      normalizedWorkMode;
  }

  const normalizedEmploymentType =
    normalizeOptionalFilter(
      employmentType
    );

  if (normalizedEmploymentType) {
    where.employmentType =
      normalizedEmploymentType;
  }

  const normalizedExperienceLevel =
    normalizeOptionalFilter(
      experienceLevel
    );

  if (normalizedExperienceLevel) {
    where.experienceLevel =
      normalizedExperienceLevel;
  }

  const normalizedSkills =
    normalizeSkillsFilter(
      skills
    );

  if (normalizedSkills.length > 0) {
    const skillConditions =
      normalizedSkills.map(
        (skill) =>
          sequelizeWhere(
            cast(
              col("Job.skills"),
              "CHAR"
            ),
            {
              [Op.like]:
                `%${skill}%`
            }
          )
      );

    where[Op.and] = [
      ...(where[Op.and] ?? []),
      ...skillConditions
    ];
  }

  if (
    isDefinedNumber(
      minimumSalary
    )
  ) {
    where.maximumSalary = {
      [Op.gte]:
        Number(minimumSalary)
    };
  }

  if (
    isDefinedNumber(
      maximumSalary
    )
  ) {
    where.minimumSalary = {
      [Op.lte]:
        Number(maximumSalary)
    };
  }

  const normalizedCompanyId =
    normalizeOptionalFilter(
      companyId
    );

  if (normalizedCompanyId) {
    where.companyId =
      normalizedCompanyId;
  }

  if (
    publishedFrom ||
    publishedTo
  ) {
    where.publishedAt = {};

    if (publishedFrom) {
      where.publishedAt[
        Op.gte
      ] = publishedFrom;
    }

    if (publishedTo) {
      where.publishedAt[
        Op.lte
      ] = publishedTo;
    }
  }

  if (deadlineFrom) {
    const effectiveDeadlineFrom =
      deadlineFrom.getTime() >
        now.getTime()
        ? deadlineFrom
        : now;

    where.applicationDeadline[
      Op.gte
    ] = effectiveDeadlineFrom;
  }

  if (deadlineTo) {
    where.applicationDeadline[
      Op.lte
    ] = deadlineTo;
  }

  return where;
};

const buildPublicCompanyInclude =
  () => {
    return {
      association:
        "company",

      attributes:
        PUBLIC_COMPANY_SUMMARY_ATTRIBUTES,

      required:
        true,

      where: {
        status:
          COMPANY_STATUSES.VERIFIED
      }
    };
  };

const buildPublicCompanyDetailInclude =
  () => {
    return {
      association:
        "company",

      attributes:
        PUBLIC_COMPANY_DETAIL_ATTRIBUTES,

      required:
        false,

      paranoid:
        false
    };
  };

const normalizeSimilarJob =
  (
    job = {}
  ) => {
    return {
      id:
        normalizeOptionalFilter(
          job.id
        ),

      skills:
        normalizeSkillsFilter(
          job.skills
        ),

      location:
        normalizeOptionalFilter(
          job.location
        ),

      workMode:
        normalizeOptionalFilter(
          job.workMode
        ),

      employmentType:
        normalizeOptionalFilter(
          job.employmentType
        ),

      experienceLevel:
        normalizeOptionalFilter(
          job.experienceLevel
        ),

      minimumSalary:
        isDefinedNumber(
          job.minimumSalary
        )
          ? Number(
            job.minimumSalary
          )
          : null,

      maximumSalary:
        isDefinedNumber(
          job.maximumSalary
        )
          ? Number(
            job.maximumSalary
          )
          : null
    };
  };

const buildSimilarJobConditions =
  (
    currentJob
  ) => {
    const normalizedJob =
      normalizeSimilarJob(
        currentJob
      );

    const conditions = [];

    const skillConditions =
      normalizedJob.skills.map(
        (skill) =>
          sequelizeWhere(
            cast(
              col("Job.skills"),
              "CHAR"
            ),
            {
              [Op.like]:
                `%${skill}%`
            }
          )
      );

    if (
      skillConditions.length > 0
    ) {
      conditions.push(
        ...skillConditions
      );
    }

    if (
      normalizedJob
        .experienceLevel
    ) {
      conditions.push({
        experienceLevel:
          normalizedJob
            .experienceLevel
      });
    }

    if (
      normalizedJob
        .employmentType
    ) {
      conditions.push({
        employmentType:
          normalizedJob
            .employmentType
      });
    }

    if (
      normalizedJob.workMode
    ) {
      conditions.push({
        workMode:
          normalizedJob.workMode
      });
    }

    if (
      normalizedJob.location
    ) {
      conditions.push({
        location: {
          [Op.like]:
            `%${normalizedJob.location}%`
        }
      });
    }

    if (
      normalizedJob
        .minimumSalary !== null &&
      normalizedJob
        .maximumSalary !== null
    ) {
      conditions.push({
        [Op.and]: [
          {
            maximumSalary: {
              [Op.gte]:
                normalizedJob
                  .minimumSalary
            }
          },

          {
            minimumSalary: {
              [Op.lte]:
                normalizedJob
                  .maximumSalary
            }
          }
        ]
      });
    }

    return conditions;
  };

const buildSimilarJobWhere =
  ({
    currentJob,
    now = new Date()
  }) => {
    const normalizedJob =
      normalizeSimilarJob(
        currentJob
      );

    const where =
      buildPublicJobWhere({
        now
      });

    where[Op.and] = [
      ...(where[Op.and] ?? []),

      {
        id: {
          [Op.ne]:
            normalizedJob.id
        }
      }
    ];

    const matchingConditions =
      buildSimilarJobConditions(
        normalizedJob
      );

    if (
      matchingConditions.length >
      0
    ) {
      where[Op.and].push({
        [Op.or]:
          matchingConditions
      });
    }

    return where;
  };

const buildSimilarJobScoreExpression =
  (
    currentJob
  ) => {
    const normalizedJob =
      normalizeSimilarJob(
        currentJob
      );

    const scoreParts = [];

    for (
      const skill of
      normalizedJob.skills
    ) {
      const escapedPattern =
        sequelize.escape(
          `%${skill}%`
        );

      scoreParts.push(`
        CASE
          WHEN LOWER(
            CAST(
              \`Job\`.\`skills\`
              AS CHAR
            )
          ) LIKE LOWER(
            ${escapedPattern}
          )
          THEN 5
          ELSE 0
        END
      `);
    }

    if (
      normalizedJob
        .experienceLevel
    ) {
      const value =
        sequelize.escape(
          normalizedJob
            .experienceLevel
        );

      scoreParts.push(`
        CASE
          WHEN
            \`Job\`.\`experience_level\`
            = ${value}
          THEN 4
          ELSE 0
        END
      `);
    }

    if (
      normalizedJob
        .employmentType
    ) {
      const value =
        sequelize.escape(
          normalizedJob
            .employmentType
        );

      scoreParts.push(`
        CASE
          WHEN
            \`Job\`.\`employment_type\`
            = ${value}
          THEN 3
          ELSE 0
        END
      `);
    }

    if (
      normalizedJob.workMode
    ) {
      const value =
        sequelize.escape(
          normalizedJob.workMode
        );

      scoreParts.push(`
        CASE
          WHEN
            \`Job\`.\`work_mode\`
            = ${value}
          THEN 2
          ELSE 0
        END
      `);
    }

    if (
      normalizedJob.location
    ) {
      const value =
        sequelize.escape(
          `%${normalizedJob.location}%`
        );

      scoreParts.push(`
        CASE
          WHEN LOWER(
            \`Job\`.\`location\`
          ) LIKE LOWER(
            ${value}
          )
          THEN 2
          ELSE 0
        END
      `);
    }

    if (
      normalizedJob
        .minimumSalary !== null &&
      normalizedJob
        .maximumSalary !== null
    ) {
      const minimumSalary =
        sequelize.escape(
          normalizedJob
            .minimumSalary
        );

      const maximumSalary =
        sequelize.escape(
          normalizedJob
            .maximumSalary
        );

      scoreParts.push(`
        CASE
          WHEN
            \`Job\`.\`maximum_salary\`
              >= ${minimumSalary}
          AND
            \`Job\`.\`minimum_salary\`
              <= ${maximumSalary}
          THEN 1
          ELSE 0
        END
      `);
    }

    if (
      scoreParts.length === 0
    ) {
      return literal("0");
    }

    return literal(
      `(${scoreParts.join(" + ")})`
    );
  };

const findSimilarPublicJobs =
  async ({
    currentJob,
    now = new Date(),
    limit = 5,
    transaction
  }) => {
    const normalizedLimit =
      Math.min(
        Math.max(
          Number.parseInt(
            limit,
            10
          ) || 5,
          1
        ),
        10
      );

    return Job.findAll({
      attributes:
        PUBLIC_JOB_ATTRIBUTES,

      where:
        buildSimilarJobWhere({
          currentJob,
          now
        }),

      include: [
        buildPublicCompanyInclude()
      ],

      order: [
        [
          buildSimilarJobScoreExpression(
            currentJob
          ),
          "DESC"
        ],

        [
          "publishedAt",
          "DESC"
        ],

        [
          "id",
          "DESC"
        ]
      ],

      limit:
        normalizedLimit,

      distinct:
        true,

      paranoid:
        true,

      transaction
    });
  };

const findEligiblePublicJobs =
  async ({
    limit = 10,
    offset = 0,
    sort =
    PUBLIC_JOB_DEFAULT_SORT,
    search,
    transaction,
    ...filters
  } = {}) => {
    return Job.findAll({
      attributes:
        PUBLIC_JOB_ATTRIBUTES,

      where:
        buildPublicJobWhere({
          search,
          ...filters
        }),

      include: [
        buildPublicCompanyInclude()
      ],

      limit,
      offset,

      order:
        buildPublicJobOrder({
          sort,
          search
        }),

      distinct:
        true,

      paranoid:
        true,

      transaction
    });
  };

const countEligiblePublicJobs =
  async ({
    transaction,
    ...filters
  } = {}) => {
    return Job.count({
      where:
        buildPublicJobWhere(
          filters
        ),

      include: [
        buildPublicCompanyInclude()
      ],

      distinct:
        true,

      col:
        "id",

      paranoid:
        true,

      transaction
    });
  };

const findPublicJobCandidateById =
  async (
    jobId,
    {
      transaction
    } = {}
  ) => {
    return Job.findByPk(
      jobId,
      {
        attributes:
          PUBLIC_JOB_DETAIL_ATTRIBUTES,

        include: [
          buildPublicCompanyDetailInclude()
        ],

        paranoid:
          false,

        transaction
      }
    );
  };

const findPublicJobCandidateBySlug =
  async (
    slug,
    {
      transaction
    } = {}
  ) => {
    return Job.findOne({
      where: {
        slug
      },

      attributes:
        PUBLIC_JOB_DETAIL_ATTRIBUTES,

      include: [
        buildPublicCompanyDetailInclude()
      ],

      paranoid:
        false,

      transaction
    });
  };

const incrementPublicJobView =
  async (
    jobId,
    {
      transaction
    } = {}
  ) => {
    await Job.increment(
      "viewCount",
      {
        by: 1,

        where: {
          id:
            jobId
        },

        transaction
      }
    );

    return true;
  };

export {
  PUBLIC_JOB_ATTRIBUTES,
  PUBLIC_JOB_DETAIL_ATTRIBUTES,
  PUBLIC_COMPANY_SUMMARY_ATTRIBUTES,
  PUBLIC_COMPANY_DETAIL_ATTRIBUTES,
  normalizePublicSearch,
  normalizeOptionalFilter,
  normalizeSkillsFilter,
  isDefinedNumber,
  normalizePublicSort,
  buildRelevanceExpression,
  buildPublicJobOrder,
  buildPublicJobWhere,
  buildPublicCompanyInclude,
  buildPublicCompanyDetailInclude,
  normalizeSimilarJob,
  buildSimilarJobConditions,
  buildSimilarJobWhere,
  buildSimilarJobScoreExpression,
  findSimilarPublicJobs,
  findEligiblePublicJobs,
  countEligiblePublicJobs,
  findPublicJobCandidateById,
  findPublicJobCandidateBySlug,
  incrementPublicJobView
};