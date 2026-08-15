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
const EMAIL_PREFIX = "p9recruiter.";
const SLUG_PREFIX = "recruiter-interview-";

const uniqueValue = label =>
  `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const createEmail = label =>
  `${EMAIL_PREFIX}${uniqueValue(label)}@example.com`;

const createUser = async ({ email, role, status = "ACTIVE" }) =>
  User.create({
    email,
    passwordHash: await hashPassword(PASSWORD),
    role,
    status,
    emailVerifiedAt: new Date()
  });

const login = async email => {
  const response = await request(app)
    .post("/api/auth/login")
    .set("User-Agent", "CareerForge Recruiter Interview Integration Test")
    .send({ email, password: PASSWORD })
    .expect(200);

  return response.body.data.accessToken;
};

const createCompany = recruiterId =>
  Company.create({
    ownerId: recruiterId,
    companyName: "Recruiter Interview Test Company",
    slug: `${SLUG_PREFIX}${uniqueValue("company")}`,
    status: "VERIFIED"
  });

const createJob = ({ recruiterId, companyId }) =>
  Job.create({
    companyId,
    createdBy: recruiterId,
    title: "Backend Developer",
    slug: `${SLUG_PREFIX}${uniqueValue("job")}`,
    description: "Recruiter interview integration test job.",
    responsibilities: "Develop and maintain backend APIs.",
    requirements: "Node.js, Express and SQL knowledge.",
    skills: ["Node.js", "Express", "SQL"],
    location: "Hyderabad",
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
    coverLetter: "Recruiter interview integration cover letter.",
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

const futureTimes = ({ startAfterMinutes = 120, durationMinutes = 30 } = {}) => {
  const start = new Date(Date.now() + startAfterMinutes * 60 * 1000);
  return {
    start,
    end: new Date(start.getTime() + durationMinutes * 60 * 1000)
  };
};

const createInterview = async ({
  application,
  candidateId,
  recruiterId,
  jobId,
  companyId,
  status = "SCHEDULED",
  startAfterMinutes = 120,
  meetingType = "ONLINE"
}) => {
  const { start, end } = futureTimes({ startAfterMinutes });

  return Interview.create({
    applicationId: application.id,
    candidateId,
    recruiterId,
    jobId,
    companyId,
    scheduledStartAt: start,
    scheduledEndAt: end,
    timezone: "Asia/Kolkata",
    meetingType,
    meetingLink: meetingType === "ONLINE"
      ? "https://meet.example.com/recruiter-interview"
      : null,
    physicalLocation: meetingType === "IN_PERSON"
      ? "CareerForge Office, Hyderabad"
      : null,
    phoneInstructions: meetingType === "PHONE"
      ? "Recruiter will call the candidate."
      : null,
    interviewInstructions: "Join five minutes early.",
    status,
    confirmedAt: status === "CONFIRMED" ? new Date() : null
  });
};

const createFixture = async ({ interviewStatus = "SCHEDULED" } = {}) => {
  const recruiterEmail = createEmail("recruiter");
  const candidateEmail = createEmail("candidate");

  const recruiter = await createUser({ email: recruiterEmail, role: "RECRUITER" });
  const candidate = await createUser({ email: candidateEmail, role: "JOB_SEEKER" });
  const company = await createCompany(recruiter.id);
  const job = await createJob({ recruiterId: recruiter.id, companyId: company.id });
  const application = await createApplication({ candidateId: candidate.id, job, company });
  const interview = await createInterview({
    application,
    candidateId: candidate.id,
    recruiterId: recruiter.id,
    jobId: job.id,
    companyId: company.id,
    status: interviewStatus
  });

  await InterviewHistory.create({
    interviewId: interview.id,
    previousStatus: null,
    newStatus: interview.status,
    newSchedule: {
      scheduledStartAt: interview.scheduledStartAt,
      scheduledEndAt: interview.scheduledEndAt,
      timezone: interview.timezone
    },
    newMeetingInfo: {
      meetingType: interview.meetingType,
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

describe("Recruiter Interview APIs", () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  test("recruiter can list only their interviews", async () => {
    const fixture = await createFixture();
    const token = await login(fixture.recruiterEmail);

    const response = await request(app)
      .get("/api/recruiter/interviews?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.interviews).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: fixture.interview.id,
          recruiterId: fixture.recruiter.id
        })
      ])
    );
    expect(response.body.meta.page).toBe(1);
  });

  test("recruiter list supports status and meeting type filters", async () => {
    const fixture = await createFixture();
    const token = await login(fixture.recruiterEmail);

    const response = await request(app)
      .get("/api/recruiter/interviews?status=SCHEDULED&meetingType=ONLINE")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.interviews).toHaveLength(1);
    expect(response.body.data.interviews[0].status).toBe("SCHEDULED");
    expect(response.body.data.interviews[0].meetingType).toBe("ONLINE");
  });

  test("recruiter can view owned interview details and history", async () => {
    const fixture = await createFixture();
    const token = await login(fixture.recruiterEmail);

    const response = await request(app)
      .get(`/api/recruiter/interviews/${fixture.interview.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.interview).toEqual(
      expect.objectContaining({
        id: fixture.interview.id,
        applicationId: fixture.application.id,
        recruiterId: fixture.recruiter.id,
        candidateId: fixture.candidate.id,
        history: expect.any(Array)
      })
    );
    expect(response.body.data.interview.history).toHaveLength(1);
  });

  test("recruiter cannot view another recruiter's interview", async () => {
    const fixture = await createFixture();
    const otherEmail = createEmail("other-recruiter");
    await createUser({ email: otherEmail, role: "RECRUITER" });
    const token = await login(otherEmail);

    const response = await request(app)
      .get(`/api/recruiter/interviews/${fixture.interview.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(response.body.code).toBe("INTERVIEW_OWNERSHIP_REQUIRED");
  });

  test("recruiter can reschedule an interview", async () => {
    const fixture = await createFixture();
    const token = await login(fixture.recruiterEmail);
    const { start, end } = futureTimes({ startAfterMinutes: 300 });

    const response = await request(app)
      .patch(`/api/recruiter/interviews/${fixture.interview.id}/reschedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        scheduledStartAt: start.toISOString(),
        scheduledEndAt: end.toISOString(),
        timezone: "Asia/Kolkata",
        meetingType: "ONLINE",
        meetingLink: "https://meet.example.com/rescheduled",
        interviewInstructions: "Use the updated link.",
        reason: "Recruiter availability changed."
      })
      .expect(200);

    expect(response.body.data.interview.status).toBe("RESCHEDULED");

    const stored = await Interview.findByPk(fixture.interview.id);
    expect(stored.status).toBe("RESCHEDULED");
    expect(stored.meetingLink).toBe("https://meet.example.com/rescheduled");

    const history = await InterviewHistory.findAll({
      where: { interviewId: fixture.interview.id },
      order: [["createdAt", "ASC"]]
    });
    expect(history).toHaveLength(2);
    expect(history[1].event).toBe("INTERVIEW_RESCHEDULED");
    expect(history[1].previousStatus).toBe("SCHEDULED");
  });

  test("recruiter can cancel an interview with a reason", async () => {
    const fixture = await createFixture();
    const token = await login(fixture.recruiterEmail);

    const response = await request(app)
      .patch(`/api/recruiter/interviews/${fixture.interview.id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Position has been placed on hold." })
      .expect(200);

    expect(response.body.data.interview.status).toBe("CANCELLED");

    const stored = await Interview.findByPk(fixture.interview.id);
    expect(stored.status).toBe("CANCELLED");
    expect(stored.cancellationReason).toBe("Position has been placed on hold.");
    expect(stored.cancelledAt).not.toBeNull();
  });

  test("recruiter history endpoint returns lifecycle events", async () => {
    const fixture = await createFixture();
    const token = await login(fixture.recruiterEmail);

    const response = await request(app)
      .get(`/api/recruiter/interviews/${fixture.interview.id}/history`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.history).toHaveLength(1);
    expect(response.body.data.history[0]).toEqual(
      expect.objectContaining({
        interviewId: fixture.interview.id,
        event: "INTERVIEW_SCHEDULED",
        newStatus: "SCHEDULED"
      })
    );
  });

  test("job seeker cannot access recruiter interview list", async () => {
    const fixture = await createFixture();
    const token = await login(fixture.candidateEmail);

    await request(app)
      .get("/api/recruiter/interviews")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);
  });
});
