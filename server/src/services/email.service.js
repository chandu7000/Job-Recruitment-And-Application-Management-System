import nodemailer from "nodemailer";
import env from "../config/env.js";
import { renderEmailTemplate } from "../templates/emails/index.js";

let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.password }
    });
  }
  return transporter;
};

const safeEmailError = ({ eventType, recipient, resourceId, error }) => {
  if (env.isTest) return;
  console.error("email-delivery-failed", {
    eventType,
    recipientReference: recipient ? recipient.replace(/(^.).*(@.*$)/, "$1***$2") : null,
    resourceId: resourceId || null,
    errorCategory: error?.code || error?.name || "EMAIL_ERROR",
    providerMessage: String(error?.message || "Email delivery failed").slice(0, 300),
    timestamp: new Date().toISOString()
  });
};

export const verifyEmailProvider = async () => getTransporter().verify();

export const sendEmail = async ({ to, subject, html, text, eventType = "EMAIL", resourceId = null }) => {
  if (!to || !/^\S+@\S+\.\S+$/.test(to)) throw new Error("A valid email recipient is required.");
  try {
    const info = await getTransporter().sendMail({
      from: `"CareerForge" <${env.smtp.user}>`, to, subject, html, text
    });
    return { success: true, messageId: info.messageId || null };
  } catch (error) {
    safeEmailError({ eventType, recipient: to, resourceId, error });
    return { success: false, errorCategory: error?.code || error?.name || "EMAIL_ERROR" };
  }
};

export const sendTemplateEmail = async ({ to, template, data = {}, eventType = template, resourceId = null }) => {
  const rendered = renderEmailTemplate(template, data);
  return sendEmail({ to, ...rendered, eventType, resourceId });
};
