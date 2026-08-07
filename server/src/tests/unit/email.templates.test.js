import { emailTemplates, renderEmailTemplate } from "../../templates/emails/index.js";

describe("Phase 10 email templates", () => {
  test("all approved templates render subject, html and text", () => {
    for (const name of Object.keys(emailTemplates)) {
      const result = renderEmailTemplate(name, {
        companyName: "CareerForge Labs",
        candidateName: "Candidate",
        jobTitle: "Backend Developer",
        status: "SHORTLISTED",
        interviewTime: "2026-08-10 10:00",
        timezone: "Asia/Kolkata",
        meetingType: "ONLINE",
        meetingLink: "https://meet.example.com/interview",
        actionUrl: "https://careerforge.example.com/action"
      });
      expect(result.subject).toEqual(expect.any(String));
      expect(result.html).toContain("<!doctype html>");
      expect(result.text).toEqual(expect.any(String));
    }
  });

  test("escapes dynamic HTML content", () => {
    const result = renderEmailTemplate("COMPANY_APPROVED", { companyName: "<script>alert(1)</script>" });
    expect(result.html).not.toContain("<script>");
    expect(result.html).toContain("&lt;script&gt;");
  });

  test("rejects an unknown template", () => {
    expect(() => renderEmailTemplate("UNKNOWN_TEMPLATE", {})).toThrow("Unknown email template");
  });
});
