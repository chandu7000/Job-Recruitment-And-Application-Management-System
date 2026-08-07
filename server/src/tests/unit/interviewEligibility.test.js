import { jest } from "@jest/globals";

const transactionMock = {
  LOCK: {
    UPDATE: "UPDATE"
  }
};

const sequelizeTransactionMock = jest.fn();

const findApplicationForRecruiterMock = jest.fn();
const findActiveForApplicationMock = jest.fn();
const findConflictMock = jest.fn();
const createInterviewMock = jest.fn();
const createHistoryMock = jest.fn();

const userFindByPkMock = jest.fn();

const createStatusHistoryMock = jest.fn();

const notificationMock = jest.fn();
const auditMock = jest.fn();

jest.unstable_mockModule("../../config/database.js", () => ({
  sequelize: {
    transaction: sequelizeTransactionMock
  }
}));

jest.unstable_mockModule("../../models/user.model.js", () => ({
  default: {
    findByPk: userFindByPkMock
  }
}));

jest.unstable_mockModule(
  "../../repositories/interview.repository.js",
  () => ({
    findApplicationForRecruiter: findApplicationForRecruiterMock,
    findActiveForApplication: findActiveForApplicationMock,
    findConflict: findConflictMock,
    createInterview: createInterviewMock,
    createHistory: createHistoryMock,
    findInterview: jest.fn(),
    listRecruiter: jest.fn(),
    listCandidate: jest.fn(),
    getHistory: jest.fn()
  })
);

jest.unstable_mockModule(
  "../../repositories/application.repository.js",
  () => ({
    createStatusHistory: createStatusHistoryMock,
    findApplication: jest.fn()
  })
);

jest.unstable_mockModule(
  "../../services/interviewNotification.service.js",
  () => ({
    emitInterviewNotification: notificationMock
  })
);

jest.unstable_mockModule(
  "../../services/interviewAudit.service.js",
  () => ({
    recordInterviewAudit: auditMock
  })
);

const { scheduleInterview } = await import(
  "../../services/interview.service.js"
);

const createValidBody = () => {
  const start = new Date(Date.now() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  return {
    scheduledStartAt: start.toISOString(),
    scheduledEndAt: end.toISOString(),
    timezone: "Asia/Kolkata",
    meetingType: "ONLINE",
    meetingLink: "https://meet.example.com/interview",
    interviewInstructions: "Join five minutes early."
  };
};

const createApplication = ({
  status = "SHORTLISTED",
  candidateId = "candidate-1"
} = {}) => ({
  id: "application-1",
  candidateId,
  jobId: "job-1",
  companyId: "company-1",
  status,
  update: jest.fn().mockResolvedValue(undefined)
});

const createCandidate = ({ status = "ACTIVE" } = {}) => ({
  id: "candidate-1",
  status
});

const createInterview = () => ({
  id: "interview-1",
  applicationId: "application-1",
  candidateId: "candidate-1",
  recruiterId: "recruiter-1",
  jobId: "job-1",
  companyId: "company-1",
  scheduledStartAt: new Date(Date.now() + 60 * 60 * 1000),
  scheduledEndAt: new Date(Date.now() + 90 * 60 * 1000),
  timezone: "Asia/Kolkata",
  meetingType: "ONLINE",
  meetingLink: "https://meet.example.com/interview",
  physicalLocation: null,
  phoneInstructions: null,
  interviewInstructions: "Join five minutes early.",
  status: "SCHEDULED"
});

describe("Interview scheduling eligibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    sequelizeTransactionMock.mockImplementation(async callback =>
      callback(transactionMock)
    );

    notificationMock.mockResolvedValue(undefined);
    auditMock.mockResolvedValue(undefined);
    createStatusHistoryMock.mockResolvedValue(undefined);
    createHistoryMock.mockResolvedValue(undefined);
  });

  test("allows an active candidate with a shortlisted application", async () => {
    const application = createApplication();
    const candidate = createCandidate();
    const interview = createInterview();

    findApplicationForRecruiterMock.mockResolvedValue(application);
    userFindByPkMock.mockResolvedValue(candidate);
    findActiveForApplicationMock.mockResolvedValue(null);
    findConflictMock.mockResolvedValue(null);
    createInterviewMock.mockResolvedValue(interview);

    const result = await scheduleInterview({
      recruiterId: "recruiter-1",
      applicationId: "application-1",
      body: createValidBody(),
      req: {}
    });

    expect(result).toBe(interview);

    expect(findApplicationForRecruiterMock).toHaveBeenCalledWith(
      "application-1",
      "recruiter-1",
      expect.objectContaining({
        transaction: transactionMock,
        lock: transactionMock.LOCK.UPDATE
      })
    );

    expect(userFindByPkMock).toHaveBeenCalledWith(
      "candidate-1",
      expect.objectContaining({
        transaction: transactionMock
      })
    );

    expect(application.update).toHaveBeenCalledWith(
      {
        status: "INTERVIEW_SCHEDULED"
      },
      {
        transaction: transactionMock
      }
    );

    expect(createStatusHistoryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: "application-1",
        previousStatus: "SHORTLISTED",
        newStatus: "INTERVIEW_SCHEDULED",
        changedBy: "recruiter-1"
      }),
      {
        transaction: transactionMock
      }
    );
  });

  test("rejects when application does not exist or is not owned", async () => {
    findApplicationForRecruiterMock.mockResolvedValue(null);

    await expect(
      scheduleInterview({
        recruiterId: "recruiter-1",
        applicationId: "missing-application",
        body: createValidBody(),
        req: {}
      })
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "APPLICATION_NOT_FOUND"
    });

    expect(userFindByPkMock).not.toHaveBeenCalled();
    expect(createInterviewMock).not.toHaveBeenCalled();
  });

  test("rejects an application that is not shortlisted", async () => {
    const application = createApplication({
      status: "UNDER_REVIEW"
    });

    findApplicationForRecruiterMock.mockResolvedValue(application);

    await expect(
      scheduleInterview({
        recruiterId: "recruiter-1",
        applicationId: "application-1",
        body: createValidBody(),
        req: {}
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "APPLICATION_NOT_SHORTLISTED"
    });

    expect(userFindByPkMock).not.toHaveBeenCalled();
    expect(createInterviewMock).not.toHaveBeenCalled();
  });

  test.each([
    "APPLIED",
    "UNDER_REVIEW",
    "INTERVIEW_SCHEDULED",
    "INTERVIEW_COMPLETED",
    "REJECTED",
    "WITHDRAWN",
    "HIRED"
  ])("rejects application status %s", async status => {
    findApplicationForRecruiterMock.mockResolvedValue(
      createApplication({ status })
    );

    await expect(
      scheduleInterview({
        recruiterId: "recruiter-1",
        applicationId: "application-1",
        body: createValidBody(),
        req: {}
      })
    ).rejects.toMatchObject({
      code: "APPLICATION_NOT_SHORTLISTED"
    });
  });

  test("rejects when candidate does not exist", async () => {
    findApplicationForRecruiterMock.mockResolvedValue(
      createApplication()
    );

    findActiveForApplicationMock.mockResolvedValue(null);

    userFindByPkMock.mockResolvedValue(null);

    await expect(
      scheduleInterview({
        recruiterId: "recruiter-1",
        applicationId: "application-1",
        body: createValidBody(),
        req: {}
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "CANDIDATE_NOT_ACTIVE"
    });

    expect(findActiveForApplicationMock).toHaveBeenCalledWith(
      "application-1",
      {
        transaction: transactionMock
      }
    );

    expect(userFindByPkMock).toHaveBeenCalledWith(
      "candidate-1",
      {
        transaction: transactionMock
      }
    );

    expect(createInterviewMock).not.toHaveBeenCalled();
  });

  test.each(["INACTIVE", "SUSPENDED", "BLOCKED", "PENDING"])(
    "rejects candidate account status %s",
    async status => {
      findApplicationForRecruiterMock.mockResolvedValue(
        createApplication()
      );
      userFindByPkMock.mockResolvedValue(
        createCandidate({ status })
      );

      await expect(
        scheduleInterview({
          recruiterId: "recruiter-1",
          applicationId: "application-1",
          body: createValidBody(),
          req: {}
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        code: "CANDIDATE_NOT_ACTIVE"
      });

      expect(createInterviewMock).not.toHaveBeenCalled();
    }
  );

  test("rejects duplicate active interview for the same application", async () => {
    findApplicationForRecruiterMock.mockResolvedValue(
      createApplication()
    );
    userFindByPkMock.mockResolvedValue(createCandidate());
    findActiveForApplicationMock.mockResolvedValue({
      id: "existing-interview"
    });

    await expect(
      scheduleInterview({
        recruiterId: "recruiter-1",
        applicationId: "application-1",
        body: createValidBody(),
        req: {}
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "ACTIVE_INTERVIEW_EXISTS"
    });

    expect(findConflictMock).not.toHaveBeenCalled();
    expect(createInterviewMock).not.toHaveBeenCalled();
  });

  test("creates interview only after all eligibility checks pass", async () => {
    const application = createApplication();
    const interview = createInterview();

    findApplicationForRecruiterMock.mockResolvedValue(application);
    userFindByPkMock.mockResolvedValue(createCandidate());
    findActiveForApplicationMock.mockResolvedValue(null);
    findConflictMock.mockResolvedValue(null);
    createInterviewMock.mockResolvedValue(interview);

    await scheduleInterview({
      recruiterId: "recruiter-1",
      applicationId: "application-1",
      body: createValidBody(),
      req: {}
    });

    expect(createInterviewMock).toHaveBeenCalledTimes(1);
    expect(createInterviewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: "application-1",
        candidateId: "candidate-1",
        recruiterId: "recruiter-1",
        jobId: "job-1",
        companyId: "company-1",
        status: "SCHEDULED"
      }),
      {
        transaction: transactionMock
      }
    );
  });
});