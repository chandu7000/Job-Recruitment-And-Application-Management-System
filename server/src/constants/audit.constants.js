export const AUDIT_ACTIONS = Object.freeze({ USER_ENABLED:"USER_ENABLED", USER_DISABLED:"USER_DISABLED", USER_SUSPENDED:"USER_SUSPENDED", USER_RESTORED:"USER_RESTORED", COMPANY_VERIFIED:"COMPANY_VERIFIED", COMPANY_REJECTED:"COMPANY_REJECTED", COMPANY_SUSPENDED:"COMPANY_SUSPENDED", COMPANY_RESTORED:"COMPANY_RESTORED", JOB_REMOVED:"JOB_REMOVED", JOB_RESTORED:"JOB_RESTORED", REPORT_SUBMITTED:"REPORT_SUBMITTED", REPORT_UNDER_REVIEW:"REPORT_UNDER_REVIEW", REPORT_RESOLVED:"REPORT_RESOLVED", REPORT_DISMISSED:"REPORT_DISMISSED", AUTH_SECURITY_EVENT:"AUTH_SECURITY_EVENT", APPLICATION_ACTION:"APPLICATION_ACTION", INTERVIEW_ACTION:"INTERVIEW_ACTION" });
export const AUDIT_RESOURCE_TYPES = Object.freeze({ USER:"USER", COMPANY:"COMPANY", JOB:"JOB", REPORT:"REPORT", AUTH:"AUTH", APPLICATION:"APPLICATION", INTERVIEW:"INTERVIEW" });
export const AUDIT_RESULTS = Object.freeze({ SUCCESS:"SUCCESS", FAILURE:"FAILURE" });
const SENSITIVE_KEYS = new Set(["password","passwordHash","accessToken","refreshToken","resetToken","verificationToken","authorization","cookie","cookies","smtpPassword","privateNotes"]);
export const sanitizeAuditMetadata = (value) => {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(sanitizeAuditMetadata);
  if (typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !SENSITIVE_KEYS.has(key)).map(([key, item]) => [key, sanitizeAuditMetadata(item)]));
};
