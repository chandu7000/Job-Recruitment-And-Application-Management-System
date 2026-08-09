const responseEnvelope = (response) => response?.data ?? {}

export const mapPublicJobListResponse = (response) => {
  const envelope = responseEnvelope(response)

  return {
    jobs: Array.isArray(envelope.data) ? envelope.data : [],
    pagination: envelope.meta ?? {},
  }
}

export const mapPublicJobResponse = (response) =>
  responseEnvelope(response).data ?? null

export const mapPublicCompanyResponse = (response) =>
  responseEnvelope(response).data ?? null

export const mapSimilarJobsResponse = (response) => {
  const envelope = responseEnvelope(response)

  return {
    jobs: Array.isArray(envelope.data) ? envelope.data : [],
    meta: envelope.meta ?? {},
  }
}
