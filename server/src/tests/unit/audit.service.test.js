import {
  sanitizeAuditMetadata
} from "../../constants/audit.constants.js";

describe(
  "Audit metadata sanitization",
  () => {
    test(
      "removes sensitive values recursively",
      () => {
        const result =
          sanitizeAuditMetadata({
            email: "a@b.com",
            password: "secret",
            nested: {
              refreshToken: "x",
              safe: true
            }
          });

        expect(result).toEqual({
          email: "a@b.com",
          nested: {
            safe: true
          }
        });
      }
    );

    test(
      "preserves arrays and safe values",
      () => {
        expect(
          sanitizeAuditMetadata([
            {
              action: "OK"
            }
          ])
        ).toEqual([
          {
            action: "OK"
          }
        ]);
      }
    );
  }
);