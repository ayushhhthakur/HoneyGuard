import { Router } from 'express';
import { sendEmailNotificationToRecipients, sendEmailViaSmtpConfig } from '../lib/mailer.js';

const router = Router();

const ALERT_WEBHOOK_SECRET = process.env.ALERT_WEBHOOK_SECRET || '';

router.post('/notify-alert-email', async (req, res) => {
  const incomingSecret = req.get('x-alert-webhook-secret') || '';
  if (!ALERT_WEBHOOK_SECRET || incomingSecret !== ALERT_WEBHOOK_SECRET) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { alert, recipients, smtp } = req.body || {};
  const to = Array.isArray(recipients) ? recipients : [];

  if (!alert || !alert.org_id) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
  if (to.length === 0) {
    return res.status(200).json({ success: true, skipped: 'no recipients' });
  }

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

  const sent = smtp?.host && smtp?.user && smtp?.pass
    ? await sendEmailViaSmtpConfig({ smtp, subject, html, recipients: to })
    : await sendEmailNotificationToRecipients(subject, html, to);

  if (!sent) {
    return res.status(500).json({ success: false, error: 'SMTP send failed or mailer not configured' });
  }

  return res.json({ success: true, sent: to.length });
});

export default router;
