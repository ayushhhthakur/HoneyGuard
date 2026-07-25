import { supabaseAdmin } from './supabaseAdmin.js';
import { getUserMetadata } from './metadata.js';
import { sendEmailNotification } from './mailer.js';

/**
 * Looks a token up (globally, since token values are unique across every
 * org) and returns its row, or null.
 */
export const findTokenOrgId = async (token) => {
  const { data } = await supabaseAdmin.from('tokens').select('*').eq('token', token).single();
  return data || null;
};

const SUSPICIOUS_EVENTS = new Set(['IMAGE_ACCESS', 'AWS_ACCESS', 'suspicious', 'TRACK']);

/**
 * Writes a token_logs row and, for anything that looks like a real hit
 * (not a bookkeeping event like "created"), opens an alert for the org to
 * triage. Never throws — a honeytoken tracking endpoint failing silently
 * beats it 500ing on an attacker (which would leak that it's instrumented).
 */
export const logTokenActivity = async ({ tokenRow, event, status, requestIp, userAgent, metadata = {} }) => {
  try {
    const meta = await getUserMetadata(requestIp, userAgent);

    const { data: log, error } = await supabaseAdmin
      .from('token_logs')
      .insert([
        {
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
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[activity] failed to insert token_log:', error.message);
      return null;
    }

    const looksSuspicious = SUSPICIOUS_EVENTS.has(event) && (status === 'SUCCESS' || status === 'success');
    if (looksSuspicious) {
      const { data: alert } = await supabaseAdmin
        .from('alerts')
        .insert([
          {
            org_id: tokenRow.org_id,
            token: tokenRow.token,
            log_id: log.id,
            type: event,
            severity: 'high',
            message: `Honeytoken "${tokenRow.token_name}" was accessed`,
            details: { ip: meta.ip, location: meta.location, device: meta.device },
          },
        ])
        .select()
        .single();

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

      return { log, alert };
    }

    return { log, alert: null };
  } catch (error) {
    console.error('[activity] logTokenActivity error:', error.message);
    return null;
  }
};
