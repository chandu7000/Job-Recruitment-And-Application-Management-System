const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

const layout = ({ heading, body, actionUrl, actionLabel, secondaryActionUrl, secondaryActionLabel }) => {
  const action = actionUrl ? `<p><a href="${escapeHtml(actionUrl)}">${escapeHtml(actionLabel || "View details")}</a></p>` : "";
  const secondaryAction = secondaryActionUrl ? `<p><a href="${escapeHtml(secondaryActionUrl)}">${escapeHtml(secondaryActionLabel || "Secondary action")}</a></p>` : "";
  return `<!doctype html><html><body><h1>${escapeHtml(heading)}</h1>${body}${action}${secondaryAction}<p>CareerForge</p></body></html>`;
};

const build = ({ subject, heading, lines = [], actionUrl, actionLabel, secondaryActionUrl, secondaryActionLabel }) => ({
  subject,
  text: [...lines, actionUrl || "", secondaryActionUrl || ""].filter(Boolean).join("\n"),
  html: layout({ heading, body: lines.map((line) => `<p>${escapeHtml(line)}</p>`).join(""), actionUrl, actionLabel, secondaryActionUrl, secondaryActionLabel })
});

export const emailTemplates = {
  EMAIL_VERIFICATION: (d) => build({
    subject: "Verify your CareerForge email",
    heading: "Verify your email",
    lines: [
      "Complete your email verification to activate your account.",
      "Only verify this address if you created the CareerForge account.",
      "If you did not create this account, use the This wasn't me link below to cancel the pending registration."
    ],
    actionUrl: d.actionUrl,
    actionLabel: "Verify email",
    secondaryActionUrl: d.secondaryActionUrl,
    secondaryActionLabel: "This wasn't me"
  }),
  PASSWORD_RESET: (d) => build({ subject: "Reset your CareerForge password", heading: "Reset your password", lines: ["Use the secure link below to reset your password."], actionUrl: d.actionUrl, actionLabel: "Reset password" }),
  COMPANY_APPROVED: (d) => build({ subject: "Company verification approved", heading: "Company approved", lines: [`${d.companyName || "Your company"} has been approved.`], actionUrl: d.actionUrl }),
  COMPANY_REJECTED: (d) => build({ subject: "Company verification update", heading: "Company verification rejected", lines: [`${d.companyName || "Your company"} was not approved.`, d.reason || "Review the company details and try again."], actionUrl: d.actionUrl }),
  JOB_APPLICATION_SUBMITTED: (d) => build({ subject: `New application for ${d.jobTitle || "your job"}`, heading: "New job application", lines: [`${d.candidateName || "A candidate"} applied for ${d.jobTitle || "your job"}.`], actionUrl: d.actionUrl }),
  APPLICATION_STATUS_CHANGED: (d) => build({ subject: "Application status updated", heading: "Application update", lines: [`Your application for ${d.jobTitle || "the job"} is now ${d.status || "updated"}.`], actionUrl: d.actionUrl }),
  CANDIDATE_SHORTLISTED: (d) => build({ subject: "You have been shortlisted", heading: "Application shortlisted", lines: [`You were shortlisted for ${d.jobTitle || "a job"}.`], actionUrl: d.actionUrl }),
  INTERVIEW_SCHEDULED: (d) => build({ subject: "Interview scheduled", heading: "Interview scheduled", lines: [`Job: ${d.jobTitle || "Not specified"}`, `Time: ${d.interviewTime || "Not specified"}`, `Timezone: ${d.timezone || "Not specified"}`, `Meeting type: ${d.meetingType || "Not specified"}`, d.meetingLink || d.physicalLocation || d.phoneInstructions || ""], actionUrl: d.actionUrl }),
  INTERVIEW_RESCHEDULED: (d) => build({ subject: "Interview rescheduled", heading: "Interview rescheduled", lines: [`New time: ${d.interviewTime || "Not specified"}`, `Timezone: ${d.timezone || "Not specified"}`], actionUrl: d.actionUrl }),
  INTERVIEW_CANCELLED: (d) => build({ subject: "Interview cancelled", heading: "Interview cancelled", lines: [`The interview for ${d.jobTitle || "the job"} was cancelled.`], actionUrl: d.actionUrl }),
  INTERVIEW_CONFIRMED: (d) => build({ subject: "Interview attendance confirmed", heading: "Interview confirmed", lines: [`${d.candidateName || "The candidate"} confirmed attendance.`], actionUrl: d.actionUrl }),
  INTERVIEW_DECLINED: (d) => build({ subject: "Interview attendance declined", heading: "Interview declined", lines: [`${d.candidateName || "The candidate"} declined attendance.`], actionUrl: d.actionUrl }),
  CANDIDATE_SELECTED: (d) => build({ subject: "Congratulations — candidate selected", heading: "Candidate selected", lines: [`You were selected for ${d.jobTitle || "the job"}.`], actionUrl: d.actionUrl }),
  CANDIDATE_REJECTED: (d) => build({ subject: "Application update", heading: "Application decision", lines: [`Your application for ${d.jobTitle || "the job"} was not selected.`], actionUrl: d.actionUrl }),
  JOB_CLOSED: (d) => build({ subject: "Job closed", heading: "Job closed", lines: [`${d.jobTitle || "The job"} has been closed.`], actionUrl: d.actionUrl })
};

export const renderEmailTemplate = (templateName, data = {}) => {
  const template = emailTemplates[templateName];
  if (!template) throw new Error(`Unknown email template: ${templateName}`);
  return template(data);
};
