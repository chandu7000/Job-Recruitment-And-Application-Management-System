import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";
import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";
import Company from "../../models/company.model.js";
import Job from "../../models/job.model.js";
import Application from "../../models/application.model.js";
import ApplicationStatusHistory from "../../models/applicationStatusHistory.model.js";
import Interview from "../../models/interview.model.js";
import InterviewHistory from "../../models/interviewHistory.model.js";
import { hashPassword } from "../../utils/password.util.js";

const PASSWORD = "Strong@Password123";
const EMAIL_PREFIX = "p9status.";
const SLUG_PREFIX = "phase9-status-";

const uniqueValue = label =>
  `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const createEmail = label =>
  `${EMAIL_PREFIX}${uniqueValue(label)}@example.com`;

const createUser = async ({ email, role }) =>
  User.create({
    email,
    passwordHash: await hashPassword(PASSWORD),
    role,
    status: "ACTIVE",
    emailVerifiedAt: new Date()
  });

const login = async email => {
  const response = await request(app)
    .post("/api/auth/login")
    .set("User-Agent", "CareerForge Phase 9 Status Integration Test")
    .send({ email, password: PASSWORD })
    .expect(200);

  return response.body.data.accessToken;
};

const createCompany = recruiterId =>
  Company.create({
    ownerId: recruiterId,
    companyName: "Phase 9 Status Company",
    slug: `${SLUG_PREFIX}${uniqueValue("company")}`,
    status: "VERIFIED"
  });

const createJob = ({ recruiterId, companyId }) =>
  Job.create({
    companyId,
    createdBy: recruiterId,
    title: "Phase 9 Status Backend Developer",
    slug: `${SLUG_PREFIX}${uniqueValue("job")}`,
    description: "Interview status integration test job.",
    responsibilities: "Develop and maintain backend APIs.",
    requirements: "Node.js, Express and SQL knowledge.",
    skills: ["Node.js", "Express", "SQL"],
    location: "Bengaluru",
    workMode: "HYBRID",
    employmentType: "FULL_TIME",
    experienceLevel: "JUNIOR",
    minimumExperience: 0,
    maximumExperience: 2,
    minimumSalary: 500000,
    maximumSalary: 900000,
    salaryCurrency: "INR",
    vacancies: 2,
    applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "PUBLISHED",
    publishedAt: new Date()
  });

const createApplication = ({ candidateId, job, company }) =>
  Application.create({
    candidateId,
    jobId: job.id,
    companyId: company.id,
    status: "INTERVIEW_SCHEDULED",
    coverLetter: "Phase 9 status integration cover letter.",
    resumeSnapshot: {
      url: "https://example.com/resume.pdf",
      originalName: "resume.pdf"
    },
    candidateSnapshot: {
      firstName: "Phase",
      lastName: "Nine",
      email: "candidate@example.com",
      skills: ["Node.js", "SQL"],
      experience: 1
    },
    jobSnapshot: { id: job.id, title: job.title, location: job.location },
    companySnapshot: { id: company.id, name: company.companyName },
    salarySnapshot: { minimum: 500000, maximum: 900000, currency: "INR" }
  });

const createFixture = async ({
  status = "SCHEDULED",
  started = false
} = {}) => {
  const recruiterEmail = createEmail("recruiter");
  const candidateEmail = createEmail("candidate");

  const recruiter = await createUser({ email: recruiterEmail, role: "RECRUITER" });
  const candidate = await createUser({ email: candidateEmail, role: "JOB_SEEKER" });
  const company = await createCompany(recruiter.id);
  const job = await createJob({ recruiterId: recruiter.id, companyId: company.id });
  const application = await createApplication({ candidateId: candidate.id, job, company });

  const start = started
    ? new Date(Date.now() - 60 * 60 * 1000)
    : new Date(Date.now() + 180 * 60 * 1000);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  const interview = await Interview.create({
    applicationId: application.id,
    candidateId: candidate.id,
    recruiterId: recruiter.id,
    jobId: job.id,
    companyId: company.id,
    scheduledStartAt: start,
    scheduledEndAt: end,
    timezone: "Asia/Kolkata",
    meetingType: "ONLINE",
    meetingLink: "https://meet.example.com/status-interview",
    interviewInstructions: "Join five minutes early.",
    status,
    confirmedAt: status === "CONFIRMED" ? new Date() : null,
    declinedAt: status === "DECLINED" ? new Date() : null,
    declineReason: status === "DECLINED" ? "Candidate unavailable." : null,
    cancelledAt: status === "CANCELLED" ? new Date() : null,
    cancellationReason: status === "CANCELLED" ? "Interview cancelled." : null,
    completedAt: status === "COMPLETED" ? new Date() : null
  });

  await InterviewHistory.create({
    interviewId: interview.id,
    previousStatus: null,
    newStatus: status,
    newSchedule: {
      scheduledStartAt: start,
      scheduledEndAt: end,
      timezone: "Asia/Kolkata"
    },
    newMeetingInfo: {
      meetingType: "ONLINE",
      meetingLink: interview.meetingLink
    },
    changedBy: recruiter.id,
    event: "INTERVIEW_SCHEDULED"
  });

  return {
    recruiter,
    candidate,
    company,
    job,
    application,
    interview,
    recruiterEmail,
    candidateEmail
  };
};

const getTestUsers = () =>
  User.unscoped().findAll({
    where: { email: { [Op.like]: `${EMAIL_PREFIX}%` } },
    attributes: ["id"]
  });

const cleanup = async () => {
  const users = await getTestUsers();
  const userIds = users.map(user => user.id);
  if (!userIds.length) return;

  const applications = await Application.findAll({
    where: { candidateId: { [Op.in]: userIds } },
    attributes: ["id"]
  });
  const applicationIds = applications.map(item => item.id);

  const interviews = await Interview.findAll({
    where: {
      [Op.or]: [
        { candidateId: { [Op.in]: userIds } },
        { recruiterId: { [Op.in]: userIds } }
      ]
    },
    attributes: ["id"]
  });
  const interviewIds = interviews.map(item => item.id);

  if (interviewIds.length) {
    await InterviewHistory.destroy({
      where: { interviewId: { [Op.in]: interviewIds } },
      force: true
    });
    await Interview.destroy({
      where: { id: { [Op.in]: interviewIds } },
      force: true
    });
  }

  if (applicationIds.length) {
    await ApplicationStatusHistory.destroy({
      where: { applicationId: { [Op.in]: applicationIds } },
      force: true
    });
    await Application.destroy({
      where: { id: { [Op.in]: applicationIds } },
      force: true
    });
  }

  await Job.unscoped().destroy({
    where: { createdBy: { [Op.in]: userIds } },
    force: true
  });
  await Company.unscoped().destroy({
    where: { ownerId: { [Op.in]: userIds } },
    force: true
  });
  await UserSession.unscoped().destroy({
    where: { userId: { [Op.in]: userIds } },
    force: true
  });
  await User.unscoped().destroy({
    where: { id: { [Op.in]: userIds } },
    force: true
  });
};

describe("Phase 9 Interview Status Workflow APIs", () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  test("SCHEDULED interview can be confirmed by the candidate", async () => {
    const fixture = await createFixture({ status: "SCHEDULED" });
    const token = await login(fixture.candidateEmail);

    await request(app)
      .patch(`/api/job-seeker/interviews/${fixture.interview.id}/confirm`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const stored = await Interview.findByPk(fixture.interview.id);
    expect(stored.status).toBe("CONFIRMED");
  });

  test("SCHEDULED interview can be declined by the candidate", async () => {
    const fixture = await createFixture({ status: "SCHEDULED" });
    const token = await login(fixture.candidateEmail);

    await request(app)
      .patch(`/api/job-seeker/interviews/${fixture.interview.id}/decline`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Candidate is unavailable." })
      .expect(200);

    const stored = await Interview.findByPk(fixture.interview.id);
    expect(stored.status).toBe("DECLINED");
  });

  test("CONFIRMED interview can be completed after it starts", async () => {
    const fixture = await createFixture({ status: "CONFIRMED", started: true });
    const token = await login(fixture.recruiterEmail);

    const response = await request(app)
      .patch(`/api/recruiter/interviews/${fixture.interview.id}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.interview.status).toBe("COMPLETED");

    const storedInterview = await Interview.findByPk(fixture.interview.id);
    const storedApplication = await Application.findByPk(fixture.application.id);

    expect(storedInterview.status).toBe("COMPLETED");
    expect(storedInterview.completedAt).not.toBeNull();
    expect(storedApplication.status).toBe("INTERVIEW_COMPLETED");

    const applicationHistory = await ApplicationStatusHistory.findOne({
      where: {
        applicationId: fixture.application.id,
        newStatus: "INTERVIEW_COMPLETED"
      }
    });
    expect(applicationHistory).not.toBeNull();
    expect(applicationHistory.previousStatus).toBe("INTERVIEW_SCHEDULED");
  });

  test("interview cannot be completed before its start time", async () => {
    const fixture = await createFixture({ status: "CONFIRMED", started: false });
    const token = await login(fixture.recruiterEmail);

    const response = await request(app)
      .patch(`/api/recruiter/interviews/${fixture.interview.id}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .expect(409);

    expect(response.body.code).toBe("INTERVIEW_NOT_STARTED");
  });

  test("SCHEDULED interview cannot move directly to COMPLETED", async () => {
    const fixture = await createFixture({ status: "SCHEDULED", started: true });
    const token = await login(fixture.recruiterEmail);

    const response = await request(app)
      .patch(`/api/recruiter/interviews/${fixture.interview.id}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .expect(409);

    expect(response.body.code).toBe("INVALID_INTERVIEW_STATUS_TRANSITION");
  });

  test("CANCELLED interview is terminal and cannot be rescheduled", async () => {
    const fixture = await createFixture({ status: "CANCELLED" });
    const token = await login(fixture.recruiterEmail);
    const start = new Date(Date.now() + 5 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const response = await request(app)
      .patch(`/api/recruiter/interviews/${fixture.interview.id}/reschedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        scheduledStartAt: start.toISOString(),
        scheduledEndAt: end.toISOString(),
        timezone: "Asia/Kolkata",
        meetingType: "ONLINE",
        meetingLink: "https://meet.example.com/not-allowed",
        reason: "Attempt to reschedule cancelled interview."
      })
      .expect(409);

    expect(response.body.code).toBe("INVALID_INTERVIEW_STATUS_TRANSITION");
  });

  test("COMPLETED interview is terminal and cannot be cancelled", async () => {
    const fixture = await createFixture({ status: "COMPLETED", started: true });
    const token = await login(fixture.recruiterEmail);

    const response = await request(app)
      .patch(`/api/recruiter/interviews/${fixture.interview.id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Attempt to cancel completed interview." })
      .expect(409);

    expect(response.body.code).toBe("INVALID_INTERVIEW_STATUS_TRANSITION");
  });

  test("feedback requires a completed interview", async () => {
    const fixture = await createFixture({ status: "CONFIRMED", started: true });
    const token = await login(fixture.recruiterEmail);

    const response = await request(app)
      .put(`/api/recruiter/interviews/${fixture.interview.id}/feedback`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        feedback: "Good performance.",
        rating: 4,
        strengths: "Backend skills.",
        concerns: "Communication.",
        recommendation: "Proceed.",
        feedbackVisibleToCandidate: false
      })
      .expect(409);

    expect(response.body.code).toBe("INTERVIEW_NOT_COMPLETED");
  });

  test("recruiter can save feedback for a completed interview", async () => {
    const fixture = await createFixture({ status: "COMPLETED", started: true });
    const token = await login(fixture.recruiterEmail);

    const response = await request(app)
      .put(`/api/recruiter/interviews/${fixture.interview.id}/feedback`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        feedback: "Strong technical performance.",
        rating: 5,
        strengths: "JavaScript and SQL.",
        concerns: "None.",
        recommendation: "Proceed to offer.",
        feedbackVisibleToCandidate: true
      })
      .expect(200);

    expect(response.body.data.interview).toEqual(
      expect.objectContaining({
        feedback: "Strong technical performance.",
        rating: 5,
        strengths: "JavaScript and SQL.",
        concerns: "None.",
        recommendation: "Proceed to offer.",
        feedbackVisibleToCandidate: true
      })
    );

    const history = await InterviewHistory.findAll({
      where: { interviewId: fixture.interview.id },
      order: [["createdAt", "ASC"]]
    });
    expect(history[history.length - 1].event).toBe("INTERVIEW_FEEDBACK_UPDATED");
  });

  test("feedback rating outside 1 to 5 is rejected", async () => {
    const fixture = await createFixture({ status: "COMPLETED", started: true });
    const token = await login(fixture.recruiterEmail);

    await request(app)
      .put(`/api/recruiter/interviews/${fixture.interview.id}/feedback`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        feedback: "Invalid rating test.",
        rating: 6
      })
      .expect(422);
  });
});
