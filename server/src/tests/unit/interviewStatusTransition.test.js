import { assertInterviewTransition } from "../../utils/interviewStatusTransition.js";
import {
  INTERVIEW_STATUSES,
  INTERVIEW_TRANSITIONS,
  ACTIVE_INTERVIEW_STATUSES
} from "../../constants/interview.constants.js";

describe("Interview status transitions", () => {
  test.each([
    ["SCHEDULED", "CONFIRMED"],
    ["SCHEDULED", "DECLINED"],
    ["SCHEDULED", "RESCHEDULED"],
    ["SCHEDULED", "CANCELLED"],

    ["RESCHEDULED", "CONFIRMED"],
    ["RESCHEDULED", "DECLINED"],
    ["RESCHEDULED", "RESCHEDULED"],
    ["RESCHEDULED", "CANCELLED"],

    ["CONFIRMED", "RESCHEDULED"],
    ["CONFIRMED", "CANCELLED"],
    ["CONFIRMED", "COMPLETED"],

    ["DECLINED", "RESCHEDULED"],
    ["DECLINED", "CANCELLED"]
  ])("allows %s to %s", (from, to) => {
    expect(() => assertInterviewTransition(from, to)).not.toThrow();
  });

  test.each([
    ["SCHEDULED", "COMPLETED"],
    ["SCHEDULED", "SCHEDULED"],

    ["RESCHEDULED", "COMPLETED"],

    ["CONFIRMED", "DECLINED"],
    ["CONFIRMED", "CONFIRMED"],

    ["DECLINED", "CONFIRMED"],
    ["DECLINED", "COMPLETED"],

    ["CANCELLED", "SCHEDULED"],
    ["CANCELLED", "RESCHEDULED"],
    ["CANCELLED", "CONFIRMED"],
    ["CANCELLED", "COMPLETED"],

    ["COMPLETED", "SCHEDULED"],
    ["COMPLETED", "RESCHEDULED"],
    ["COMPLETED", "CANCELLED"],

    ["UNKNOWN", "SCHEDULED"]
  ])("rejects %s to %s", (from, to) => {
    expect(() => assertInterviewTransition(from, to)).toThrow(
      "Invalid interview status transition."
    );

    try {
      assertInterviewTransition(from, to);
    } catch (error) {
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe(
        "INVALID_INTERVIEW_STATUS_TRANSITION"
      );
    }
  });

  test("treats COMPLETED as a terminal status", () => {
    expect(INTERVIEW_TRANSITIONS.COMPLETED).toEqual([]);
  });

  test("treats CANCELLED as a terminal status", () => {
    expect(INTERVIEW_TRANSITIONS.CANCELLED).toEqual([]);
  });

  test("contains the correct active interview statuses", () => {
    expect(ACTIVE_INTERVIEW_STATUSES).toEqual([
      INTERVIEW_STATUSES.SCHEDULED,
      INTERVIEW_STATUSES.RESCHEDULED,
      INTERVIEW_STATUSES.CONFIRMED
    ]);
  });

  test("does not treat declined interview as active", () => {
    expect(ACTIVE_INTERVIEW_STATUSES).not.toContain(
      INTERVIEW_STATUSES.DECLINED
    );
  });

  test("does not treat cancelled interview as active", () => {
    expect(ACTIVE_INTERVIEW_STATUSES).not.toContain(
      INTERVIEW_STATUSES.CANCELLED
    );
  });

  test("does not treat completed interview as active", () => {
    expect(ACTIVE_INTERVIEW_STATUSES).not.toContain(
      INTERVIEW_STATUSES.COMPLETED
    );
  });
});