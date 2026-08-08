import { jest } from "@jest/globals";

process.env.NODE_ENV = "test";
process.env.BREVO_API_KEY =
  "test_brevo_api_key";
process.env.BREVO_SENDER_EMAIL =
  "careerforge.noreply@gmail.com";

const fetchMock = jest.fn();

global.fetch = fetchMock;

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
      fetchMock.mockResolvedValue({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue({
          messageId: "message-1"
        })
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

      expect(fetchMock)
        .toHaveBeenCalledWith(
          "https://api.brevo.com/v3/smtp/email",
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              "api-key":
                "test_brevo_api_key",
              "content-type":
                "application/json"
            })
          })
        );

      const request =
        fetchMock.mock.calls[0][1];

      const body =
        JSON.parse(request.body);

      expect(body).toEqual(
        expect.objectContaining({
          sender: {
            name: "CareerForge",
            email:
              "careerforge.noreply@gmail.com"
          },
          to: [
            {
              email:
                "user@example.com"
            }
          ],
          subject: "Subject",
          htmlContent:
            "<p>Hello</p>",
          textContent: "Hello"
        })
      );
    }
  );

  test(
    "returns a safe failure result without throwing",
    async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({
          code:
            "unauthorized",
          message:
            "Invalid API key"
        })
      });

      await expect(
        sendEmail({
          to: "user@example.com",
          subject: "Subject",
          html: "<p>Hello</p>",
          text: "Hello"
        })
      ).resolves.toEqual({
        success: false,
        errorCategory:
          "unauthorized"
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

      expect(fetchMock)
        .not.toHaveBeenCalled();
    }
  );

  test(
    "renders and sends a template email",
    async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue({
          messageId: "message-2"
        })
      });

      const result =
        await sendTemplateEmail({
          to: "user@example.com",
          template:
            "PASSWORD_RESET",
          data: {
            actionUrl:
              "https://example.com/reset"
          }
        });

      expect(result).toEqual({
        success: true,
        messageId: "message-2"
      });

      const request =
        fetchMock.mock.calls[0][1];

      const body =
        JSON.parse(request.body);

      expect(body.subject).toBe(
        "Reset your CareerForge password"
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