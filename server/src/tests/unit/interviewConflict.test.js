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
const findInterviewMock = jest.fn();

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
    findInterview: findInterviewMock,
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

const {
  scheduleInterview,
  rescheduleInterview
} = await import("../../services/interview.service.js");

const createTimes = ({
  startAfterMinutes = 60,
  durationMinutes = 30
} = {}) => {
  const start = new Date(
    Date.now() + startAfterMinutes * 60 * 1000
  );
  const end = new Date(
    start.getTime() + durationMinutes * 60 * 1000
  );

  return {
    start,
    end
  };
};

const createBody = () => {
  const { start, end } = createTimes();

  return {
    scheduledStartAt: start.toISOString(),
    scheduledEndAt: end.toISOString(),
    timezone: "Asia/Kolkata",
    meetingType: "ONLINE",
    meetingLink: "https://meet.example.com/interview"
  };
};

const createApplication = () => ({
  id: "application-1",
  candidateId: "candidate-1",
  jobId: "job-1",
  companyId: "company-1",
  status: "SHORTLISTED",
  update: jest.fn().mockResolvedValue(undefined)
});

const createInterview = ({
  id = "interview-1",
  status = "SCHEDULED"
} = {}) => {
  const { start, end } = createTimes();

  const interview = {
    id,
    applicationId: "application-1",
    candidateId: "candidate-1",
    recruiterId: "recruiter-1",
    jobId: "job-1",
    companyId: "company-1",
    scheduledStartAt: start,
    scheduledEndAt: end,
    timezone: "Asia/Kolkata",
    meetingType: "ONLINE",
    meetingLink: "https://meet.example.com/interview",
    physicalLocation: null,
    phoneInstructions: null,
    interviewInstructions: null,
    status,
    confirmedAt: null,
    declinedAt: null,
    declineReason: null,
    update: jest.fn(async values => {
      Object.assign(interview, values);
      return interview;
    }),
    toJSON: jest.fn(() => ({
      id: interview.id,
      applicationId: interview.applicationId,
      candidateId: interview.candidateId,
      recruiterId: interview.recruiterId,
      jobId: interview.jobId,
      companyId: interview.companyId,
      scheduledStartAt: interview.scheduledStartAt,
      scheduledEndAt: interview.scheduledEndAt,
      timezone: interview.timezone,
      meetingType: interview.meetingType,
      meetingLink: interview.meetingLink,
      physicalLocation: interview.physicalLocation,
      phoneInstructions: interview.phoneInstructions,
      interviewInstructions: interview.interviewInstructions,
      status: interview.status
    }))
  };

  return interview;
};

describe("Interview scheduling conflict prevention", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    sequelizeTransactionMock.mockImplementation(async callback =>
      callback(transactionMock)
    );

    userFindByPkMock.mockResolvedValue({
      id: "candidate-1",
      status: "ACTIVE"
    });

    findApplicationForRecruiterMock.mockResolvedValue(
      createApplication()
    );

    findActiveForApplicationMock.mockResolvedValue(null);
    createHistoryMock.mockResolvedValue(undefined);
    createStatusHistoryMock.mockResolvedValue(undefined);
    notificationMock.mockResolvedValue(undefined);
    auditMock.mockResolvedValue(undefined);
  });

  test("allows scheduling when no conflict exists", async () => {
    const interview = createInterview();

    findConflictMock.mockResolvedValue(null);
    createInterviewMock.mockResolvedValue(interview);

    await expect(
      scheduleInterview({
        recruiterId: "recruiter-1",
        applicationId: "application-1",
        body: createBody(),
        req: {}
      })
    ).resolves.toBe(interview);

    expect(findConflictMock).toHaveBeenCalledWith(
      expect.objectContaining({
        candidateId: "candidate-1",
        recruiterId: "recruiter-1",
        start: expect.any(Date),
        end: expect.any(Date)
      }),
      {
        transaction: transactionMock
      }
    );

    expect(createInterviewMock).toHaveBeenCalledTimes(1);
  });

  test("rejects candidate scheduling conflict", async () => {
    findConflictMock.mockResolvedValue({
      id: "candidate-conflict-interview",
      candidateId: "candidate-1",
      recruiterId: "another-recruiter"
    });

    await expect(
      scheduleInterview({
        recruiterId: "recruiter-1",
        applicationId: "application-1",
        body: createBody(),
        req: {}
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "INTERVIEW_SCHEDULE_CONFLICT"
    });

    expect(createInterviewMock).not.toHaveBeenCalled();
  });

  test("rejects recruiter scheduling conflict", async () => {
    findConflictMock.mockResolvedValue({
      id: "recruiter-conflict-interview",
      candidateId: "another-candidate",
      recruiterId: "recruiter-1"
    });

    await expect(
      scheduleInterview({
        recruiterId: "recruiter-1",
        applicationId: "application-1",
        body: createBody(),
        req: {}
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "INTERVIEW_SCHEDULE_CONFLICT",
      message:
        "Candidate or recruiter has an overlapping interview."
    });

    expect(createInterviewMock).not.toHaveBeenCalled();
  });

  test("does not check time overlap when duplicate active interview exists", async () => {
    findActiveForApplicationMock.mockResolvedValue({
      id: "existing-active-interview"
    });

    await expect(
      scheduleInterview({
        recruiterId: "recruiter-1",
        applicationId: "application-1",
        body: createBody(),
        req: {}
      })
    ).rejects.toMatchObject({
      code: "ACTIVE_INTERVIEW_EXISTS"
    });

    expect(findConflictMock).not.toHaveBeenCalled();
    expect(createInterviewMock).not.toHaveBeenCalled();
  });

  test("allows rescheduling when no conflict exists", async () => {
    const interview = createInterview({
      status: "SCHEDULED"
    });

    findInterviewMock.mockResolvedValue(interview);
    findConflictMock.mockResolvedValue(null);

    const body = createBody();
    body.reason = "Recruiter availability changed.";

    await expect(
      rescheduleInterview({
        recruiterId: "recruiter-1",
        interviewId: "interview-1",
        body,
        req: {}
      })
    ).resolves.toBe(interview);

    expect(findConflictMock).toHaveBeenCalledWith(
      expect.objectContaining({
        candidateId: "candidate-1",
        recruiterId: "recruiter-1",
        excludeId: "interview-1",
        start: expect.any(Date),
        end: expect.any(Date)
      }),
      {
        transaction: transactionMock
      }
    );

    expect(interview.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "RESCHEDULED",
        scheduledStartAt: expect.any(Date),
        scheduledEndAt: expect.any(Date),
        confirmedAt: null,
        declinedAt: null,
        declineReason: null
      }),
      {
        transaction: transactionMock
      }
    );
  });

  test("rejects conflict during rescheduling", async () => {
    const interview = createInterview({
      status: "CONFIRMED"
    });

    findInterviewMock.mockResolvedValue(interview);
    findConflictMock.mockResolvedValue({
      id: "another-interview"
    });

    const body = createBody();
    body.reason = "Schedule changed.";

    await expect(
      rescheduleInterview({
        recruiterId: "recruiter-1",
        interviewId: "interview-1",
        body,
        req: {}
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "INTERVIEW_SCHEDULE_CONFLICT"
    });

    expect(interview.update).not.toHaveBeenCalled();
  });

  test("excludes the current interview while checking reschedule conflict", async () => {
    const interview = createInterview({
      status: "RESCHEDULED"
    });

    findInterviewMock.mockResolvedValue(interview);
    findConflictMock.mockResolvedValue(null);

    const body = createBody();
    body.reason = "Candidate requested another time.";

    await rescheduleInterview({
      recruiterId: "recruiter-1",
      interviewId: "interview-1",
      body,
      req: {}
    });

    expect(findConflictMock).toHaveBeenCalledWith(
      expect.objectContaining({
        excludeId: interview.id
      }),
      expect.any(Object)
    );
  });

  test("rejects rescheduling interview owned by another recruiter", async () => {
    const interview = createInterview();
    interview.recruiterId = "different-recruiter";

    findInterviewMock.mockResolvedValue(interview);

    await expect(
      rescheduleInterview({
        recruiterId: "recruiter-1",
        interviewId: "interview-1",
        body: {
          ...createBody(),
          reason: "Time change"
        },
        req: {}
      })
    ).rejects.toMatchObject({
      statusCode: 403,
      code: "INTERVIEW_OWNERSHIP_REQUIRED"
    });

    expect(findConflictMock).not.toHaveBeenCalled();
    expect(interview.update).not.toHaveBeenCalled();
  });
});