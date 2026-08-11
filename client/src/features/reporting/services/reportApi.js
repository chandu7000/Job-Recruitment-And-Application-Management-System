import axiosClient from '../../../api/axiosClient'
import { API_ENDPOINTS } from '../../../api/endpoints'

export const reportApi = {
  submit: (payload) =>
    axiosClient
      .post(API_ENDPOINTS.REPORTS.SUBMIT, payload)
      .then((response) => response.data?.data ?? response.data),
}
