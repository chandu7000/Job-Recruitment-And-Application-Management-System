import axiosClient from '../../../api/axiosClient'
import { API_ENDPOINTS } from '../../../api/endpoints'
import {
  mapPublicJobListResponse,
  mapPublicJobResponse,
  mapSimilarJobsResponse,
} from '../utils/publicResponseMappers'
import {
  serializePublicJobQuery,
  serializeSimilarJobsQuery,
} from '../utils/publicQuery'

const { PUBLIC } = API_ENDPOINTS

export const publicJobApi = Object.freeze({
  list: (query = {}, { signal } = {}) =>
    axiosClient
      .get(PUBLIC.JOBS, { params: serializePublicJobQuery(query), signal })
      .then(mapPublicJobListResponse),
  getById: (jobId, { signal } = {}) =>
    axiosClient.get(PUBLIC.JOB_BY_ID(jobId), { signal }).then(mapPublicJobResponse),
  getBySlug: (slug, { signal } = {}) =>
    axiosClient.get(PUBLIC.JOB_BY_SLUG(slug), { signal }).then(mapPublicJobResponse),
  getSimilar: (jobId, limit, { signal } = {}) =>
    axiosClient
      .get(PUBLIC.SIMILAR_JOBS(jobId), {
        params: serializeSimilarJobsQuery(limit),
        signal,
      })
      .then(mapSimilarJobsResponse),
})
