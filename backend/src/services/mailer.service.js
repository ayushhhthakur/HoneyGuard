import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { createLogger } from '../core/logger.js';

const log = createLogger('MailerService');

let transporter = null;
if (env.smtp.isConfigured) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
    pool: true,
    maxConnections: 3,
    maxMessages: 10,
  });
} else {
  log.warn('SMTP_USER / SMTP_PASS not set — email notifications are disabled.');
}

const retryEmailSend = async (mailOptions, maxRetries = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await transporter.sendMail(mailOptions);
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw lastError;
};

const normalizeRecipients = (recipients = []) => {
  const values = Array.isArray(recipients) ? recipients : [recipients];
  return [...new Set(values.map((v) => String(v || '').trim()).filter(Boolean))];
};

/**
 * Notify the org's configured admin distribution list (ALERT_EMAILS).
 * Never throws — a notification failure should never break the API request
 * that triggered it.
 *
 * SECURITY NOTE: this intentionally only ever sends through the SMTP
 * credentials configured in this server's own environment. An earlier
 * version of this codebase accepted an arbitrary `{ host, user, pass }`
 * SMTP config in a webhook request body — that's an SSRF/credential-relay
 * primitive (anyone holding the webhook secret could make this server
 * connect out to any host with any credentials). That capability has been
 * removed; if you need per-tenant "from" addresses, model that as a
 * verified sender identity, not a caller-supplied SMTP config.
 */
export const sendEmailNotification = async (subject, html) => sendEmailNotificationToRecipients(subject, html, env.smtp.alertEmails);

export const sendEmailNotificationToRecipients = async (subject, html, recipients = []) => {
  if (!transporter) return false;
  const toList = normalizeRecipients(recipients);
  if (toList.length === 0) return false;

  try {
    await Promise.all(
      toList.map((to) =>
        retryEmailSend({
          from: { name: env.smtp.fromName, address: env.smtp.user },
          to,
          subject,
          html,
          headers: { priority: 'high' },
        })
      )
    );
    return true;
  } catch (error) {
    log.error({ err: error.message }, 'Failed to send notification');
    return false;
  }
};

export const isMailerConfigured = () => Boolean(transporter && env.smtp.alertEmails.length > 0);
