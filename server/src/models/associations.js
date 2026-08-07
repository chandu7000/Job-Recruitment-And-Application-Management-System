import SavedJob from "./savedJob.model.js";
import Application from "./application.model.js";
import ApplicationStatusHistory from "./applicationStatusHistory.model.js";
import ApplicationAuditEvent from "./applicationAuditEvent.model.js";
import Interview from "./interview.model.js";
import InterviewHistory from "./interviewHistory.model.js";
import User from "./user.model.js";
import UserSession from "./userSession.model.js";
import Company from "./company.model.js";
import Job from "./job.model.js";
import CompanyVerificationHistory from "./companyVerificationHistory.model.js";
import Notification from "./notification.model.js";

import RecruiterProfile from "./recruiterProfile.model.js";

import JobSeekerProfile from "./jobSeekerProfile.model.js";
import JobSeekerSkill from "./jobSeekerSkill.model.js";
import JobSeekerEducation from "./jobSeekerEducation.model.js";
import JobSeekerExperience from "./jobSeekerExperience.model.js";
import JobSeekerProject from "./jobSeekerProject.model.js";
import JobSeekerCertification from "./jobSeekerCertification.model.js";
import JobSeekerSocialLink from "./jobSeekerSocialLink.model.js";
import JobSeekerJobPreference from "./jobSeekerJobPreference.model.js";


// User -> Company
User.hasMany(Company, {
  foreignKey: "ownerId",
  as: "companies",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});

Company.belongsTo(User, {
  foreignKey: "ownerId",
  as: "owner",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});


// Company -> Job
Company.hasMany(Job, {
  foreignKey: "companyId",
  as: "jobs",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE"
});

Job.belongsTo(Company, {
  foreignKey: "companyId",
  as: "company",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE"
});


// User/Recruiter -> Created Jobs
User.hasMany(Job, {
  foreignKey: "createdBy",
  as: "createdJobs",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE"
});

Job.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE"
});


// Company -> Verification History
Company.hasMany(
  CompanyVerificationHistory,
  {
    foreignKey: "companyId",
    as: "verificationHistory",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);

CompanyVerificationHistory.belongsTo(
  Company,
  {
    foreignKey: "companyId",
    as: "company",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);


// User -> Performed Company Verification Actions
User.hasMany(
  CompanyVerificationHistory,
  {
    foreignKey: "performedBy",
    as: "companyVerificationActions",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  }
);

CompanyVerificationHistory.belongsTo(
  User,
  {
    foreignKey: "performedBy",
    as: "performedByUser",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  }
);


// User -> User Sessions
User.hasMany(UserSession, {
  foreignKey: "userId",
  as: "sessions",
  onDelete: "CASCADE"
});

UserSession.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});


// User -> Recruiter Profile
User.hasOne(RecruiterProfile, {
  foreignKey: "userId",
  as: "recruiterProfile",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});

RecruiterProfile.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});


// User -> Job Seeker Profile
User.hasOne(JobSeekerProfile, {
  foreignKey: "userId",
  as: "jobSeekerProfile",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});

JobSeekerProfile.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});


// Job Seeker Profile -> Skills
JobSeekerProfile.hasMany(
  JobSeekerSkill,
  {
    foreignKey: "jobSeekerProfileId",
    as: "skills",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);

JobSeekerSkill.belongsTo(
  JobSeekerProfile,
  {
    foreignKey: "jobSeekerProfileId",
    as: "jobSeekerProfile",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);


// Job Seeker Profile -> Educations
JobSeekerProfile.hasMany(
  JobSeekerEducation,
  {
    foreignKey: "jobSeekerProfileId",
    as: "educations",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);

JobSeekerEducation.belongsTo(
  JobSeekerProfile,
  {
    foreignKey: "jobSeekerProfileId",
    as: "jobSeekerProfile",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);


// Job Seeker Profile -> Experiences
JobSeekerProfile.hasMany(
  JobSeekerExperience,
  {
    foreignKey: "jobSeekerProfileId",
    as: "experiences",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);

JobSeekerExperience.belongsTo(
  JobSeekerProfile,
  {
    foreignKey: "jobSeekerProfileId",
    as: "jobSeekerProfile",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);


// Job Seeker Profile -> Projects
JobSeekerProfile.hasMany(
  JobSeekerProject,
  {
    foreignKey: "jobSeekerProfileId",
    as: "projects",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);

JobSeekerProject.belongsTo(
  JobSeekerProfile,
  {
    foreignKey: "jobSeekerProfileId",
    as: "jobSeekerProfile",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);


// Job Seeker Profile -> Certifications
JobSeekerProfile.hasMany(
  JobSeekerCertification,
  {
    foreignKey: "jobSeekerProfileId",
    as: "certifications",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);

JobSeekerCertification.belongsTo(
  JobSeekerProfile,
  {
    foreignKey: "jobSeekerProfileId",
    as: "jobSeekerProfile",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);


// Job Seeker Profile -> Social Links
JobSeekerProfile.hasMany(
  JobSeekerSocialLink,
  {
    foreignKey: "jobSeekerProfileId",
    as: "socialLinks",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);

JobSeekerSocialLink.belongsTo(
  JobSeekerProfile,
  {
    foreignKey: "jobSeekerProfileId",
    as: "jobSeekerProfile",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);


// Job Seeker Profile -> Job Preference
JobSeekerProfile.hasOne(
  JobSeekerJobPreference,
  {
    foreignKey: "jobSeekerProfileId",
    as: "jobPreference",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);

JobSeekerJobPreference.belongsTo(
  JobSeekerProfile,
  {
    foreignKey: "jobSeekerProfileId",
    as: "jobSeekerProfile",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
);
// Phase 8 associations
User.hasMany(SavedJob,{foreignKey:"candidateId",as:"savedJobs",onDelete:"CASCADE"});
SavedJob.belongsTo(User,{foreignKey:"candidateId",as:"candidate"});
Job.hasMany(SavedJob,{foreignKey:"jobId",as:"savedByCandidates",onDelete:"CASCADE"});
SavedJob.belongsTo(Job,{foreignKey:"jobId",as:"job"});
User.hasMany(Application,{foreignKey:"candidateId",as:"applications"});
Application.belongsTo(User,{foreignKey:"candidateId",as:"candidate"});
Job.hasMany(Application,{foreignKey:"jobId",as:"applications"});
Application.belongsTo(Job,{foreignKey:"jobId",as:"job"});
Company.hasMany(Application,{foreignKey:"companyId",as:"applications"});
Application.belongsTo(Company,{foreignKey:"companyId",as:"company"});
Application.hasMany(ApplicationStatusHistory,{foreignKey:"applicationId",as:"statusHistory",onDelete:"CASCADE"});
ApplicationStatusHistory.belongsTo(Application,{foreignKey:"applicationId",as:"application"});
ApplicationStatusHistory.belongsTo(User,{foreignKey:"changedBy",as:"changedByUser"});
Application.hasMany(ApplicationAuditEvent,{foreignKey:"applicationId",as:"auditEvents"});


Application.hasMany(Interview,{foreignKey:"applicationId",as:"interviews",onDelete:"RESTRICT",onUpdate:"CASCADE"});
Interview.belongsTo(Application,{foreignKey:"applicationId",as:"application"});
Job.hasMany(Interview,{foreignKey:"jobId",as:"interviews"}); Interview.belongsTo(Job,{foreignKey:"jobId",as:"job"});
Company.hasMany(Interview,{foreignKey:"companyId",as:"interviews"}); Interview.belongsTo(Company,{foreignKey:"companyId",as:"company"});
User.hasMany(Interview,{foreignKey:"candidateId",as:"candidateInterviews"}); Interview.belongsTo(User,{foreignKey:"candidateId",as:"candidate"});
User.hasMany(Interview,{foreignKey:"recruiterId",as:"recruiterInterviews"}); Interview.belongsTo(User,{foreignKey:"recruiterId",as:"recruiter"});
Interview.hasMany(InterviewHistory,{foreignKey:"interviewId",as:"history",onDelete:"CASCADE"}); InterviewHistory.belongsTo(Interview,{foreignKey:"interviewId",as:"interview"});


// User -> Notifications
User.hasMany(Notification, { foreignKey: "recipientId", as: "notifications", onDelete: "CASCADE", onUpdate: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "recipientId", as: "recipient", onDelete: "CASCADE", onUpdate: "CASCADE" });

// Phase 11 reports and audit logs
import Report from "./report.model.js";
import AuditLog from "./auditLog.model.js";
User.hasMany(Report,{foreignKey:"reporterId",as:"submittedReports"});
Report.belongsTo(User,{foreignKey:"reporterId",as:"reporter"});
User.hasMany(Report,{foreignKey:"reviewedBy",as:"reviewedReports"});
Report.belongsTo(User,{foreignKey:"reviewedBy",as:"reviewer"});
User.hasMany(AuditLog,{foreignKey:"actorUserId",as:"auditLogs"});
AuditLog.belongsTo(User,{foreignKey:"actorUserId",as:"actor"});
