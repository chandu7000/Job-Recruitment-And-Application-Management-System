import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import Company from "../models/company.model.js";
import User from "../models/user.model.js";
import { createNotification } from "./notification.service.js";
import { sendTemplateEmail } from "./email.service.js";
import {
  NOTIFICATION_RESOURCE_TYPES,
  NOTIFICATION_TYPES
} from "../constants/notification.constants.js";

const titleFor = (type) => ({
  APPLICATION_WITHDRAWN: "Application withdrawn",
  APPLICATION_STATUS_CHANGED: "Application status updated"
}[type] || "Application update");

const messageFor = (type, status, jobTitle) => {
  if (type === "APPLICATION_WITHDRAWN") return `An application for ${jobTitle} was withdrawn.`;
  return `Your application for ${jobTitle} is now ${status || "updated"}.`;
};

export const emitApplicationNotification = async (payload) => {
  const application = await Application.findByPk(payload.applicationId, {
    include: [
      { model: Job, as: "job", attributes: ["id", "title", "createdBy"] },
      { model: Company, as: "company", attributes: ["id", "companyName", "ownerId"] },
      { model: User, as: "candidate", attributes: ["id", "email"] }
    ]
  });
  if (!application) return { created: false, reason: "APPLICATION_NOT_FOUND" };

  const isWithdrawn = payload.type === "APPLICATION_WITHDRAWN";
  const recipientId = isWithdrawn
    ? (application.job?.createdBy || application.company?.ownerId)
    : application.candidateId;
  if (!recipientId) return { created: false, reason: "RECIPIENT_NOT_FOUND" };

  const mappedType = isWithdrawn
    ? NOTIFICATION_TYPES.APPLICATION_WITHDRAWN
    : payload.status === "SHORTLISTED"
      ? NOTIFICATION_TYPES.CANDIDATE_SHORTLISTED
      : payload.status === "SELECTED"
        ? NOTIFICATION_TYPES.CANDIDATE_SELECTED
        : payload.status === "REJECTED"
          ? NOTIFICATION_TYPES.CANDIDATE_REJECTED
          : NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED;

  const result = await createNotification({
    recipientId,
    type: mappedType,
    title: titleFor(payload.type),
    message: messageFor(payload.type, payload.status, application.job?.title || "the job"),
    resourceType: NOTIFICATION_RESOURCE_TYPES.APPLICATION,
    resourceId: application.id,
    metadata: { status: payload.status || application.status, jobId: application.jobId },
    deduplicationKey: `${mappedType}:${recipientId}:${application.id}:${payload.status || application.status}`
  });

  if (!isWithdrawn && application.candidate?.email) {
    const template = mappedType === NOTIFICATION_TYPES.CANDIDATE_SHORTLISTED
      ? "CANDIDATE_SHORTLISTED"
      : mappedType === NOTIFICATION_TYPES.CANDIDATE_SELECTED
        ? "CANDIDATE_SELECTED"
        : mappedType === NOTIFICATION_TYPES.CANDIDATE_REJECTED
          ? "CANDIDATE_REJECTED"
          : "APPLICATION_STATUS_CHANGED";
    await sendTemplateEmail({
      to: application.candidate.email,
      template,
      data: { jobTitle: application.job?.title, status: payload.status },
      eventType: mappedType,
      resourceId: application.id
    });
  }

  return result;
};
