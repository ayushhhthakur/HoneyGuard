import nodemailer from 'nodemailer';

const {
  SMTP_HOST = 'smtp.gmail.com',
  SMTP_PORT = '465',
  SMTP_SECURE = 'true',
  SMTP_USER,
  SMTP_PASS,
  ALERT_FROM_NAME = 'HoneyGuard Security',
  ALERT_EMAILS = '',
} = process.env;

const adminEmails = ALERT_EMAILS.split(',').map((e) => e.trim()).filter(Boolean);

let transporter = null;

if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    pool: true,
    maxConnections: 3,
    maxMessages: 10,
  });
} else {
  console.warn(
    '[mailer] SMTP_USER / SMTP_PASS not set — email notifications are disabled. ' +
      'Set them in backend/.env to enable alert emails.'
  );
}

const retryEmailSend = async (mailOptions, maxRetries = 3, activeTransporter = transporter) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await activeTransporter.sendMail(mailOptions);
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }
  throw lastError;
};

const normalizeRecipients = (recipients = []) => {
  const values = Array.isArray(recipients) ? recipients : [recipients];
  return [...new Set(values.map((v) => String(v || '').trim()).filter(Boolean))];
};

/**
 * Fire-and-forget-ish email notification. Never throws — a notification
 * failure should never break the API request that triggered it.
 */
export const sendEmailNotification = async (subject, html) => {
  return sendEmailNotificationToRecipients(subject, html, adminEmails);
};

export const sendEmailNotificationToRecipients = async (subject, html, recipients = []) => {
  if (!transporter) {
    return false;
  }

  const toList = normalizeRecipients(recipients);
  if (toList.length === 0) return false;

  try {
    await Promise.all(
      toList.map((to) =>
        retryEmailSend({
          from: { name: ALERT_FROM_NAME, address: SMTP_USER },
          to,
          subject,
          html,
          headers: { priority: 'high' },
        })
      )
    );
    return true;
  } catch (error) {
    console.error('[mailer] Failed to send notification:', error.message);
    return false;
  }
};

export const sendEmailViaSmtpConfig = async ({ smtp, subject, html, recipients = [] }) => {
  const toList = normalizeRecipients(recipients);
  if (toList.length === 0) return false;

  const host = String(smtp?.host || '').trim();
  const user = String(smtp?.user || '').trim();
  const pass = String(smtp?.pass || '').trim();
  if (!host || !user || !pass) return false;

  const port = Number(smtp?.port || 465);
  const secure = String(smtp?.secure ?? 'true') === 'true';
  const fromName = String(smtp?.fromName || ALERT_FROM_NAME).trim() || ALERT_FROM_NAME;

  const dynamicTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    pool: true,
    maxConnections: 2,
    maxMessages: 10,
  });

  try {
    await Promise.all(
      toList.map((to) =>
        retryEmailSend(
          {
            from: { name: fromName, address: user },
            to,
            subject,
            html,
            headers: { priority: 'high' },
          },
          3,
          dynamicTransporter
        )
      )
    );
    return true;
  } catch (error) {
    console.error('[mailer] Dynamic SMTP send failed:', error.message);
    return false;
  }
};

export const isMailerConfigured = () => Boolean(transporter && adminEmails.length > 0);
