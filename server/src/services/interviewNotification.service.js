import Interview from "../models/interview.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import { createNotification } from "./notification.service.js";
import { sendTemplateEmail } from "./email.service.js";
import { NOTIFICATION_RESOURCE_TYPES, NOTIFICATION_TYPES } from "../constants/notification.constants.js";

const supported = new Set([
  "INTERVIEW_SCHEDULED", "INTERVIEW_RESCHEDULED", "INTERVIEW_CANCELLED",
  "INTERVIEW_CONFIRMED", "INTERVIEW_DECLINED"
]);

export const emitInterviewNotification = async (payload) => {
  if (!supported.has(payload.type)) return { created: false, reason: "UNSUPPORTED_EVENT" };
  const interview = await Interview.findByPk(payload.interviewId, {
    include: [
      { model: Job, as: "job", attributes: ["id", "title"] },
      { model: User, as: "candidate", attributes: ["id", "email"] },
      { model: User, as: "recruiter", attributes: ["id", "email"] }
    ]
  });
  if (!interview) return { created: false, reason: "INTERVIEW_NOT_FOUND" };

  const candidateEvent = ["INTERVIEW_SCHEDULED", "INTERVIEW_RESCHEDULED", "INTERVIEW_CANCELLED"].includes(payload.type);
  const recipient = candidateEvent ? interview.candidate : interview.recruiter;
  if (!recipient) return { created: false, reason: "RECIPIENT_NOT_FOUND" };

  const title = payload.type.replaceAll("_", " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
  const result = await createNotification({
    recipientId: recipient.id,
    type: NOTIFICATION_TYPES[payload.type],
    title,
    message: `${title} for ${interview.job?.title || "the job"}.`,
    resourceType: NOTIFICATION_RESOURCE_TYPES.INTERVIEW,
    resourceId: interview.id,
    metadata: { jobId: interview.jobId, scheduledStartAt: interview.scheduledStartAt, timezone: interview.timezone },
    deduplicationKey: `${payload.type}:${recipient.id}:${interview.id}:${interview.updatedAt?.getTime?.() || interview.status}`
  });

  if (recipient.email) {
    await sendTemplateEmail({
      to: recipient.email,
      template: payload.type,
      data: {
        jobTitle: interview.job?.title,
        interviewTime: interview.scheduledStartAt?.toISOString?.(),
        timezone: interview.timezone,
        meetingType: interview.meetingType,
        meetingLink: interview.meetingLink,
        physicalLocation: interview.physicalLocation,
        phoneInstructions: interview.phoneInstructions
      },
      eventType: payload.type,
      resourceId: interview.id
    });
  }
  return result;
};
