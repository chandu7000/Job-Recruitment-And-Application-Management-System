import { jest } from "@jest/globals";

process.env.NODE_ENV = "test";
process.env.RESEND_API_KEY = "re_test_fake_key";

const send = jest.fn();

const Resend = jest.fn(() => ({
  emails: {
    send
  }
}));

jest.unstable_mockModule("resend", () => ({
  Resend
}));

const {
  sendEmail,
  sendTemplateEmail,
  verifyEmailProvider
} = await import(
  "../../services/email.service.js"
);

describe("Phase 10 email service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(
    "sends HTML and plain-text email",
    async () => {
      send.mockResolvedValue({
        data: {
          id: "message-1"
        },
        error: null
      });

      await expect(
        sendEmail({
          to: "user@example.com",
          subject: "Subject",
          html: "<p>Hello</p>",
          text: "Hello"
        })
      ).resolves.toEqual({
        success: true,
        messageId: "message-1"
      });

      expect(send).toHaveBeenCalledWith(
        expect.objectContaining({
          from:
            "CareerForge <onboarding@resend.dev>",
          to: ["user@example.com"],
          subject: "Subject",
          html: "<p>Hello</p>",
          text: "Hello"
        })
      );
    }
  );

  test(
    "returns a safe failure result without throwing",
    async () => {
      send.mockRejectedValue(
        Object.assign(
          new Error(
            "Provider rejected request"
          ),
          {
            code: "EAUTH"
          }
        )
      );

      await expect(
        sendEmail({
          to: "user@example.com",
          subject: "Subject",
          html: "<p>Hello</p>",
          text: "Hello"
        })
      ).resolves.toEqual({
        success: false,
        errorCategory: "EAUTH"
      });
    }
  );

  test(
    "rejects an invalid recipient",
    async () => {
      await expect(
        sendEmail({
          to: "invalid",
          subject: "Subject",
          html: "x",
          text: "x"
        })
      ).rejects.toThrow(
        "valid email recipient"
      );

      expect(send).not.toHaveBeenCalled();
    }
  );

  test(
    "renders and sends a template email",
    async () => {
      send.mockResolvedValue({
        data: {
          id: "message-2"
        },
        error: null
      });

      const result =
        await sendTemplateEmail({
          to: "user@example.com",
          template: "PASSWORD_RESET",
          data: {
            actionUrl:
              "https://example.com/reset"
          }
        });

      expect(result).toEqual({
        success: true,
        messageId: "message-2"
      });

      expect(send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ["user@example.com"],
          subject:
            "Reset your CareerForge password"
        })
      );
    }
  );

  test(
    "verifies the configured provider",
    async () => {
      await expect(
        verifyEmailProvider()
      ).resolves.toBe(true);
    }
  );
});