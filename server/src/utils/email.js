import env from "../config/env.js";
import { sendTemplateEmail } from "../services/email.service.js";

const sendPasswordResetEmail = async (email, resetToken) => sendTemplateEmail({
  to: email,
  template: "PASSWORD_RESET",
  data: { actionUrl: `${env.clientUrl}/reset-password/${resetToken}` },
  eventType: "PASSWORD_RESET"
});

const sendVerificationEmail = async (email, verificationToken) => sendTemplateEmail({
  to: email,
  template: "EMAIL_VERIFICATION",
  data: {
    actionUrl: `${env.clientUrl}/verify-email/${verificationToken}`,
    secondaryActionUrl: `${env.clientUrl}/decline-email-verification/${verificationToken}`
  },
  eventType: "EMAIL_VERIFICATION"
});

const sendEmailChangeVerificationEmail = async (newEmail, verificationToken) => sendTemplateEmail({
  to: newEmail,
  template: "EMAIL_VERIFICATION",
  data: { actionUrl: `${env.clientUrl}/verify-email-change/${verificationToken}` },
  eventType: "EMAIL_CHANGE_VERIFICATION"
});

export { sendPasswordResetEmail, sendVerificationEmail, sendEmailChangeVerificationEmail };
