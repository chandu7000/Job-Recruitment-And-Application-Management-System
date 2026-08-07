import {
  Op,
  col,
  cast,
  where as sequelizeWhere
} from "sequelize";

import Job from "../models/job.model.js";

import {
  JOB_STATUSES
} from "../constants/job.constants.js";

const RECRUITER_JOB_INCLUDE = Object.freeze([
  {
    association: "company",
    attributes: [
      "id",
      "ownerId",
      "companyName",
      "slug",
      "logoUrl",
      "status"
    ],
    required: true
  },
  {
    association: "creator",
    attributes: [
      "id",
      "email",
      "role",
      "status"
    ],
    required: true
  }
]);

const JOB_SORT_OPTIONS = Object.freeze({
  newest: [
    ["created_at", "DESC"]
  ],

  oldest: [
    ["created_at", "ASC"]
  ],

  deadlineSoon: [
    ["applicationDeadline", "ASC"],
    ["created_at", "DESC"]
  ],

  titleAscending: [
    ["title", "ASC"],
    ["created_at", "DESC"]
  ],

  titleDescending: [
    ["title", "DESC"],
    ["created_at", "DESC"]
  ],

  salaryAscending: [
    ["minimumSalary", "ASC"],
    ["created_at", "DESC"]
  ],

  salaryDescending: [
    ["maximumSalary", "DESC"],
    ["created_at", "DESC"]
  ]
});

const buildTransactionOptions = ({
  transaction,
  lock
} = {}) => {
  const options = {};

  if (transaction) {
    options.transaction = transaction;
  }

  if (
    transaction &&
    lock
  ) {
    options.lock = lock;
  }

  return options;
};

const buildRecruiterJobWhere = ({
  createdBy,
  companyId,
  filters = {},
  search
}) => {
  const where = {};

  if (createdBy) {
    where.createdBy = createdBy;
  }

  if (companyId) {
    where.companyId = companyId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.location) {
    where.location = {
      [Op.like]:
        `%${filters.location.trim()}%`
    };
  }

  if (filters.employmentType) {
    where.employmentType =
      filters.employmentType;
  }

  if (filters.workMode) {
    where.workMode =
      filters.workMode;
  }

  if (filters.experienceLevel) {
    where.experienceLevel =
      filters.experienceLevel;
  }

  if (
    filters.dateFrom ||
    filters.dateTo
  ) {
    where.created_at = {};

    if (filters.dateFrom) {
      where.created_at[
        Op.gte
      ] = filters.dateFrom;
    }

    if (filters.dateTo) {
      where.created_at[
        Op.lte
      ] = filters.dateTo;
    }
  }

  if (
    filters.publishedFrom ||
    filters.publishedTo
  ) {
    where.publishedAt = {};

    if (
      filters.publishedFrom
    ) {
      where.publishedAt[
        Op.gte
      ] =
        filters.publishedFrom;
    }

    if (
      filters.publishedTo
    ) {
      where.publishedAt[
        Op.lte
      ] =
        filters.publishedTo;
    }
  }

  if (
    filters.deadlineFrom ||
    filters.deadlineTo
  ) {
    where.applicationDeadline =
      {};

    if (
      filters.deadlineFrom
    ) {
      where.applicationDeadline[
        Op.gte
      ] =
        filters.deadlineFrom;
    }

    if (
      filters.deadlineTo
    ) {
      where.applicationDeadline[
        Op.lte
      ] =
        filters.deadlineTo;
    }
  }

  if (
    filters.minimumSalary !==
    undefined &&
    filters.minimumSalary !== null
  ) {
    where.maximumSalary = {
      [Op.gte]:
        filters.minimumSalary
    };
  }

  if (
    filters.maximumSalary !==
    undefined &&
    filters.maximumSalary !== null
  ) {
    where.minimumSalary = {
      [Op.lte]:
        filters.maximumSalary
    };
  }

  const normalizedSearch =
    typeof search === "string"
      ? search.trim()
      : "";

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
      )
    ];
  }

  return where;
};

const resolveJobSort = (
  sort = "newest"
) => {
  return (
    JOB_SORT_OPTIONS[sort] ??
    JOB_SORT_OPTIONS.newest
  );
};

const createJob = async (
  jobData,
  {
    transaction
  } = {}
) => {
  return Job.create(
    jobData,
    {
      transaction
    }
  );
};

const findJobById = async (
  jobId,
  {
    transaction,
    lock,
    includeAssociations = false,
    paranoid = true
  } = {}
) => {
  return Job.findByPk(
    jobId,
    {
      ...buildTransactionOptions({
        transaction,
        lock
      }),

      paranoid,

      include:
        includeAssociations
          ? RECRUITER_JOB_INCLUDE
          : undefined
    }
  );
};

const findJobBySlug = async (
  slug,
  {
    transaction,
    lock,
    includeAssociations = false,
    paranoid = true
  } = {}
) => {
  return Job.findOne({
    where: {
      slug
    },

    ...buildTransactionOptions({
      transaction,
      lock
    }),

    paranoid,

    include:
      includeAssociations
        ? RECRUITER_JOB_INCLUDE
        : undefined
  });
};

const findJobByIdAndCompanyId =
  async (
    jobId,
    companyId,
    {
      transaction,
      lock,
      includeAssociations = false,
      paranoid = true
    } = {}
  ) => {
    return Job.findOne({
      where: {
        id: jobId,
        companyId
      },

      ...buildTransactionOptions({
        transaction,
        lock
      }),

      paranoid,

      include:
        includeAssociations
          ? RECRUITER_JOB_INCLUDE
          : undefined
    });
  };

const findRecruiterJobs = async ({
  createdBy,
  companyId,
  limit = 10,
  offset = 0,
  filters = {},
  search,
  sort = "newest",
  transaction
}) => {
  const where =
    buildRecruiterJobWhere({
      createdBy,
      companyId,
      filters,
      search
    });

  return Job.findAll({
    where,
    limit,
    offset,

    order:
      resolveJobSort(sort),

    include:
      RECRUITER_JOB_INCLUDE,

    distinct: true,

    transaction
  });
};

const findRecruiterJobById =
  async ({
    jobId,
    createdBy,
    companyId,
    transaction,
    lock
  }) => {
    const where = {
      id: jobId
    };

    if (createdBy) {
      where.createdBy =
        createdBy;
    }

    if (companyId) {
      where.companyId =
        companyId;
    }

    return Job.findOne({
      where,

      include:
        RECRUITER_JOB_INCLUDE,

      ...buildTransactionOptions({
        transaction,
        lock
      })
    });
  };

const countRecruiterJobs = async ({
  createdBy,
  companyId,
  filters = {},
  search,
  transaction
}) => {
  const where =
    buildRecruiterJobWhere({
      createdBy,
      companyId,
      filters,
      search
    });

  return Job.count({
    where,
    distinct: true,
    col: "id",
    transaction
  });
};

const updateJob = async (
  jobId,
  jobData,
  {
    transaction,
    returning = true
  } = {}
) => {
  const job =
    await Job.findByPk(
      jobId,
      {
        transaction
      }
    );

  if (!job) {
    return null;
  }

  await job.update(
    jobData,
    {
      transaction
    }
  );

  return returning
    ? job
    : true;
};

const updateJobStatus = async (
  jobId,
  statusData,
  {
    transaction,
    lock
  } = {}
) => {
  const job =
    await Job.findByPk(
      jobId,
      {
        ...buildTransactionOptions({
          transaction,
          lock
        })
      }
    );

  if (!job) {
    return null;
  }

  await job.update(
    statusData,
    {
      transaction
    }
  );

  return job;
};

const publishJob = async (
  jobId,
  {
    publishedAt =
    new Date(),

    slug
  } = {},
  {
    transaction,
    lock
  } = {}
) => {
  const publicationData = {
    status:
      JOB_STATUSES.PUBLISHED,

    publishedAt,

    closedAt: null,
    removedAt: null,
    removalReason: null,
    closureReason: null
  };

  if (
    slug !== undefined
  ) {
    publicationData.slug =
      slug;
  }

  return updateJobStatus(
    jobId,
    publicationData,
    {
      transaction,
      lock
    }
  );
};

const closeJob = async (
  jobId,
  {
    closedAt =
    new Date(),

    closureReason = null
  } = {},
  {
    transaction,
    lock
  } = {}
) => {
  return updateJobStatus(
    jobId,
    {
      status:
        JOB_STATUSES.CLOSED,

      closedAt,
      closureReason
    },
    {
      transaction,
      lock
    }
  );
};

const deleteDraftJob = async (
  jobId,
  {
    transaction,
    force = false
  } = {}
) => {
  const job =
    await Job.findOne({
      where: {
        id: jobId,

        status:
          JOB_STATUSES.DRAFT,

        applicationCount: 0
      },

      transaction
    });

  if (!job) {
    return null;
  }

  await job.destroy({
    transaction,
    force
  });

  return true;
};

const findExpiredPublishedJobs =
  async ({
    now = new Date(),
    limit,
    transaction,
    lock
  } = {}) => {
    const options = {
      where: {
        status:
          JOB_STATUSES.PUBLISHED,

        applicationDeadline: {
          [Op.lt]: now
        }
      },

      order: [
        [
          "applicationDeadline",
          "ASC"
        ]
      ],

      transaction
    };

    if (
      Number.isInteger(limit) &&
      limit > 0
    ) {
      options.limit = limit;
    }

    if (
      transaction &&
      lock
    ) {
      options.lock = lock;
    }

    return Job.findAll(options);
  };

const markExpiredJobsClosed =
  async ({
    now = new Date(),
    closedAt = new Date(),
    closureReason =
    "DEADLINE_EXPIRED",
    transaction
  } = {}) => {
    return Job.update(
      {
        status:
          JOB_STATUSES.CLOSED,

        closedAt,
        closureReason
      },
      {
        where: {
          status:
            JOB_STATUSES.PUBLISHED,

          applicationDeadline: {
            [Op.lt]: now
          }
        },

        transaction
      }
    );
  };

/*
 * Temporary backward-compatible methods.
 *
 * These are retained while the existing service is redesigned
 * gradually in Steps 6.6–6.14.
 */

const findJobsByCompany = async (
  companyId,
  {
    transaction
  } = {}
) => {
  return Job.findAll({
    where: {
      companyId
    },

    order: [
      ["created_at", "DESC"]
    ],

    transaction
  });
};

const findAllActiveJobs = async (
  {
    now = new Date(),
    transaction
  } = {}
) => {
  return Job.findAll({
    where: {
      status:
        JOB_STATUSES.PUBLISHED,

      [Op.or]: [
        {
          applicationDeadline:
            null
        },
        {
          applicationDeadline: {
            [Op.gte]: now
          }
        }
      ]
    },

    order: [
      ["publishedAt", "DESC"],
      ["created_at", "DESC"]
    ],

    transaction
  });
};

const deleteJob = async (
  jobId,
  {
    transaction,
    force = false
  } = {}
) => {
  const job =
    await Job.findByPk(
      jobId,
      {
        transaction
      }
    );

  if (!job) {
    return null;
  }

  await job.destroy({
    transaction,
    force
  });

  return true;
};

export {
  createJob,
  findJobById,
  findJobBySlug,
  findJobByIdAndCompanyId,
  findRecruiterJobs,
  findRecruiterJobById,
  countRecruiterJobs,
  updateJob,
  updateJobStatus,
  publishJob,
  closeJob,
  deleteDraftJob,
  findExpiredPublishedJobs,
  markExpiredJobsClosed,

  // Temporary compatibility exports
  findJobsByCompany,
  findAllActiveJobs,
  deleteJob,
};