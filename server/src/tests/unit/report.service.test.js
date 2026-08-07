import {
  REPORT_STATUSES,
  REPORT_TRANSITIONS
} from "../../constants/report.constants.js";

describe(
  "Report status transition rules",
  () => {
    test(
      "OPEN reports support approved transitions",
      () => {
        expect(
          REPORT_TRANSITIONS[
            REPORT_STATUSES.OPEN
          ]
        ).toEqual(
          expect.arrayContaining([
            REPORT_STATUSES.UNDER_REVIEW,
            REPORT_STATUSES.RESOLVED,
            REPORT_STATUSES.DISMISSED
          ])
        );
      }
    );

    test(
      "finalized reports cannot be reopened",
      () => {
        expect(
          REPORT_TRANSITIONS[
            REPORT_STATUSES.RESOLVED
          ]
        ).toHaveLength(0);

        expect(
          REPORT_TRANSITIONS[
            REPORT_STATUSES.DISMISSED
          ]
        ).toHaveLength(0);
      }
    );
  }
);