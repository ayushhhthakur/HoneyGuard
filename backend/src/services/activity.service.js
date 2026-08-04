import { tokenLogsRepository } from '../repositories/tokenLogs.repository.js';
import { alertsRepository } from '../repositories/alerts.repository.js';
import { getUserMetadata } from './metadata.service.js';
import { sendEmailNotification } from './mailer.service.js';
import { SUSPICIOUS_EVENTS, ALERT_SEVERITIES } from '../config/constants.js';
import { createLogger } from '../core/logger.js';

const log = createLogger('ActivityService');

/**
 * Writes a token_logs row and, for anything that looks like a real hit (not
 * a bookkeeping event), opens an alert. Never throws — a honeytoken
 * tracking endpoint failing silently beats it 500ing on an attacker (which
 * would leak that it's instrumented).
 */
export const logTokenActivity = async ({ tokenRow, event, status, requestIp, userAgent, metadata = {} }) => {
  try {
    const meta = await getUserMetadata(requestIp, userAgent);

    const log_ = await tokenLogsRepository.create({
      org_id: tokenRow.org_id,
      token: tokenRow.token,
      event,
      status,
      ip_address: meta.ip,
      user_agent: userAgent || '',
      os: meta.device.os,
      browser: meta.device.browser,
      device: meta.device.device,
      country: meta.location.country,
      region: meta.location.region,
      city: meta.location.city,
      timezone: meta.location.timezone,
      isp: meta.location.isp,
      latitude: meta.location.lat,
      longitude: meta.location.lon,
      metadata,
    });

    const looksSuspicious = SUSPICIOUS_EVENTS.has(event) && String(status).toLowerCase() === 'success';
    if (!looksSuspicious) return { log: log_, alert: null };

    const alert = await alertsRepository.create({
      org_id: tokenRow.org_id,
      token: tokenRow.token,
      log_id: log_.id,
      type: event,
      severity: ALERT_SEVERITIES.HIGH,
      message: `Honeytoken "${tokenRow.token_name}" was accessed`,
      details: { ip: meta.ip, location: meta.location, device: meta.device },
    });

    sendEmailNotification(
      `🚨 Honeytoken triggered — ${tokenRow.token_name}`,
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#e55353;">Suspicious Activity Detected</h2>
        <p><strong>Token:</strong> ${tokenRow.token}</p>
        <p><strong>Event:</strong> ${event}</p>
        <p><strong>IP:</strong> ${meta.ip}</p>
        <p><strong>Location:</strong> ${meta.location.city}, ${meta.location.country}</p>
        <p><strong>Device:</strong> ${meta.device.browser} / ${meta.device.os} / ${meta.device.device}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>`
    ).catch(() => {});

    return { log: log_, alert };
  } catch (error) {
    log.error({ err: error.message, event, token: tokenRow?.token }, 'logTokenActivity failed');
    return null;
  }
};

export default { logTokenActivity };
