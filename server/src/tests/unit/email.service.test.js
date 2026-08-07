import { jest } from "@jest/globals";

const sendMail = jest.fn();
const verify = jest.fn();
const createTransport = jest.fn(() => ({ sendMail, verify }));

jest.unstable_mockModule("nodemailer", () => ({
  default: { createTransport }
}));

jest.unstable_mockModule("../../config/env.js", () => ({
  default: {
    isTest: true,
    smtp: { host: "smtp.example.com", port: 587, user: "noreply@example.com", password: "secret" }
  }
}));

const { sendEmail, sendTemplateEmail, verifyEmailProvider } = await import("../../services/email.service.js");

describe("Phase 10 email service", () => {
  beforeEach(() => jest.clearAllMocks());

  test("sends HTML and plain-text email", async () => {
    sendMail.mockResolvedValue({ messageId: "message-1" });
    await expect(sendEmail({ to: "user@example.com", subject: "Subject", html: "<p>Hello</p>", text: "Hello" }))
      .resolves.toEqual({ success: true, messageId: "message-1" });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "user@example.com", html: "<p>Hello</p>", text: "Hello" }));
  });

  test("returns a safe failure result without throwing", async () => {
    sendMail.mockRejectedValue(Object.assign(new Error("Provider rejected request"), { code: "EAUTH" }));
    await expect(sendEmail({ to: "user@example.com", subject: "Subject", html: "<p>Hello</p>", text: "Hello" }))
      .resolves.toEqual({ success: false, errorCategory: "EAUTH" });
  });

  test("rejects an invalid recipient", async () => {
    await expect(sendEmail({ to: "invalid", subject: "Subject", html: "x", text: "x" }))
      .rejects.toThrow("valid email recipient");
  });

  test("renders and sends a template email", async () => {
    sendMail.mockResolvedValue({ messageId: "message-2" });
    const result = await sendTemplateEmail({ to: "user@example.com", template: "PASSWORD_RESET", data: { actionUrl: "https://example.com/reset" } });
    expect(result.success).toBe(true);
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ subject: "Reset your CareerForge password" }));
  });

  test("verifies the configured provider", async () => {
    verify.mockResolvedValue(true);
    await expect(verifyEmailProvider()).resolves.toBe(true);
  });
});
