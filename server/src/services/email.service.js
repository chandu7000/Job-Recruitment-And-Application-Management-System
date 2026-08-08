import { renderEmailTemplate } from "../templates/emails/index.js";

const BREVO_API_URL =
  "https://api.brevo.com/v3/smtp/email";

const brevoApiKey =
  process.env.BREVO_API_KEY ||
  "test_brevo_api_key";

const brevoSenderEmail =
  process.env.BREVO_SENDER_EMAIL ||
  "careerforge.noreply@gmail.com";

const safeEmailError = ({
  eventType,
  recipient,
  resourceId,
  error
}) => {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  console.error("email-delivery-failed", {
    eventType,
    recipientReference: recipient
      ? recipient.replace(
        /(^.).*(@.*$)/,
        "$1***$2"
      )
      : null,
    resourceId: resourceId || null,
    errorCategory:
      error?.code ||
      error?.name ||
      "EMAIL_ERROR",
    providerMessage: String(
      error?.message ||
      "Email delivery failed"
    ).slice(0, 300),
    timestamp: new Date().toISOString()
  });
};

export const verifyEmailProvider =
  async () => {
    if (
      !process.env.BREVO_API_KEY &&
      process.env.NODE_ENV !== "test"
    ) {
      throw new Error(
        "BREVO_API_KEY is not configured."
      );
    }

    return true;
  };

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  eventType = "EMAIL",
  resourceId = null
}) => {
  if (
    !to ||
    !/^\S+@\S+\.\S+$/.test(to)
  ) {
    throw new Error(
      "A valid email recipient is required."
    );
  }

  try {
    const response = await fetch(
      BREVO_API_URL,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type":
            "application/json",
          "api-key": brevoApiKey
        },
        body: JSON.stringify({
          sender: {
            name: "CareerForge",
            email: brevoSenderEmail
          },
          to: [
            {
              email: to
            }
          ],
          subject,
          htmlContent: html,
          textContent: text
        })
      }
    );

    const responseBody =
      await response.json().catch(
        () => ({})
      );

    if (!response.ok) {
      const error = new Error(
        responseBody?.message ||
        `Brevo email delivery failed with status ${response.status}.`
      );

      error.code =
        responseBody?.code ||
        `BREVO_${response.status}`;

      throw error;
    }

    return {
      success: true,
      messageId:
        responseBody?.messageId ||
        null
    };
  } catch (error) {
    safeEmailError({
      eventType,
      recipient: to,
      resourceId,
      error
    });

    return {
      success: false,
      errorCategory:
        error?.code ||
        error?.name ||
        "EMAIL_ERROR"
    };
  }
};

export const sendTemplateEmail =
  async ({
    to,
    template,
    data = {},
    eventType = template,
    resourceId = null
  }) => {
    const rendered =
      renderEmailTemplate(
        template,
        data
      );

    return sendEmail({
      to,
      ...rendered,
      eventType,
      resourceId
    });
  };