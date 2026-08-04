import { ok } from '../core/ApiResponse.js';
import { sendEmailNotificationToRecipients } from '../services/mailer.service.js';
import { AppError } from '../core/errors.js';

export const notifyAlertEmail = async (req, res) => {
  const { alert, recipients } = req.body;

  if (recipients.length === 0) return ok(res, { skipped: 'no recipients' });

  const createdAt = alert.created_at ? new Date(alert.created_at) : new Date();
  const severity = String(alert.severity || 'high').toUpperCase();
  const subject = `HoneyGuard Alert (${severity}): ${alert.message || alert.type || 'Security event detected'}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#e55353;">HoneyGuard Alert - ${severity}</h2>
      <p>${alert.message || 'A suspicious event was recorded.'}</p>
      <p><strong>Type:</strong> ${alert.type || 'n/a'}</p>
      <p><strong>Token:</strong> ${alert.token || 'n/a'}</p>
      <p><strong>Time:</strong> ${createdAt.toLocaleString()}</p>
    </div>`;

  const sent = await sendEmailNotificationToRecipients(subject, html, recipients);
  if (!sent) throw new AppError('SMTP send failed or mailer not configured', 502, 'MAILER_UNAVAILABLE');

  return ok(res, { sent: recipients.length });
};

export default { notifyAlertEmail };
