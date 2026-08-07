import { sequelize } from "../config/database.js";
import AppError from "../utils/AppError.js";

import User from "../models/user.model.js";

import {
  APPLICATION_STATUSES
} from "../constants/application.constants.js";

import {
  ACCOUNT_STATUS
} from "../constants/app.constants.js";

import {
  INTERVIEW_STATUSES
} from "../constants/interview.constants.js";

import {
  validateSchedule
} from "../utils/interviewValidation.js";

import {
  assertInterviewTransition
} from "../utils/interviewStatusTransition.js";

import {
  getPagination,
  getPaginationMeta
} from "../utils/pagination.js";

import * as repo from "../repositories/interview.repository.js";

import * as applicationRepository from "../repositories/application.repository.js";

import {
  emitInterviewNotification
} from "./interviewNotification.service.js";

import {
  recordInterviewAudit
} from "./interviewAudit.service.js";

const scheduleSnapshot = interview => ({
  scheduledStartAt: interview.scheduledStartAt,
  scheduledEndAt: interview.scheduledEndAt,
  timezone: interview.timezone
});

const meetingSnapshot = interview => ({
  meetingType: interview.meetingType,
  meetingLink: interview.meetingLink,
  physicalLocation: interview.physicalLocation,
  phoneInstructions: interview.phoneInstructions,
  interviewInstructions: interview.interviewInstructions
});

const ensureRecruiterInterview = async (
  recruiterId,
  interviewId,
  options = {}
) => {
  const interview = await repo.findInterview(
    interviewId,
    options
  );

  if (!interview) {
    throw new AppError(
      "Interview not found.",
      404,
      "INTERVIEW_NOT_FOUND"
    );
  }

  if (interview.recruiterId !== recruiterId) {
    throw new AppError(
      "Interview ownership required.",
      403,
      "INTERVIEW_OWNERSHIP_REQUIRED"
    );
  }

  return interview;
};

const ensureCandidateInterview = async (
  candidateId,
  interviewId,
  options = {}
) => {
  const interview = await repo.findInterview(
    interviewId,
    options
  );

  if (!interview) {
    throw new AppError(
      "Interview not found.",
      404,
      "INTERVIEW_NOT_FOUND"
    );
  }

  if (interview.candidateId !== candidateId) {
    throw new AppError(
      "Interview ownership required.",
      403,
      "INTERVIEW_OWNERSHIP_REQUIRED"
    );
  }

  return interview;
};

const assertNoConflict = async (
  values,
  options = {}
) => {
  const conflict = await repo.findConflict(
    values,
    options
  );

  if (conflict) {
    throw new AppError(
      "Candidate or recruiter has an overlapping interview.",
      409,
      "INTERVIEW_SCHEDULE_CONFLICT"
    );
  }
};

const history = async ({
  interview,
  previousStatus = null,
  changedBy,
  reason = null,
  event,
  previousSchedule = null,
  previousMeetingInfo = null,
  transaction
}) =>
  repo.createHistory(
    {
      interviewId: interview.id,
      previousStatus,
      newStatus: interview.status,
      previousSchedule,
      newSchedule: scheduleSnapshot(interview),
      previousMeetingInfo,
      newMeetingInfo: meetingSnapshot(interview),
      changedBy,
      reason,
      event
    },
    {
      transaction
    }
  );

export const scheduleInterview = ({
  recruiterId,
  applicationId,
  body,
  req
}) =>
  sequelize.transaction(async transaction => {
    const application =
      await repo.findApplicationForRecruiter(
        applicationId,
        recruiterId,
        {
          transaction,
          lock: transaction.LOCK.UPDATE
        }
      );

    if (!application) {
      throw new AppError(
        "Application not found or not owned.",
        404,
        "APPLICATION_NOT_FOUND"
      );
    }

    const activeInterview =
      await repo.findActiveForApplication(
        application.id,
        {
          transaction
        }
      );

    if (activeInterview) {
      throw new AppError(
        "An active interview already exists.",
        409,
        "ACTIVE_INTERVIEW_EXISTS"
      );
    }

    if (
      application.status !==
      APPLICATION_STATUSES.SHORTLISTED
    ) {
      throw new AppError(
        "Only shortlisted applications are eligible.",
        409,
        "APPLICATION_NOT_SHORTLISTED"
      );
    }

    const candidate = await User.findByPk(
      application.candidateId,
      {
        transaction
      }
    );

    if (
      !candidate ||
      candidate.status !== ACCOUNT_STATUS.ACTIVE
    ) {
      throw new AppError(
        "Candidate account is not active.",
        409,
        "CANDIDATE_NOT_ACTIVE"
      );
    }

    const { start, end } =
      validateSchedule(body);

    await assertNoConflict(
      {
        candidateId: application.candidateId,
        recruiterId,
        start,
        end
      },
      {
        transaction
      }
    );

    const interview =
      await repo.createInterview(
        {
          ...body,
          scheduledStartAt: start,
          scheduledEndAt: end,
          applicationId: application.id,
          candidateId: application.candidateId,
          recruiterId,
          jobId: application.jobId,
          companyId: application.companyId,
          status: INTERVIEW_STATUSES.SCHEDULED
        },
        {
          transaction
        }
      );

    await history({
      interview,
      changedBy: recruiterId,
      event: "INTERVIEW_SCHEDULED",
      transaction
    });

    await application.update(
      {
        status:
          APPLICATION_STATUSES.INTERVIEW_SCHEDULED
      },
      {
        transaction
      }
    );

    await applicationRepository.createStatusHistory(
      {
        applicationId: application.id,
        previousStatus:
          APPLICATION_STATUSES.SHORTLISTED,
        newStatus:
          APPLICATION_STATUSES.INTERVIEW_SCHEDULED,
        changedBy: recruiterId,
        reason: "Interview scheduled"
      },
      {
        transaction
      }
    );

    await recordInterviewAudit({
      req,
      event: "INTERVIEW_SCHEDULED",
      interview,
      transaction
    });

    emitInterviewNotification({
      type: "INTERVIEW_SCHEDULED",
      interviewId: interview.id
    }).catch(() => { });

    return interview;
  });

export const listRecruiterInterviews = async ({
  recruiterId,
  query
}) => {
  const pagination = getPagination(query);

  const result = await repo.listRecruiter(
    recruiterId,
    {
      ...query,
      ...pagination,
      order: (query.order || "ASC").toUpperCase()
    }
  );

  return {
    items: result.rows,
    meta: getPaginationMeta(
      pagination.page,
      pagination.limit,
      result.count
    )
  };
};

export const listCandidateInterviews = async ({
  candidateId,
  query
}) => {
  const pagination = getPagination(query);

  const result = await repo.listCandidate(
    candidateId,
    {
      ...query,
      ...pagination,
      order: (query.order || "ASC").toUpperCase()
    }
  );

  return {
    items: result.rows,
    meta: getPaginationMeta(
      pagination.page,
      pagination.limit,
      result.count
    )
  };
};

export const recruiterDetails = async ({
  recruiterId,
  interviewId
}) => {
  const interview =
    await ensureRecruiterInterview(
      recruiterId,
      interviewId
    );

  return {
    ...interview.toJSON(),
    history: await repo.getHistory(
      interview.id
    )
  };
};

export const candidateDetails = async ({
  candidateId,
  interviewId
}) => {
  const interview =
    await ensureCandidateInterview(
      candidateId,
      interviewId
    );

  const visibleInterview =
    interview.toJSON();

  if (
    !visibleInterview.feedbackVisibleToCandidate
  ) {
    delete visibleInterview.feedback;
    delete visibleInterview.rating;
    delete visibleInterview.strengths;
    delete visibleInterview.concerns;
    delete visibleInterview.recommendation;
  }

  return {
    ...visibleInterview,
    history: await repo.getHistory(
      interview.id
    )
  };
};

export const rescheduleInterview = ({
  recruiterId,
  interviewId,
  body,
  req
}) =>
  sequelize.transaction(async transaction => {
    const interview =
      await ensureRecruiterInterview(
        recruiterId,
        interviewId,
        {
          transaction,
          lock: transaction.LOCK.UPDATE
        }
      );

    assertInterviewTransition(
      interview.status,
      INTERVIEW_STATUSES.RESCHEDULED
    );

    const oldStatus = interview.status;
    const oldSchedule =
      scheduleSnapshot(interview);
    const oldMeeting =
      meetingSnapshot(interview);

    const mergedInterview = {
      ...interview.toJSON(),
      ...body
    };

    const { start, end } =
      validateSchedule(mergedInterview);

    await assertNoConflict(
      {
        candidateId: interview.candidateId,
        recruiterId,
        start,
        end,
        excludeId: interview.id
      },
      {
        transaction
      }
    );

    await interview.update(
      {
        ...body,
        scheduledStartAt: start,
        scheduledEndAt: end,
        status:
          INTERVIEW_STATUSES.RESCHEDULED,
        confirmedAt: null,
        declinedAt: null,
        declineReason: null
      },
      {
        transaction
      }
    );

    await history({
      interview,
      previousStatus: oldStatus,
      changedBy: recruiterId,
      reason: body.reason,
      event: "INTERVIEW_RESCHEDULED",
      previousSchedule: oldSchedule,
      previousMeetingInfo: oldMeeting,
      transaction
    });

    await recordInterviewAudit({
      req,
      event: "INTERVIEW_RESCHEDULED",
      interview,
      transaction
    });

    emitInterviewNotification({
      type: "INTERVIEW_RESCHEDULED",
      interviewId: interview.id
    }).catch(() => { });

    return interview;
  });

export const cancelInterview = ({
  recruiterId,
  interviewId,
  reason,
  req
}) =>
  sequelize.transaction(async transaction => {
    const interview =
      await ensureRecruiterInterview(
        recruiterId,
        interviewId,
        {
          transaction,
          lock: transaction.LOCK.UPDATE
        }
      );

    assertInterviewTransition(
      interview.status,
      INTERVIEW_STATUSES.CANCELLED
    );

    const oldStatus = interview.status;

    await interview.update(
      {
        status:
          INTERVIEW_STATUSES.CANCELLED,
        cancellationReason: reason.trim(),
        cancelledAt: new Date()
      },
      {
        transaction
      }
    );

    await history({
      interview,
      previousStatus: oldStatus,
      changedBy: recruiterId,
      reason,
      event: "INTERVIEW_CANCELLED",
      transaction
    });

    await recordInterviewAudit({
      req,
      event: "INTERVIEW_CANCELLED",
      interview,
      transaction
    });

    emitInterviewNotification({
      type: "INTERVIEW_CANCELLED",
      interviewId: interview.id
    }).catch(() => { });

    return interview;
  });

export const confirmInterview = ({
  candidateId,
  interviewId,
  req
}) =>
  sequelize.transaction(async transaction => {
    const interview =
      await ensureCandidateInterview(
        candidateId,
        interviewId,
        {
          transaction,
          lock: transaction.LOCK.UPDATE
        }
      );

    if (
      new Date(interview.scheduledStartAt) <=
      new Date()
    ) {
      throw new AppError(
        "Interview has already started.",
        409,
        "INTERVIEW_ALREADY_STARTED"
      );
    }

    assertInterviewTransition(
      interview.status,
      INTERVIEW_STATUSES.CONFIRMED
    );

    const oldStatus = interview.status;

    await interview.update(
      {
        status:
          INTERVIEW_STATUSES.CONFIRMED,
        confirmedAt: new Date(),
        declinedAt: null,
        declineReason: null
      },
      {
        transaction
      }
    );

    await history({
      interview,
      previousStatus: oldStatus,
      changedBy: candidateId,
      event: "INTERVIEW_CONFIRMED",
      transaction
    });

    await recordInterviewAudit({
      req,
      event: "INTERVIEW_CONFIRMED",
      interview,
      transaction
    });

    return interview;
  });

export const declineInterview = ({
  candidateId,
  interviewId,
  reason,
  req
}) =>
  sequelize.transaction(async transaction => {
    const interview =
      await ensureCandidateInterview(
        candidateId,
        interviewId,
        {
          transaction,
          lock: transaction.LOCK.UPDATE
        }
      );

    if (
      new Date(interview.scheduledStartAt) <=
      new Date()
    ) {
      throw new AppError(
        "Interview has already started.",
        409,
        "INTERVIEW_ALREADY_STARTED"
      );
    }

    assertInterviewTransition(
      interview.status,
      INTERVIEW_STATUSES.DECLINED
    );

    const oldStatus = interview.status;

    await interview.update(
      {
        status:
          INTERVIEW_STATUSES.DECLINED,
        declineReason: reason.trim(),
        declinedAt: new Date()
      },
      {
        transaction
      }
    );

    await history({
      interview,
      previousStatus: oldStatus,
      changedBy: candidateId,
      reason,
      event: "INTERVIEW_DECLINED",
      transaction
    });

    await recordInterviewAudit({
      req,
      event: "INTERVIEW_DECLINED",
      interview,
      transaction
    });

    return interview;
  });

export const completeInterview = ({
  recruiterId,
  interviewId,
  req
}) =>
  sequelize.transaction(async transaction => {
    const interview =
      await ensureRecruiterInterview(
        recruiterId,
        interviewId,
        {
          transaction,
          lock: transaction.LOCK.UPDATE
        }
      );

    if (
      new Date(interview.scheduledStartAt) >
      new Date()
    ) {
      throw new AppError(
        "Interview cannot be completed before it starts.",
        409,
        "INTERVIEW_NOT_STARTED"
      );
    }

    assertInterviewTransition(
      interview.status,
      INTERVIEW_STATUSES.COMPLETED
    );

    const oldStatus = interview.status;

    await interview.update(
      {
        status:
          INTERVIEW_STATUSES.COMPLETED,
        completedAt: new Date()
      },
      {
        transaction
      }
    );

    await history({
      interview,
      previousStatus: oldStatus,
      changedBy: recruiterId,
      event: "INTERVIEW_COMPLETED",
      transaction
    });

    const application =
      await applicationRepository.findApplication(
        interview.applicationId,
        {
          transaction,
          lock: transaction.LOCK.UPDATE
        }
      );

    const previousStatus =
      application.status;

    await application.update(
      {
        status:
          APPLICATION_STATUSES.INTERVIEW_COMPLETED
      },
      {
        transaction
      }
    );

    await applicationRepository.createStatusHistory(
      {
        applicationId: application.id,
        previousStatus,
        newStatus:
          APPLICATION_STATUSES.INTERVIEW_COMPLETED,
        changedBy: recruiterId,
        reason: "Interview completed"
      },
      {
        transaction
      }
    );

    await recordInterviewAudit({
      req,
      event: "INTERVIEW_COMPLETED",
      interview,
      transaction
    });

    return interview;
  });

export const saveFeedback = ({
  recruiterId,
  interviewId,
  body,
  req
}) =>
  sequelize.transaction(async transaction => {
    const interview =
      await ensureRecruiterInterview(
        recruiterId,
        interviewId,
        {
          transaction,
          lock: transaction.LOCK.UPDATE
        }
      );

    if (
      interview.status !==
      INTERVIEW_STATUSES.COMPLETED
    ) {
      throw new AppError(
        "Feedback requires a completed interview.",
        409,
        "INTERVIEW_NOT_COMPLETED"
      );
    }

    await interview.update(
      {
        feedback:
          body.feedback?.trim() || null,
        rating: body.rating,
        strengths:
          body.strengths?.trim() || null,
        concerns:
          body.concerns?.trim() || null,
        recommendation:
          body.recommendation?.trim() || null,
        feedbackVisibleToCandidate: Boolean(
          body.feedbackVisibleToCandidate
        )
      },
      {
        transaction
      }
    );

    await history({
      interview,
      previousStatus: interview.status,
      changedBy: recruiterId,
      event: "INTERVIEW_FEEDBACK_UPDATED",
      transaction
    });

    await recordInterviewAudit({
      req,
      event: "INTERVIEW_FEEDBACK_UPDATED",
      interview,
      transaction
    });

    return interview;
  });

export const interviewHistory = async ({
  userId,
  role,
  interviewId
}) => {
  const interview =
    role === "RECRUITER"
      ? await ensureRecruiterInterview(
        userId,
        interviewId
      )
      : await ensureCandidateInterview(
        userId,
        interviewId
      );

  return repo.getHistory(interview.id);
};