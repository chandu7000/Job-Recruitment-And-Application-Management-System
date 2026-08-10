export const API_ENDPOINTS = Object.freeze({
  HEALTH: '/health',

  AUTH: Object.freeze({
    REGISTER_JOB_SEEKER: '/auth/register/job-seeker',
    REGISTER_RECRUITER: '/auth/register/recruiter',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    ME: '/auth/me',
    SESSIONS: '/auth/sessions',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    REQUEST_EMAIL_CHANGE: '/auth/request-email-change',
    VERIFY_EMAIL_CHANGE: '/auth/verify-email-change',
    RESEND_VERIFICATION: '/auth/resend-verification',
    VERIFY_EMAIL: '/auth/verify-email',
  }),

  PUBLIC: Object.freeze({
    JOBS: '/public/jobs',
    JOB_BY_ID: (jobId) =>
      `/public/jobs/${encodeURIComponent(jobId)}`,
    JOB_BY_SLUG: (slug) =>
      `/public/jobs/slug/${encodeURIComponent(slug)}`,
    SIMILAR_JOBS: (jobId) =>
      `/public/jobs/${encodeURIComponent(jobId)}/similar`,
    COMPANY_BY_ID: (companyId) =>
      `/public/companies/${encodeURIComponent(companyId)}`,
    COMPANY_BY_SLUG: (slug) =>
      `/public/companies/slug/${encodeURIComponent(slug)}`,
    COMPANY_JOBS_BY_ID: (companyId) =>
      `/public/companies/${encodeURIComponent(companyId)}/jobs`,
    COMPANY_JOBS_BY_SLUG: (slug) =>
      `/public/companies/slug/${encodeURIComponent(slug)}/jobs`,
  }),

  JOB_SEEKER: Object.freeze({
    DASHBOARD: '/dashboard/job-seeker',
    PROFILE: '/job-seeker/profile',
    COMPLETION: '/job-seeker/profile/completion',
    HEADLINE_BIOGRAPHY: '/job-seeker/profile/headline-biography',
    SKILLS: '/job-seeker/skills',
    EDUCATIONS: '/job-seeker/educations',
    EXPERIENCES: '/job-seeker/experiences',
    PROJECTS: '/job-seeker/projects',
    CERTIFICATIONS: '/job-seeker/certifications',
    SOCIAL_LINKS: '/job-seeker/social-links',
    JOB_PREFERENCES: '/job-seeker/job-preferences',
    PROFILE_IMAGE: '/job-seeker/uploads/profile-image',
    RESUME: '/job-seeker/uploads/resume',
  }),

  RECRUITER: Object.freeze({
    DASHBOARD: '/dashboard/recruiter',
    PROFILE: '/recruiter/profile',

    COMPANIES: '/companies',
    MY_COMPANIES: '/companies/me',
    COMPANY_LOGO: '/companies/me/logo',

    SUBMIT_COMPANY_VERIFICATION:
      '/companies/me/submit-verification',

    RESUBMIT_COMPANY_VERIFICATION:
      '/companies/me/resubmit-verification',

    COMPANY_VERIFICATION_HISTORY:
      '/companies/me/verification-history',

    JOBS: '/jobs',

    MY_JOBS: '/jobs/me',

    JOB_BY_ID: (jobId) =>
      `/jobs/${encodeURIComponent(jobId)}`,

    PUBLISH_JOB: (jobId) =>
      `/jobs/${encodeURIComponent(jobId)}/publish`,

    CLOSE_JOB: (jobId) =>
      `/jobs/${encodeURIComponent(jobId)}/close`,
  }),
})