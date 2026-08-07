import {
  JOB_STATUSES,
  JOB_STATUS_VALUES
} from "../../constants/job.constants.js";

import {
  isValidJobStatus,
  validateJobStatus,
  getAllowedJobTransitions,
  canTransitionJobStatus,
  validateJobStatusTransition,
  isTerminalJobStatus
} from "../../utils/jobStatusTransition.js";

describe(
  "Job status transition utility",
  () => {
    describe(
      "job status constants",
      () => {
        test(
          "contains only the approved job statuses",
          () => {
            expect(
              JOB_STATUS_VALUES
            ).toEqual([
              JOB_STATUSES.DRAFT,
              JOB_STATUSES.PUBLISHED,
              JOB_STATUSES.CLOSED,
              JOB_STATUSES.REMOVED
            ]);
          }
        );

        test(
          "does not contain the legacy OPEN status",
          () => {
            expect(
              JOB_STATUS_VALUES
            ).not.toContain("OPEN");
          }
        );

        test(
          "does not contain the legacy EXPIRED status",
          () => {
            expect(
              JOB_STATUS_VALUES
            ).not.toContain("EXPIRED");
          }
        );
      }
    );

    describe(
      "isValidJobStatus",
      () => {
        test.each([
          JOB_STATUSES.DRAFT,
          JOB_STATUSES.PUBLISHED,
          JOB_STATUSES.CLOSED,
          JOB_STATUSES.REMOVED
        ])(
          "accepts approved status %s",
          (status) => {
            expect(
              isValidJobStatus(status)
            ).toBe(true);
          }
        );

        test.each([
          "OPEN",
          "EXPIRED",
          "INVALID",
          "",
          null,
          undefined,
          123
        ])(
          "rejects invalid status %p",
          (status) => {
            expect(
              isValidJobStatus(status)
            ).toBe(false);
          }
        );
      }
    );

    describe(
      "validateJobStatus",
      () => {
        test(
          "returns true for a valid status",
          () => {
            expect(
              validateJobStatus(
                JOB_STATUSES.DRAFT
              )
            ).toBe(true);
          }
        );

        test(
          "throws a clear error for an invalid status",
          () => {
            expect(() =>
              validateJobStatus(
                "OPEN"
              )
            ).toThrow(
              expect.objectContaining({
                statusCode: 400,
                code:
                  "INVALID_JOB_STATUS"
              })
            );
          }
        );

        test(
          "includes the invalid field in error details",
          () => {
            try {
              validateJobStatus(
                "INVALID",
                "nextStatus"
              );
            } catch (error) {
              expect(
                error.errors
              ).toEqual([
                expect.objectContaining({
                  field: "nextStatus",
                  value: "INVALID",
                  allowedValues:
                    JOB_STATUS_VALUES
                })
              ]);
            }
          }
        );
      }
    );

    describe(
      "recruiter lifecycle transitions",
      () => {
        test(
          "allows DRAFT to PUBLISHED",
          () => {
            expect(
              canTransitionJobStatus(
                JOB_STATUSES.DRAFT,
                JOB_STATUSES.PUBLISHED
              )
            ).toBe(true);
          }
        );

        test(
          "allows PUBLISHED to CLOSED",
          () => {
            expect(
              canTransitionJobStatus(
                JOB_STATUSES.PUBLISHED,
                JOB_STATUSES.CLOSED
              )
            ).toBe(true);
          }
        );

        test(
          "does not allow DRAFT to CLOSED",
          () => {
            expect(
              canTransitionJobStatus(
                JOB_STATUSES.DRAFT,
                JOB_STATUSES.CLOSED
              )
            ).toBe(false);
          }
        );

        test(
          "does not allow PUBLISHED to DRAFT",
          () => {
            expect(
              canTransitionJobStatus(
                JOB_STATUSES.PUBLISHED,
                JOB_STATUSES.DRAFT
              )
            ).toBe(false);
          }
        );

        test(
          "does not allow CLOSED to PUBLISHED",
          () => {
            expect(
              canTransitionJobStatus(
                JOB_STATUSES.CLOSED,
                JOB_STATUSES.PUBLISHED
              )
            ).toBe(false);
          }
        );

        test(
          "does not allow a same-status transition",
          () => {
            expect(
              canTransitionJobStatus(
                JOB_STATUSES.DRAFT,
                JOB_STATUSES.DRAFT
              )
            ).toBe(false);
          }
        );

        test(
          "does not allow recruiter removal",
          () => {
            expect(
              canTransitionJobStatus(
                JOB_STATUSES.PUBLISHED,
                JOB_STATUSES.REMOVED
              )
            ).toBe(false);
          }
        );

        test(
          "does not allow transitions from REMOVED",
          () => {
            expect(
              getAllowedJobTransitions(
                JOB_STATUSES.REMOVED
              )
            ).toEqual([]);
          }
        );
      }
    );

    describe(
      "moderation lifecycle transitions",
      () => {
        test.each([
          JOB_STATUSES.DRAFT,
          JOB_STATUSES.PUBLISHED,
          JOB_STATUSES.CLOSED
        ])(
          "allows moderation to transition %s to REMOVED",
          (currentStatus) => {
            expect(
              canTransitionJobStatus(
                currentStatus,
                JOB_STATUSES.REMOVED,
                {
                  allowModeration:
                    true
                }
              )
            ).toBe(true);
          }
        );

        test(
          "does not allow moderation to restore a REMOVED job",
          () => {
            expect(
              canTransitionJobStatus(
                JOB_STATUSES.REMOVED,
                JOB_STATUSES.DRAFT,
                {
                  allowModeration:
                    true
                }
              )
            ).toBe(false);
          }
        );
      }
    );

    describe(
      "validateJobStatusTransition",
      () => {
        test(
          "returns true for a valid recruiter transition",
          () => {
            expect(
              validateJobStatusTransition(
                JOB_STATUSES.DRAFT,
                JOB_STATUSES.PUBLISHED
              )
            ).toBe(true);
          }
        );

        test(
          "throws for an invalid transition",
          () => {
            expect(() =>
              validateJobStatusTransition(
                JOB_STATUSES.DRAFT,
                JOB_STATUSES.CLOSED
              )
            ).toThrow(
              expect.objectContaining({
                statusCode: 409,
                code:
                  "INVALID_JOB_STATUS_TRANSITION"
              })
            );
          }
        );

        test(
          "includes allowed transitions in error details",
          () => {
            try {
              validateJobStatusTransition(
                JOB_STATUSES.DRAFT,
                JOB_STATUSES.CLOSED
              );
            } catch (error) {
              expect(
                error.errors
              ).toEqual([
                {
                  currentStatus:
                    JOB_STATUSES.DRAFT,

                  requestedStatus:
                    JOB_STATUSES.CLOSED,

                  allowedTransitions: [
                    JOB_STATUSES.PUBLISHED
                  ]
                }
              ]);
            }
          }
        );

        test(
          "throws INVALID_JOB_STATUS for an invalid current status",
          () => {
            expect(() =>
              validateJobStatusTransition(
                "OPEN",
                JOB_STATUSES.CLOSED
              )
            ).toThrow(
              expect.objectContaining({
                statusCode: 400,
                code:
                  "INVALID_JOB_STATUS"
              })
            );
          }
        );

        test(
          "throws INVALID_JOB_STATUS for an invalid next status",
          () => {
            expect(() =>
              validateJobStatusTransition(
                JOB_STATUSES.DRAFT,
                "EXPIRED"
              )
            ).toThrow(
              expect.objectContaining({
                statusCode: 400,
                code:
                  "INVALID_JOB_STATUS"
              })
            );
          }
        );
      }
    );

    describe(
      "terminal job status detection",
      () => {
        test(
          "identifies CLOSED as terminal",
          () => {
            expect(
              isTerminalJobStatus(
                JOB_STATUSES.CLOSED
              )
            ).toBe(true);
          }
        );

        test(
          "identifies REMOVED as terminal",
          () => {
            expect(
              isTerminalJobStatus(
                JOB_STATUSES.REMOVED
              )
            ).toBe(true);
          }
        );

        test(
          "does not identify DRAFT as terminal",
          () => {
            expect(
              isTerminalJobStatus(
                JOB_STATUSES.DRAFT
              )
            ).toBe(false);
          }
        );

        test(
          "does not identify PUBLISHED as terminal",
          () => {
            expect(
              isTerminalJobStatus(
                JOB_STATUSES.PUBLISHED
              )
            ).toBe(false);
          }
        );
      }
    );
  }
);