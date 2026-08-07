import AppError from "./AppError.js";
import { MEETING_TYPES } from "../constants/interview.constants.js";

const MIN_DURATION_MS = 15 * 60 * 1000;
const MAX_DURATION_MS = 8 * 60 * 60 * 1000;

export const validateSchedule = (
  {
    scheduledStartAt,
    scheduledEndAt,
    timezone,
    meetingType,
    meetingLink,
    physicalLocation,
    phoneInstructions
  },
  { allowStarted = false } = {}
) => {
  const start = new Date(scheduledStartAt);
  const end = new Date(scheduledEndAt);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new AppError(
      "Invalid interview timestamp.",
      422,
      "INVALID_INTERVIEW_TIMESTAMP"
    );
  }

  if (!allowStarted && start <= new Date()) {
    throw new AppError(
      "Interview must be scheduled in the future.",
      422,
      "INTERVIEW_MUST_BE_FUTURE"
    );
  }

  const duration = end.getTime() - start.getTime();

  if (
    duration < MIN_DURATION_MS ||
    duration > MAX_DURATION_MS
  ) {
    throw new AppError(
      "Interview duration must be between 15 minutes and 8 hours.",
      422,
      "INVALID_INTERVIEW_DURATION"
    );
  }

  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone
    }).format();
  } catch {
    throw new AppError(
      "Invalid IANA timezone.",
      422,
      "INVALID_TIMEZONE"
    );
  }

  if (meetingType === MEETING_TYPES.ONLINE) {
    if (
      typeof meetingLink !== "string" ||
      meetingLink.trim().length === 0
    ) {
      throw new AppError(
        "A valid HTTPS meeting link is required.",
        422,
        "INVALID_MEETING_LINK"
      );
    }

    try {
      const url = new URL(meetingLink.trim());

      if (url.protocol !== "https:") {
        throw new Error("HTTPS meeting link required.");
      }
    } catch {
      throw new AppError(
        "A valid HTTPS meeting link is required.",
        422,
        "INVALID_MEETING_LINK"
      );
    }
  }

  if (
    meetingType === MEETING_TYPES.IN_PERSON &&
    (
      typeof physicalLocation !== "string" ||
      physicalLocation.trim().length === 0
    )
  ) {
    throw new AppError(
      "Physical location is required.",
      422,
      "PHYSICAL_LOCATION_REQUIRED"
    );
  }

  if (
    meetingType === MEETING_TYPES.PHONE &&
    (
      typeof phoneInstructions !== "string" ||
      phoneInstructions.trim().length === 0
    )
  ) {
    throw new AppError(
      "Phone instructions are required.",
      422,
      "PHONE_INSTRUCTIONS_REQUIRED"
    );
  }

  return {
    start,
    end
  };
};