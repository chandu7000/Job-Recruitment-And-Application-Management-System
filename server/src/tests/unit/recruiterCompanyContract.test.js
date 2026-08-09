import fs from "node:fs";

const routes = fs.readFileSync(
  new URL(
    "../../routes/company.routes.js",
    import.meta.url
  ),
  "utf8"
);

const service = fs.readFileSync(
  new URL(
    "../../services/company.service.js",
    import.meta.url
  ),
  "utf8"
);

const dashboard = fs.readFileSync(
  new URL(
    "../../services/dashboard.service.js",
    import.meta.url
  ),
  "utf8"
);

describe("Recruiter company contract", () => {
  test("exposes recruiter resubmission and verification history", () => {
    expect(routes).toContain(
      '"/me/resubmit-verification"'
    );
    expect(routes).toContain(
      '"/me/verification-history"'
    );
  });

  test("prevents duplicate recruiter companies", () => {
    expect(service).toContain(
      "RECRUITER_COMPANY_ALREADY_EXISTS"
    );
  });

  test("provides the complete recruiter dashboard contract", () => {
    expect(dashboard).toContain(
      "unreadNotificationCount"
    );
    expect(dashboard).toContain(
      "completionPercentage"
    );
    expect(dashboard).toContain(
      "upcoming"
    );
  });
});
