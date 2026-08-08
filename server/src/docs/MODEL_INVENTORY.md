# CareerForge Backend Model Inventory

This document contains the frozen Sequelize model inventory for the CareerForge backend.

Model definitions and database migrations are the source of truth for the persisted data structure.

Total model files: **24**.

| Model | Table | Source |
|---|---|---|
| `Application` | `applications` | `src/models/application.model.js` |
| `ApplicationAuditEvent` | `application_audit_events` | `src/models/applicationAuditEvent.model.js` |
| `ApplicationStatusHistory` | `application_status_history` | `src/models/applicationStatusHistory.model.js` |
| `AuditLog` | `audit_logs` | `src/models/auditLog.model.js` |
| `company.model` | `companies` | `src/models/company.model.js` |
| `companyVerificationHistory.model` | `company_verification_history` | `src/models/companyVerificationHistory.model.js` |
| `Interview` | `interviews` | `src/models/interview.model.js` |
| `InterviewHistory` | `interview_history` | `src/models/interviewHistory.model.js` |
| `Job` | `jobs` | `src/models/job.model.js` |
| `JobSeekerCertification` | `job_seeker_certifications` | `src/models/jobSeekerCertification.model.js` |
| `JobSeekerEducation` | `job_seeker_educations` | `src/models/jobSeekerEducation.model.js` |
| `JobSeekerExperience` | `job_seeker_experiences` | `src/models/jobSeekerExperience.model.js` |
| `JobSeekerJobPreference` | `job_seeker_job_preferences` | `src/models/jobSeekerJobPreference.model.js` |
| `JobSeekerProfile` | `job_seeker_profiles` | `src/models/jobSeekerProfile.model.js` |
| `JobSeekerProject` | `job_seeker_projects` | `src/models/jobSeekerProject.model.js` |
| `JobSeekerSkill` | `job_seeker_skills` | `src/models/jobSeekerSkill.model.js` |
| `JobSeekerSocialLink` | `job_seeker_social_links` | `src/models/jobSeekerSocialLink.model.js` |
| `Notification` | `notifications` | `src/models/notification.model.js` |
| `recruiterProfile.model` | `recruiter_profiles` | `src/models/recruiterProfile.model.js` |
| `RefreshToken` | `refresh_tokens` | `src/models/refreshToken.model.js` |
| `Report` | `reports` | `src/models/report.model.js` |
| `SavedJob` | `saved_jobs` | `src/models/savedJob.model.js` |
| `User` | `users` | `src/models/user.model.js` |
| `UserSession` | `user_sessions` | `src/models/userSession.model.js` |
