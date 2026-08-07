const PUBLIC_JOB_SORTS =
  Object.freeze({
    LATEST:
      "latest",

    OLDEST:
      "oldest",

    RELEVANCE:
      "relevance",

    DEADLINE_SOON:
      "deadlineSoon",

    SALARY_ASCENDING:
      "salaryAscending",

    SALARY_DESCENDING:
      "salaryDescending",

    TITLE_ASCENDING:
      "titleAscending",

    TITLE_DESCENDING:
      "titleDescending"
  });

const PUBLIC_JOB_SORT_VALUES =
  Object.freeze(
    Object.values(
      PUBLIC_JOB_SORTS
    )
  );

const PUBLIC_JOB_DEFAULT_SORT =
  PUBLIC_JOB_SORTS.LATEST;

export {
  PUBLIC_JOB_SORTS,
  PUBLIC_JOB_SORT_VALUES,
  PUBLIC_JOB_DEFAULT_SORT
};