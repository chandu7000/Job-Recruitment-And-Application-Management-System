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
const EMAIL_PREFIX = "p9candidate.";
const SLUG_PREFIX = "phase9-candidate-";

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
    .set("User-Agent", "CareerForge Phase 9 Candidate Integration Test")
    .send({ email, password: PASSWORD })
    .expect(200);

  return response.body.data.accessToken;
};

const createCompany = recruiterId =>
  Company.create({
    ownerId: recruiterId,
    companyName: "Phase 9 Candidate Company",
    slug: `${SLUG_PREFIX}${uniqueValue("company")}`,
    status: "VERIFIED"
  });

const createJob = ({ recruiterId, companyId }) =>
  Job.create({
    companyId,
    createdBy: recruiterId,
    title: "Phase 9 Candidate Backend Developer",
    slug: `${SLUG_PREFIX}${uniqueValue("job")}`,
    description: "Candidate interview integration test job.",
    responsibilities: "Develop and maintain backend APIs.",
    requirements: "Node.js, Express and SQL knowledge.",
    skills: ["Node.js", "Express", "SQL"],
    location: "Vijayawada",
    workMode: "REMOTE",
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
    coverLetter: "Phase 9 candidate integration cover letter.",
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
  feedbackVisibleToCandidate = false,
  startAfterMinutes = 180
} = {}) => {
  const recruiterEmail = createEmail("recruiter");
  const candidateEmail = createEmail("candidate");

  const recruiter = await createUser({ email: recruiterEmail, role: "RECRUITER" });
  const candidate = await createUser({ email: candidateEmail, role: "JOB_SEEKER" });
  const company = await createCompany(recruiter.id);
  const job = await createJob({ recruiterId: recruiter.id, companyId: company.id });
  const application = await createApplication({ candidateId: candidate.id, job, company });

  const start = new Date(Date.now() + startAfterMinutes * 60 * 1000);
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
    meetingLink: "https://meet.example.com/candidate-interview",
    interviewInstructions: "Join five minutes early.",
    status,
    confirmedAt: status === "CONFIRMED" ? new Date() : null,
    completedAt: status === "COMPLETED" ? new Date() : null,
    feedback: status === "COMPLETED" ? "Strong technical performance." : null,
    rating: status === "COMPLETED" ? 5 : null,
    strengths: status === "COMPLETED" ? "Backend fundamentals." : null,
    concerns: status === "COMPLETED" ? "None." : null,
    recommendation: status === "COMPLETED" ? "Proceed to offer." : null,
    feedbackVisibleToCandidate
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

describe("Phase 9 Candidate Interview APIs", () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  test("candidate can list only their interviews", async () => {
    const fixture = await createFixture();
    const token = await login(fixture.candidateEmail);

    const response = await request(app)
      .get("/api/job-seeker/interviews?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.interviews).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: fixture.interview.id,
          candidateId: fixture.candidate.id
        })
      ])
    );
  });

  test("candidate list supports upcoming and status filters", async () => {
    const fixture = await createFixture();
    const token = await login(fixture.candidateEmail);

    const response = await request(app)
      .get("/api/job-seeker/interviews?upcoming=true&status=SCHEDULED")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.interviews).toHaveLength(1);
    expect(response.body.data.interviews[0].status).toBe("SCHEDULED");
  });

  test("candidate can view their interview details", async () => {
    const fixture = await createFixture();
    const token = await login(fixture.candidateEmail);

    const response = await request(app)
      .get(`/api/job-seeker/interviews/${fixture.interview.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.interview).toEqual(
      expect.objectContaining({
        id: fixture.interview.id,
        candidateId: fixture.candidate.id,
        meetingType: "ONLINE",
        history: expect.any(Array)
      })
    );
  });

  test("candidate cannot view another candidate's interview", async () => {
    const fixture = await createFixture();
    const otherCandidateEmail = createEmail("other-candidate");
    await createUser({ email: otherCandidateEmail, role: "JOB_SEEKER" });
    const token = await login(otherCandidateEmail);

    const response = await request(app)
      .get(`/api/job-seeker/interviews/${fixture.interview.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(response.body.code).toBe("INTERVIEW_OWNERSHIP_REQUIRED");
  });

  test("candidate can confirm attendance", async () => {
    const fixture = await createFixture();
    const token = await login(fixture.candidateEmail);

    const response = await request(app)
      .patch(`/api/job-seeker/interviews/${fixture.interview.id}/confirm`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.interview.status).toBe("CONFIRMED");

    const stored = await Interview.findByPk(fixture.interview.id);
    expect(stored.status).toBe("CONFIRMED");
    expect(stored.confirmedAt).not.toBeNull();

    const history = await InterviewHistory.findAll({
      where: { interviewId: fixture.interview.id },
      order: [["createdAt", "ASC"]]
    });
    expect(history).toHaveLength(2);
    expect(history[1].event).toBe("INTERVIEW_CONFIRMED");
    expect(history[1].changedBy).toBe(fixture.candidate.id);
  });

  test("candidate can decline attendance with a reason", async () => {
    const fixture = await createFixture();
    const token = await login(fixture.candidateEmail);

    const response = await request(app)
      .patch(`/api/job-seeker/interviews/${fixture.interview.id}/decline`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "I am unavailable at the scheduled time." })
      .expect(200);

    expect(response.body.data.interview.status).toBe("DECLINED");

    const stored = await Interview.findByPk(fixture.interview.id);
    expect(stored.status).toBe("DECLINED");
    expect(stored.declineReason).toBe("I am unavailable at the scheduled time.");
    expect(stored.declinedAt).not.toBeNull();
  });

  test("candidate detail hides private feedback when visibility is false", async () => {
    const fixture = await createFixture({
      status: "COMPLETED",
      feedbackVisibleToCandidate: false
    });
    const token = await login(fixture.candidateEmail);

    const response = await request(app)
      .get(`/api/job-seeker/interviews/${fixture.interview.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const interview = response.body.data.interview;
    expect(interview).not.toHaveProperty("feedback");
    expect(interview).not.toHaveProperty("rating");
    expect(interview).not.toHaveProperty("strengths");
    expect(interview).not.toHaveProperty("concerns");
    expect(interview).not.toHaveProperty("recommendation");
  });

  test("candidate detail exposes feedback when visibility is true", async () => {
    const fixture = await createFixture({
      status: "COMPLETED",
      feedbackVisibleToCandidate: true
    });
    const token = await login(fixture.candidateEmail);

    const response = await request(app)
      .get(`/api/job-seeker/interviews/${fixture.interview.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.interview).toEqual(
      expect.objectContaining({
        feedback: "Strong technical performance.",
        rating: 5,
        strengths: "Backend fundamentals.",
        concerns: "None.",
        recommendation: "Proceed to offer."
      })
    );
  });

  test("recruiter cannot access candidate interview list", async () => {
    const fixture = await createFixture();
    const token = await login(fixture.recruiterEmail);

    await request(app)
      .get("/api/job-seeker/interviews")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);
  });
});
