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
const EMAIL_PREFIX = "p9interview.";
const SLUG_PREFIX = "interview-scheduling-";

const uniqueValue = (label) =>
  `${label}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

const createEmail = (label) =>
  `${EMAIL_PREFIX}${uniqueValue(label)}@example.com`;

const createUser = async ({
  email,
  role,
  status = "ACTIVE"
}) => {
  const passwordHash = await hashPassword(PASSWORD);

  return User.create({
    email,
    passwordHash,
    role,
    status,
    emailVerifiedAt: new Date()
  });
};

const login = async (email) => {
  const response = await request(app)
    .post("/api/auth/login")
    .set(
      "User-Agent",
      "CareerForge Interview Integration Test"
    )
    .send({
      email,
      password: PASSWORD
    })
    .expect(200);

  return response.body.data.accessToken;
};

const createCompany = async (recruiterId) => {
  return Company.create({
    ownerId: recruiterId,
    companyName: "Interview Test Company",
    slug: `${SLUG_PREFIX}${uniqueValue("company")}`,
    status: "VERIFIED"
  });
};

const createJob = async ({
  recruiterId,
  companyId
}) => {
  return Job.create({
    companyId,
    createdBy: recruiterId,
    title: "Backend Developer",
    slug: `${SLUG_PREFIX}${uniqueValue("job")}`,
    description:
      "Interview scheduling integration test job.",
    responsibilities:
      "Develop and maintain backend APIs.",
    requirements:
      "Node.js, Express and SQL knowledge.",
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
    applicationDeadline: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
    status: "PUBLISHED",
    publishedAt: new Date()
  });
};

const createApplication = async ({
  candidateId,
  job,
  company,
  status = "SHORTLISTED"
}) => {
  const application = await Application.create({
    candidateId,
    jobId: job.id,
    companyId: company.id,
    status,
    coverLetter:
      "Interview scheduling integration cover letter.",
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
    jobSnapshot: {
      id: job.id,
      title: job.title,
      location: job.location
    },
    companySnapshot: {
      id: company.id,
      name: company.companyName
    },
    salarySnapshot: {
      minimum: 500000,
      maximum: 900000,
      currency: "INR"
    }
  });

  await ApplicationStatusHistory.create({
    applicationId: application.id,
    previousStatus: "UNDER_REVIEW",
    newStatus: status,
    changedBy: job.createdBy,
    reason: "Candidate shortlisted for interview."
  });

  return application;
};

const createScheduleBody = ({
  startAfterMinutes = 120,
  durationMinutes = 30,
  meetingType = "ONLINE"
} = {}) => {
  const start = new Date(
    Date.now() + startAfterMinutes * 60 * 1000
  );

  const end = new Date(
    start.getTime() + durationMinutes * 60 * 1000
  );

  const body = {
    scheduledStartAt: start.toISOString(),
    scheduledEndAt: end.toISOString(),
    timezone: "Asia/Kolkata",
    meetingType,
    interviewInstructions:
      "Join the interview five minutes early."
  };

  if (meetingType === "ONLINE") {
    body.meetingLink =
      "https://meet.example.com/interview-session";
  }

  if (meetingType === "IN_PERSON") {
    body.physicalLocation =
      "CareerForge Office, Hyderabad";
  }

  if (meetingType === "PHONE") {
    body.phoneInstructions =
      "The recruiter will call the registered number.";
  }

  return body;
};

const getTestUsers = async () => {
  return User.unscoped().findAll({
    where: {
      email: {
        [Op.like]: `${EMAIL_PREFIX}%`
      }
    },
    attributes: ["id"]
  });
};

const cleanup = async () => {
  const users = await getTestUsers();
  const userIds = users.map((user) => user.id);

  if (userIds.length === 0) {
    return;
  }

  const applications = await Application.findAll({
    where: {
      candidateId: {
        [Op.in]: userIds
      }
    },
    attributes: ["id"]
  });

  const applicationIds = applications.map(
    (application) => application.id
  );

  const interviews = await Interview.findAll({
    where: {
      [Op.or]: [
        {
          candidateId: {
            [Op.in]: userIds
          }
        },
        {
          recruiterId: {
            [Op.in]: userIds
          }
        }
      ]
    },
    attributes: ["id"]
  });

  const interviewIds = interviews.map(
    (interview) => interview.id
  );

  if (interviewIds.length > 0) {
    await InterviewHistory.destroy({
      where: {
        interviewId: {
          [Op.in]: interviewIds
        }
      },
      force: true
    });

    await Interview.destroy({
      where: {
        id: {
          [Op.in]: interviewIds
        }
      },
      force: true
    });
  }

  if (applicationIds.length > 0) {
    await ApplicationStatusHistory.destroy({
      where: {
        applicationId: {
          [Op.in]: applicationIds
        }
      },
      force: true
    });

    await Application.destroy({
      where: {
        id: {
          [Op.in]: applicationIds
        }
      },
      force: true
    });
  }

  await Job.unscoped().destroy({
    where: {
      createdBy: {
        [Op.in]: userIds
      }
    },
    force: true
  });

  await Company.unscoped().destroy({
    where: {
      ownerId: {
        [Op.in]: userIds
      }
    },
    force: true
  });

  await UserSession.unscoped().destroy({
    where: {
      userId: {
        [Op.in]: userIds
      }
    },
    force: true
  });

  await User.unscoped().destroy({
    where: {
      id: {
        [Op.in]: userIds
      }
    },
    force: true
  });
};

describe("Interview Scheduling API", () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  test(
    "recruiter can schedule an online interview for a shortlisted application",
    async () => {
      const recruiterEmail =
        createEmail("recruiter");

      const candidateEmail =
        createEmail("candidate");

      const recruiter = await createUser({
        email: recruiterEmail,
        role: "RECRUITER"
      });

      const candidate = await createUser({
        email: candidateEmail,
        role: "JOB_SEEKER"
      });

      const company = await createCompany(
        recruiter.id
      );

      const job = await createJob({
        recruiterId: recruiter.id,
        companyId: company.id
      });

      const application = await createApplication({
        candidateId: candidate.id,
        job,
        company
      });

      const recruiterToken = await login(
        recruiterEmail
      );

      const response = await request(app)
        .post(
          `/api/recruiter/interviews/applications/${application.id}`
        )
        .set(
          "Authorization",
          `Bearer ${recruiterToken}`
        )
        .send(createScheduleBody())
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Interview scheduled successfully."
      );

      expect(response.body.data.interview).toEqual(
        expect.objectContaining({
          applicationId: application.id,
          candidateId: candidate.id,
          recruiterId: recruiter.id,
          jobId: job.id,
          companyId: company.id,
          meetingType: "ONLINE",
          status: "SCHEDULED"
        })
      );

      const storedInterview =
        await Interview.findOne({
          where: {
            applicationId: application.id
          }
        });

      expect(storedInterview).not.toBeNull();
      expect(storedInterview.status).toBe(
        "SCHEDULED"
      );

      const updatedApplication =
        await Application.findByPk(
          application.id
        );

      expect(updatedApplication.status).toBe(
        "INTERVIEW_SCHEDULED"
      );

      const history =
        await InterviewHistory.findAll({
          where: {
            interviewId: storedInterview.id
          }
        });

      expect(history).toHaveLength(1);
      expect(history[0].event).toBe(
        "INTERVIEW_SCHEDULED"
      );
      expect(history[0].newStatus).toBe(
        "SCHEDULED"
      );
      expect(history[0].changedBy).toBe(
        recruiter.id
      );

      const applicationHistory =
        await ApplicationStatusHistory.findOne({
          where: {
            applicationId: application.id,
            newStatus:
              "INTERVIEW_SCHEDULED"
          }
        });

      expect(applicationHistory).not.toBeNull();
      expect(
        applicationHistory.previousStatus
      ).toBe("SHORTLISTED");
    }
  );

  test(
    "recruiter can schedule an in-person interview",
    async () => {
      const recruiterEmail =
        createEmail("in-person-recruiter");

      const candidateEmail =
        createEmail("in-person-candidate");

      const recruiter = await createUser({
        email: recruiterEmail,
        role: "RECRUITER"
      });

      const candidate = await createUser({
        email: candidateEmail,
        role: "JOB_SEEKER"
      });

      const company = await createCompany(
        recruiter.id
      );

      const job = await createJob({
        recruiterId: recruiter.id,
        companyId: company.id
      });

      const application = await createApplication({
        candidateId: candidate.id,
        job,
        company
      });

      const token = await login(recruiterEmail);

      const response = await request(app)
        .post(
          `/api/recruiter/interviews/applications/${application.id}`
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send(
          createScheduleBody({
            meetingType: "IN_PERSON"
          })
        )
        .expect(201);

      expect(
        response.body.data.interview.meetingType
      ).toBe("IN_PERSON");

      expect(
        response.body.data.interview
          .physicalLocation
      ).toBe(
        "CareerForge Office, Hyderabad"
      );
    }
  );

  test(
    "recruiter can schedule a phone interview",
    async () => {
      const recruiterEmail =
        createEmail("phone-recruiter");

      const candidateEmail =
        createEmail("phone-candidate");

      const recruiter = await createUser({
        email: recruiterEmail,
        role: "RECRUITER"
      });

      const candidate = await createUser({
        email: candidateEmail,
        role: "JOB_SEEKER"
      });

      const company = await createCompany(
        recruiter.id
      );

      const job = await createJob({
        recruiterId: recruiter.id,
        companyId: company.id
      });

      const application = await createApplication({
        candidateId: candidate.id,
        job,
        company
      });

      const token = await login(recruiterEmail);

      const response = await request(app)
        .post(
          `/api/recruiter/interviews/applications/${application.id}`
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send(
          createScheduleBody({
            meetingType: "PHONE"
          })
        )
        .expect(201);

      expect(
        response.body.data.interview.meetingType
      ).toBe("PHONE");

      expect(
        response.body.data.interview
          .phoneInstructions
      ).toBe(
        "The recruiter will call the registered number."
      );
    }
  );

  test(
    "rejects scheduling without authentication",
    async () => {
      const randomApplicationId =
        "11111111-1111-4111-8111-111111111111";

      await request(app)
        .post(
          `/api/recruiter/interviews/applications/${randomApplicationId}`
        )
        .send(createScheduleBody())
        .expect(401);
    }
  );

  test(
    "rejects job seeker from recruiter schedule endpoint",
    async () => {
      const candidateEmail =
        createEmail("unauthorized-candidate");

      await createUser({
        email: candidateEmail,
        role: "JOB_SEEKER"
      });

      const candidateToken = await login(
        candidateEmail
      );

      const randomApplicationId =
        "11111111-1111-4111-8111-111111111111";

      const response = await request(app)
        .post(
          `/api/recruiter/interviews/applications/${randomApplicationId}`
        )
        .set(
          "Authorization",
          `Bearer ${candidateToken}`
        )
        .send(createScheduleBody())
        .expect(403);

      expect(response.body.success).toBe(false);
    }
  );

  test(
    "rejects an application that is not shortlisted",
    async () => {
      const recruiterEmail =
        createEmail("status-recruiter");

      const candidateEmail =
        createEmail("status-candidate");

      const recruiter = await createUser({
        email: recruiterEmail,
        role: "RECRUITER"
      });

      const candidate = await createUser({
        email: candidateEmail,
        role: "JOB_SEEKER"
      });

      const company = await createCompany(
        recruiter.id
      );

      const job = await createJob({
        recruiterId: recruiter.id,
        companyId: company.id
      });

      const application = await createApplication({
        candidateId: candidate.id,
        job,
        company,
        status: "UNDER_REVIEW"
      });

      const token = await login(recruiterEmail);

      const response = await request(app)
        .post(
          `/api/recruiter/interviews/applications/${application.id}`
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send(createScheduleBody())
        .expect(409);

      expect(response.body.code).toBe(
        "APPLICATION_NOT_SHORTLISTED"
      );

      const interviewCount =
        await Interview.count({
          where: {
            applicationId: application.id
          }
        });

      expect(interviewCount).toBe(0);
    }
  );

  test(
    "rejects recruiter ownership violation",
    async () => {
      const ownerEmail =
        createEmail("owner-recruiter");

      const otherRecruiterEmail =
        createEmail("other-recruiter");

      const candidateEmail =
        createEmail("ownership-candidate");

      const owner = await createUser({
        email: ownerEmail,
        role: "RECRUITER"
      });

      await createUser({
        email: otherRecruiterEmail,
        role: "RECRUITER"
      });

      const candidate = await createUser({
        email: candidateEmail,
        role: "JOB_SEEKER"
      });

      const company = await createCompany(
        owner.id
      );

      const job = await createJob({
        recruiterId: owner.id,
        companyId: company.id
      });

      const application = await createApplication({
        candidateId: candidate.id,
        job,
        company
      });

      const otherToken = await login(
        otherRecruiterEmail
      );

      const response = await request(app)
        .post(
          `/api/recruiter/interviews/applications/${application.id}`
        )
        .set(
          "Authorization",
          `Bearer ${otherToken}`
        )
        .send(createScheduleBody())
        .expect(404);

      expect(response.body.code).toBe(
        "APPLICATION_NOT_FOUND"
      );

      expect(
        await Interview.count({
          where: {
            applicationId: application.id
          }
        })
      ).toBe(0);
    }
  );

  test(
    "rejects duplicate active interview for the same application",
    async () => {
      const recruiterEmail =
        createEmail("duplicate-recruiter");

      const candidateEmail =
        createEmail("duplicate-candidate");

      const recruiter = await createUser({
        email: recruiterEmail,
        role: "RECRUITER"
      });

      const candidate = await createUser({
        email: candidateEmail,
        role: "JOB_SEEKER"
      });

      const company = await createCompany(
        recruiter.id
      );

      const job = await createJob({
        recruiterId: recruiter.id,
        companyId: company.id
      });

      const application = await createApplication({
        candidateId: candidate.id,
        job,
        company
      });

      const token = await login(recruiterEmail);
      const schedule = createScheduleBody();

      await request(app)
        .post(
          `/api/recruiter/interviews/applications/${application.id}`
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send(schedule)
        .expect(201);

      await application.update({
        status: "SHORTLISTED"
      });

      const response = await request(app)
        .post(
          `/api/recruiter/interviews/applications/${application.id}`
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send(
          createScheduleBody({
            startAfterMinutes: 240
          })
        )
        .expect(409);

      expect(response.body.code).toBe(
        "ACTIVE_INTERVIEW_EXISTS"
      );

      expect(
        await Interview.count({
          where: {
            applicationId: application.id
          }
        })
      ).toBe(1);
    }
  );

  test(
    "rejects online interview without meeting link",
    async () => {
      const recruiterEmail =
        createEmail("missing-link-recruiter");

      const candidateEmail =
        createEmail("missing-link-candidate");

      const recruiter = await createUser({
        email: recruiterEmail,
        role: "RECRUITER"
      });

      const candidate = await createUser({
        email: candidateEmail,
        role: "JOB_SEEKER"
      });

      const company = await createCompany(
        recruiter.id
      );

      const job = await createJob({
        recruiterId: recruiter.id,
        companyId: company.id
      });

      const application = await createApplication({
        candidateId: candidate.id,
        job,
        company
      });

      const token = await login(recruiterEmail);

      const body = createScheduleBody();
      delete body.meetingLink;

      const response = await request(app)
        .post(
          `/api/recruiter/interviews/applications/${application.id}`
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send(body)
        .expect(422);

      expect(response.body.code).toBe(
        "INVALID_MEETING_LINK"
      );
    }
  );

  test(
    "rejects interview shorter than 15 minutes",
    async () => {
      const recruiterEmail =
        createEmail("duration-recruiter");

      const candidateEmail =
        createEmail("duration-candidate");

      const recruiter = await createUser({
        email: recruiterEmail,
        role: "RECRUITER"
      });

      const candidate = await createUser({
        email: candidateEmail,
        role: "JOB_SEEKER"
      });

      const company = await createCompany(
        recruiter.id
      );

      const job = await createJob({
        recruiterId: recruiter.id,
        companyId: company.id
      });

      const application = await createApplication({
        candidateId: candidate.id,
        job,
        company
      });

      const token = await login(recruiterEmail);

      const response = await request(app)
        .post(
          `/api/recruiter/interviews/applications/${application.id}`
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send(
          createScheduleBody({
            durationMinutes: 14
          })
        )
        .expect(422);

      expect(response.body.code).toBe(
        "INVALID_INTERVIEW_DURATION"
      );
    }
  );

  test(
    "rejects interview scheduled in the past",
    async () => {
      const recruiterEmail =
        createEmail("past-recruiter");

      const candidateEmail =
        createEmail("past-candidate");

      const recruiter = await createUser({
        email: recruiterEmail,
        role: "RECRUITER"
      });

      const candidate = await createUser({
        email: candidateEmail,
        role: "JOB_SEEKER"
      });

      const company = await createCompany(
        recruiter.id
      );

      const job = await createJob({
        recruiterId: recruiter.id,
        companyId: company.id
      });

      const application = await createApplication({
        candidateId: candidate.id,
        job,
        company
      });

      const token = await login(recruiterEmail);

      const response = await request(app)
        .post(
          `/api/recruiter/interviews/applications/${application.id}`
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send(
          createScheduleBody({
            startAfterMinutes: -120
          })
        )
        .expect(422);

      expect(response.body.code).toBe(
        "INTERVIEW_MUST_BE_FUTURE"
      );
    }
  );

  test(
    "rejects inactive candidate account",
    async () => {
      const recruiterEmail =
        createEmail("inactive-recruiter");

      const candidateEmail =
        createEmail("inactive-candidate");

      const recruiter = await createUser({
        email: recruiterEmail,
        role: "RECRUITER"
      });

      const candidate = await createUser({
        email: candidateEmail,
        role: "JOB_SEEKER",
        status: "SUSPENDED"
      });

      const company = await createCompany(
        recruiter.id
      );

      const job = await createJob({
        recruiterId: recruiter.id,
        companyId: company.id
      });

      const application = await createApplication({
        candidateId: candidate.id,
        job,
        company
      });

      const token = await login(recruiterEmail);

      const response = await request(app)
        .post(
          `/api/recruiter/interviews/applications/${application.id}`
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send(createScheduleBody())
        .expect(409);

      expect(response.body.code).toBe(
        "CANDIDATE_NOT_ACTIVE"
      );
    }
  );
});