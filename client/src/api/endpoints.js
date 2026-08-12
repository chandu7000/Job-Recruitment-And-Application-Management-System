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

  REPORTS: Object.freeze({
    SUBMIT: '/reports',
  }),

  ADMIN: Object.freeze({
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USER_BY_ID: (userId) => `/admin/users/${encodeURIComponent(userId)}`,
    ACTIVATE_USER: (userId) => `/admin/users/${encodeURIComponent(userId)}/activate`,
    DISABLE_USER: (userId) => `/admin/users/${encodeURIComponent(userId)}/disable`,
    SUSPEND_USER: (userId) => `/admin/users/${encodeURIComponent(userId)}/suspend`,
    PENDING_COMPANIES: '/admin/companies/pending',
    VERIFY_COMPANY: (companyId) => `/admin/companies/${encodeURIComponent(companyId)}/verify`,
    REJECT_COMPANY: (companyId) => `/admin/companies/${encodeURIComponent(companyId)}/reject`,
    JOBS: '/admin/jobs',
    JOB_BY_ID: (jobId) => `/admin/jobs/${encodeURIComponent(jobId)}`,
    MODERATE_JOB: (jobId) => `/admin/jobs/${encodeURIComponent(jobId)}/moderate`,
    REPORTS: '/admin/reports',
    REPORT_BY_ID: (reportId) => `/admin/reports/${encodeURIComponent(reportId)}`,
    PROCESS_REPORT: (reportId) => `/admin/reports/${encodeURIComponent(reportId)}/process`,
    AUDIT_LOGS: '/admin/audit-logs',
    AUDIT_LOG_BY_ID: (auditId) => `/admin/audit-logs/${encodeURIComponent(auditId)}`,
  }),

  NOTIFICATIONS: Object.freeze({
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_ALL_READ: '/notifications/read-all',
    MARK_READ: (notificationId) =>
      `/notifications/${encodeURIComponent(notificationId)}/read`,
    DELETE: (notificationId) =>
      `/notifications/${encodeURIComponent(notificationId)}`,
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
    SAVED_JOBS: '/job-seeker/saved-jobs',
    SAVED_JOB: (jobId) =>
      `/job-seeker/saved-jobs/${encodeURIComponent(jobId)}`,
    APPLICATIONS: '/job-seeker/applications',
    APPLICATION_BY_ID: (applicationId) =>
      `/job-seeker/applications/${encodeURIComponent(applicationId)}`,
    WITHDRAW_APPLICATION: (applicationId) =>
      `/job-seeker/applications/${encodeURIComponent(applicationId)}/withdraw`,
    INTERVIEWS: '/job-seeker/interviews',
    INTERVIEW_BY_ID: (interviewId) => `/job-seeker/interviews/${encodeURIComponent(interviewId)}`,
    INTERVIEW_HISTORY: (interviewId) => `/job-seeker/interviews/${encodeURIComponent(interviewId)}/history`,
    CONFIRM_INTERVIEW: (interviewId) => `/job-seeker/interviews/${encodeURIComponent(interviewId)}/confirm`,
    DECLINE_INTERVIEW: (interviewId) => `/job-seeker/interviews/${encodeURIComponent(interviewId)}/decline`,
    APPLY_TO_JOB: (jobId) =>
      `/job-seeker/applications/jobs/${encodeURIComponent(jobId)}`,
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

    APPLICATIONS: '/recruiter/applications',
    APPLICATION_BY_ID: (applicationId) =>
      `/recruiter/applications/${encodeURIComponent(applicationId)}`,
    APPLICATION_NOTES: (applicationId) =>
      `/recruiter/applications/${encodeURIComponent(applicationId)}/notes`,
    APPLICATION_STATUS: (applicationId) =>
      `/recruiter/applications/${encodeURIComponent(applicationId)}/status`,
    INTERVIEWS: '/recruiter/interviews',
    SCHEDULE_INTERVIEW: (applicationId) => `/recruiter/interviews/applications/${encodeURIComponent(applicationId)}`,
    INTERVIEW_BY_ID: (interviewId) => `/recruiter/interviews/${encodeURIComponent(interviewId)}`,
    INTERVIEW_HISTORY: (interviewId) => `/recruiter/interviews/${encodeURIComponent(interviewId)}/history`,
    RESCHEDULE_INTERVIEW: (interviewId) => `/recruiter/interviews/${encodeURIComponent(interviewId)}/reschedule`,
    CANCEL_INTERVIEW: (interviewId) => `/recruiter/interviews/${encodeURIComponent(interviewId)}/cancel`,
    COMPLETE_INTERVIEW: (interviewId) => `/recruiter/interviews/${encodeURIComponent(interviewId)}/complete`,
    INTERVIEW_FEEDBACK: (interviewId) => `/recruiter/interviews/${encodeURIComponent(interviewId)}/feedback`,
  }),
})