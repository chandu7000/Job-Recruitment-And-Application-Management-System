import request from "supertest";

import app from "../../app.js";

describe(
  "Admin management route protection",
  () => {
    test.each([
      [
        "get",
        "/api/admin/dashboard"
      ],
      [
        "get",
        "/api/admin/reports"
      ],
      [
        "get",
        "/api/admin/audit-logs"
      ],
      [
        "get",
        "/api/dashboard/recruiter"
      ],
      [
        "get",
        "/api/dashboard/job-seeker"
      ]
    ])(
      "%s %s rejects unauthenticated access",
      async (method, url) => {
        const response =
          await request(app)[method](url);

        expect(
          response.status
        ).toBe(401);
      }
    );

    test(
      "report submission requires authentication",
      async () => {
        const response =
          await request(app)
            .post("/api/reports")
            .send({});

        expect(
          response.status
        ).toBe(401);
      }
    );
  }
);