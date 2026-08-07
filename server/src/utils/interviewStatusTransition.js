import AppError from "./AppError.js";
import { INTERVIEW_TRANSITIONS } from "../constants/interview.constants.js";
export const assertInterviewTransition = (from, to) => {
  if (!INTERVIEW_TRANSITIONS[from]?.includes(to)) {
    throw new AppError("Invalid interview status transition.", 409, "INVALID_INTERVIEW_STATUS_TRANSITION");
  }
};
