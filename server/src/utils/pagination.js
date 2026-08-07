const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const getPagination = (
  query = {}
) => {
  const page =
    Math.max(
      Number.parseInt(
        query.page,
        10
      ) ||
        DEFAULT_PAGE,
      1
    );

  const limit =
    Math.min(
      Math.max(
        Number.parseInt(
          query.limit,
          10
        ) ||
          DEFAULT_LIMIT,
        1
      ),
      MAX_LIMIT
    );

  const offset =
    (page - 1) *
    limit;

  return {
    page,
    limit,
    offset
  };
};

const getPaginationMeta = (
  page,
  limit,
  totalRecords
) => {
  const offset =
    (page - 1) *
    limit;

  const totalPages =
    Math.ceil(
      totalRecords /
      limit
    ) || 1;

  return {
    page,
    limit,
    offset,
    totalRecords,
    totalPages,

    hasPreviousPage:
      page > 1,

    hasNextPage:
      page <
      totalPages
  };
};

export {
  getPagination,
  getPaginationMeta
};