export function normalizeRecruiterJobList(response) {
  const data = response?.data?.data ?? response?.data ?? []
  const meta = response?.data?.meta ?? {}

  return {
    jobs: Array.isArray(data) ? data : [],
    pagination: {
      page: Number(meta.page ?? meta.currentPage ?? 1),
      limit: Number(meta.limit ?? 10),
      totalRecords: Number(meta.totalRecords ?? meta.total ?? 0),
      totalPages: Number(meta.totalPages ?? 1),
      hasNextPage: Boolean(meta.hasNextPage),
      hasPreviousPage: Boolean(meta.hasPreviousPage),
    },
  }
}

export function normalizeRecruiterJob(response) {
  return response?.data?.data ?? response?.data ?? null
}
