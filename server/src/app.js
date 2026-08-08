import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import env from "./config/env.js";

import "./models/associations.js";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import companyRoutes from "./routes/company.routes.js";
import jobRoutes from "./routes/job.routes.js";
import jobSeekerProfileRoutes from "./routes/jobSeekerProfile.routes.js";
import jobSeekerSkillRoutes from "./routes/jobSeekerSkill.routes.js";
import jobSeekerEducationRoutes from "./routes/jobSeekerEducation.routes.js";
import jobSeekerExperienceRoutes from "./routes/jobSeekerExperience.routes.js";
import jobSeekerProjectRoutes from "./routes/jobSeekerProject.routes.js";
import jobSeekerCertificationRoutes from "./routes/jobSeekerCertification.routes.js";
import jobSeekerSocialLinkRoutes from "./routes/jobSeekerSocialLink.routes.js";
import jobSeekerJobPreferenceRoutes from "./routes/jobSeekerJobPreference.routes.js";
import jobSeekerUploadRoutes from "./routes/jobSeekerUpload.routes.js";

import recruiterProfileRoutes from "./routes/recruiterProfile.routes.js";
import recruiterCandidateRoutes from "./routes/recruiterCandidate.routes.js";

import adminCandidateRoutes from "./routes/adminCandidate.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminManagementRoutes from "./routes/adminManagement.routes.js";

import publicJobRoutes from "./routes/publicJob.routes.js";
import publicCompanyRoutes from "./routes/publicCompany.routes.js";
import savedJobRoutes from "./routes/savedJob.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import recruiterApplicationRoutes from "./routes/recruiterApplication.routes.js";
import recruiterInterviewRoutes from "./routes/recruiterInterview.routes.js";
import candidateInterviewRoutes from "./routes/candidateInterview.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reportRoutes from "./routes/report.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import requestIdMiddleware from "./middlewares/requestId.middleware.js";
import securityHeaders from "./middlewares/securityHeaders.middleware.js";
import requestSecurityMiddleware from "./middlewares/requestSecurity.middleware.js";

const app = express();

app.set("trust proxy", 1);

app.disable("x-powered-by");

app.use(requestIdMiddleware);
app.use(securityHeaders);

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        env.cors.clientOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      const corsError = new Error(
        "Request origin is not allowed by CORS"
      );

      corsError.statusCode = 403;
      corsError.code =
        "CORS_ORIGIN_NOT_ALLOWED";

      return callback(corsError);
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);

app.use(
  express.json({
    limit: "1mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb"
  })
);

app.use(cookieParser());
app.use(requestSecurityMiddleware);

if (!env.isTest) {
  app.use(
    morgan(
      env.isProduction
        ? "combined"
        : "dev"
    )
  );
}

const globalRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  limit: env.rateLimit.maxRequests,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler(req, res) {
    return res.status(429).json({
      success: false,
      message:
        "Too many requests. Please try again later.",
      code: "RATE_LIMIT_EXCEEDED",
      errors: [],
      requestId: req.requestId,
      timestamp:
        new Date().toISOString()
    });
  }
});

app.use("/api", globalRateLimiter);

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminManagementRoutes);
app.use("/api/admin/candidates", adminCandidateRoutes);

app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/public", publicJobRoutes);
app.use("/api/public", publicCompanyRoutes);

app.use("/api/job-seeker", jobSeekerProfileRoutes);
app.use("/api/job-seeker/saved-jobs", savedJobRoutes);
app.use("/api/job-seeker/applications", applicationRoutes);
app.use("/api/job-seeker/interviews", candidateInterviewRoutes);
app.use("/api/job-seeker/skills", jobSeekerSkillRoutes);
app.use("/api/job-seeker/educations", jobSeekerEducationRoutes);
app.use("/api/job-seeker/experiences", jobSeekerExperienceRoutes);
app.use("/api/job-seeker/projects", jobSeekerProjectRoutes);
app.use("/api/job-seeker/certifications", jobSeekerCertificationRoutes);
app.use("/api/job-seeker/social-links", jobSeekerSocialLinkRoutes);
app.use("/api/job-seeker/job-preferences", jobSeekerJobPreferenceRoutes);
app.use("/api/job-seeker/uploads", jobSeekerUploadRoutes);

app.use("/api/recruiter", recruiterProfileRoutes);
app.use("/api/recruiter/applications", recruiterApplicationRoutes);
app.use("/api/recruiter/interviews", recruiterInterviewRoutes);
app.use("/api/recruiter/candidates", recruiterCandidateRoutes);

app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;