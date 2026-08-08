import { Resend } from "resend";

import { renderEmailTemplate } from "../templates/emails/index.js";

const resendApiKey =
  process.env.RESEND_API_KEY || "test_resend_api_key";

const resend = new Resend(resendApiKey);

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
      error?.name ||
      error?.code ||
      "EMAIL_ERROR",
    providerMessage: String(
      error?.message ||
      "Email delivery failed"
    ).slice(0, 300),
    timestamp: new Date().toISOString()
  });
};

export const verifyEmailProvider = async () => {
  if (!resendApiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured."
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
    const {
      data,
      error
    } = await resend.emails.send({
      from:
        "CareerForge <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
      text
    });

    if (error) {
      throw new Error(
        error.message ||
        "Resend email delivery failed."
      );
    }

    return {
      success: true,
      messageId: data?.id || null
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

export const sendTemplateEmail = async ({
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