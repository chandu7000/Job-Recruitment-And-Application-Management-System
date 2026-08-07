import {
  ACCOUNT_STATUS
} from "../../constants/app.constants.js";

import {
  JOB_STATUSES
} from "../../constants/job.constants.js";

describe(
  "Admin management moderation constants",
  () => {
    test(
      "supports required user account statuses",
      () => {
        expect(
          Object.values(ACCOUNT_STATUS)
        ).toEqual(
          expect.arrayContaining([
            "ACTIVE",
            "DISABLED",
            "SUSPENDED",
            "PENDING_VERIFICATION"
          ])
        );
      }
    );

    test(
      "supports removed job status",
      () => {
        expect(
          JOB_STATUSES.REMOVED
        ).toBe("REMOVED");
      }
    );
  }
);