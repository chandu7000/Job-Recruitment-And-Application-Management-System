import AppError from "../utils/AppError.js";

import {
  getPagination,
  getPaginationMeta
} from "../utils/pagination.js";

import {
  sanitizePublicJobList,
  sanitizePublicJobDetail
} from "../utils/publicResponseSanitizer.js";

import {
  validatePublicJobEligibility
} from "../utils/publicJobEligibility.js";

import {
  PUBLIC_JOB_DEFAULT_SORT
} from "../constants/publicJob.constants.js";

import {
  findEligiblePublicJobs,
  countEligiblePublicJobs,
  findPublicJobCandidateById,
  findPublicJobCandidateBySlug,
  incrementPublicJobView
} from "../repositories/publicJob.repository.js";

const normalizeSearch = (
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

const normalizeSort = (
  sort
) => {
  return (
    typeof sort === "string" &&
    sort.trim()
  )
    ? sort.trim()
    : PUBLIC_JOB_DEFAULT_SORT;
};

const normalizeSkills = (
  skills
) => {
  if (
    typeof skills !==
    "string"
  ) {
    return [];
  }

  return [
    ...new Set(
      skills
        .split(",")
        .map((skill) =>
          skill.trim()
        )
        .filter(Boolean)
    )
  ];
};

const normalizeOptionalNumber = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numberValue =
    Number(value);

  return Number.isFinite(
    numberValue
  )
    ? numberValue
    : null;
};

const normalizeOptionalDate = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (
    value instanceof Date
  ) {
    return value;
  }

  const parsedDate =
    new Date(value);

  return Number.isNaN(
    parsedDate.getTime()
  )
    ? null
    : parsedDate;
};

const normalizePublicJobListQuery =
  (
    query = {}
  ) => {
    const pagination =
      getPagination(
        query
      );

    const normalized = {
      ...pagination,

      search:
        normalizeSearch(
          query.search
        ),

      sort:
        normalizeSort(
          query.sort
        ),

      location:
        normalizeOptionalFilter(
          query.location
        ),

      workMode:
        normalizeOptionalFilter(
          query.workMode
        ),

      employmentType:
        normalizeOptionalFilter(
          query.employmentType
        ),

      experienceLevel:
        normalizeOptionalFilter(
          query.experienceLevel
        )
    };

    const skills =
      normalizeSkills(
        query.skills
      );

    if (
      skills.length > 0
    ) {
      normalized.skills =
        skills;
    }

    const minimumSalary =
      normalizeOptionalNumber(
        query.minimumSalary
      );

    if (
      minimumSalary !== null
    ) {
      normalized.minimumSalary =
        minimumSalary;
    }

    const maximumSalary =
      normalizeOptionalNumber(
        query.maximumSalary
      );

    if (
      maximumSalary !== null
    ) {
      normalized.maximumSalary =
        maximumSalary;
    }

    const companyId =
      normalizeOptionalFilter(
        query.companyId
      );

    if (companyId) {
      normalized.companyId =
        companyId;
    }

    const publishedFrom =
      normalizeOptionalDate(
        query.publishedFrom
      );

    if (publishedFrom) {
      normalized.publishedFrom =
        publishedFrom;
    }

    const publishedTo =
      normalizeOptionalDate(
        query.publishedTo
      );

    if (publishedTo) {
      normalized.publishedTo =
        publishedTo;
    }

    const deadlineFrom =
      normalizeOptionalDate(
        query.deadlineFrom
      );

    if (deadlineFrom) {
      normalized.deadlineFrom =
        deadlineFrom;
    }

    const deadlineTo =
      normalizeOptionalDate(
        query.deadlineTo
      );

    if (deadlineTo) {
      normalized.deadlineTo =
        deadlineTo;
    }

    return normalized;
  };

const getPublicJobs =
  async ({
    query = {},
    now = new Date()
  } = {}) => {
    const normalizedQuery =
      normalizePublicJobListQuery(
        query
      );

    const {
      page,
      limit,
      offset,
      sort,
      ...filters
    } = normalizedQuery;

    const repositoryFilters = {
      now,
      ...filters
    };

    let jobs;
    let totalRecords;

    try {
      [
        jobs,
        totalRecords
      ] = await Promise.all([
        findEligiblePublicJobs({
          limit,
          offset,
          sort,
          ...repositoryFilters
        }),

        countEligiblePublicJobs(
          repositoryFilters
        )
      ]);
    } catch (error) {
      if (
        error instanceof AppError
      ) {
        throw error;
      }

      throw new AppError(
        "Unable to fetch public jobs.",
        500,
        "PUBLIC_JOBS_FETCH_FAILED"
      );
    }

    return {
      jobs:
        sanitizePublicJobList(
          jobs
        ),

      pagination:
        getPaginationMeta(
          page,
          limit,
          totalRecords
        )
    };
  };

const getPublicJobCandidate =
  async ({
    type,
    value
  }) => {
    if (
      type === "id"
    ) {
      return findPublicJobCandidateById(
        value
      );
    }

    return findPublicJobCandidateBySlug(
      value
    );
  };

const getPublicJobDetails =
  async ({
    type,
    value,
    now = new Date()
  }) => {
    let job;

    try {
      job =
        await getPublicJobCandidate({
          type,
          value
        });
    } catch (error) {

      if (
        error instanceof AppError
      ) {
        throw error;
      }

      throw new AppError(
        "Unable to fetch public job details.",
        500,
        "PUBLIC_JOB_DETAILS_FETCH_FAILED"
      );
    }

    validatePublicJobEligibility(
      job,
      job?.company ?? null,
      {
        now
      }
    );

    try {
      await incrementPublicJobView(
        job.id
      );
    } catch (error) {
      if (
        error instanceof AppError
      ) {
        throw error;
      }

      throw new AppError(
        "Unable to update public job view.",
        500,
        "PUBLIC_JOB_VIEW_UPDATE_FAILED"
      );
    }

    const sanitizedJob =
      sanitizePublicJobDetail(
        job
      );

    return {
      ...sanitizedJob,

      viewCount:
        Number(
          sanitizedJob.viewCount ??
          0
        ) + 1
    };
  };

const getPublicJobById =
  async ({
    jobId,
    now = new Date()
  }) => {
    return getPublicJobDetails({
      type:
        "id",

      value:
        jobId,

      now
    });
  };

const getPublicJobBySlug =
  async ({
    slug,
    now = new Date()
  }) => {
    return getPublicJobDetails({
      type:
        "slug",

      value:
        slug,

      now
    });
  };

export {
  normalizeSearch,
  normalizeOptionalFilter,
  normalizeSort,
  normalizeSkills,
  normalizeOptionalNumber,
  normalizeOptionalDate,
  normalizePublicJobListQuery,
  getPublicJobs,
  getPublicJobCandidate,
  getPublicJobDetails,
  getPublicJobById,
  getPublicJobBySlug
};