import axiosClient from '../../../api/axiosClient'
import { API_ENDPOINTS } from '../../../api/endpoints'
import {
  mapPublicCompanyResponse,
  mapPublicJobListResponse,
} from '../utils/publicResponseMappers'
import { serializePublicJobQuery } from '../utils/publicQuery'

const { PUBLIC } = API_ENDPOINTS

export const publicCompanyApi = Object.freeze({
  getById: (companyId, { signal } = {}) =>
    axiosClient
      .get(PUBLIC.COMPANY_BY_ID(companyId), { signal })
      .then(mapPublicCompanyResponse),
  getBySlug: (slug, { signal } = {}) =>
    axiosClient
      .get(PUBLIC.COMPANY_BY_SLUG(slug), { signal })
      .then(mapPublicCompanyResponse),
  listJobsById: (companyId, query = {}, { signal } = {}) =>
    axiosClient
      .get(PUBLIC.COMPANY_JOBS_BY_ID(companyId), {
        params: serializePublicJobQuery(query),
        signal,
      })
      .then(mapPublicJobListResponse),
  listJobsBySlug: (slug, query = {}, { signal } = {}) =>
    axiosClient
      .get(PUBLIC.COMPANY_JOBS_BY_SLUG(slug), {
        params: serializePublicJobQuery(query),
        signal,
      })
      .then(mapPublicJobListResponse),
})
