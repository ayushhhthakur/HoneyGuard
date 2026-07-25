// Shared helpers imported by every HoneyGuard edge function.
// Deno edge functions run at the network edge close to whoever/whatever
// just tripped a honeytoken — that's why the highest-traffic, most
// latency-sensitive public tracking endpoints live here instead of Express.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false } }
);

export const getClientIp = (req: Request): string =>
  req.headers.get('cf-connecting-ip') ||
  req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
  req.headers.get('x-real-ip') ||
  'unknown';

export interface GeoInfo {
  country: string;
  city: string;
  region: string;
  timezone: string;
  isp: string;
  lat: number | null;
  lon: number | null;
}

export const lookupGeo = async (ip: string): Promise<GeoInfo> => {
  const fallback: GeoInfo = {
    country: 'Unknown',
    city: 'Unknown',
    region: 'Unknown',
    timezone: 'Unknown',
    isp: 'Unknown',
    lat: null,
    lon: null,
  };
  if (!ip || ip === 'unknown') return fallback;
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return fallback;
    const data = await res.json();
    return {
      country: data.country ?? 'Unknown',
      city: data.city ?? 'Unknown',
      region: data.regionName ?? 'Unknown',
      timezone: data.timezone ?? 'Unknown',
      isp: data.isp ?? 'Unknown',
      lat: data.lat ?? null,
      lon: data.lon ?? null,
    };
  } catch {
    return fallback;
  }
};

export const parseUserAgent = (ua: string) => {
  const os = /Windows/i.test(ua)
    ? 'Windows'
    : /Mac OS/i.test(ua)
    ? 'macOS'
    : /Linux/i.test(ua)
    ? 'Linux'
    : /Android/i.test(ua)
    ? 'Android'
    : /iPhone|iPad/i.test(ua)
    ? 'iOS'
    : 'Unknown';
  const browser = /Edg\//i.test(ua)
    ? 'Edge'
    : /Chrome\//i.test(ua)
    ? 'Chrome'
    : /Firefox\//i.test(ua)
    ? 'Firefox'
    : /Safari\//i.test(ua)
    ? 'Safari'
    : 'Unknown';
  const device = /Mobile|Android|iPhone/i.test(ua) ? 'mobile' : /iPad|Tablet/i.test(ua) ? 'tablet' : 'desktop';
  return { os, browser, device };
};

/** Look a honeytoken up by its value — token values are globally unique. */
export const findToken = async (token: string) => {
  const { data } = await supabaseAdmin.from('tokens').select('*').eq('token', token).single();
  return data;
};

const SUSPICIOUS_EVENTS = new Set(['IMAGE_ACCESS', 'AWS_ACCESS', 'FINANCIAL_ACCESS', 'HEALTHCARE_ACCESS', 'suspicious']);

/**
 * Insert a token_logs row and, for anything that looks like a real hit,
 * an alert too. Mirrors backend/lib/activity.js — kept intentionally simple
 * (no email dispatch here; that stays on the Express side, triggered by a
 * Database Webhook on alerts INSERT so we don't need SMTP creds at the edge).
 */
export const logActivity = async (opts: {
  tokenRow: any;
  event: string;
  status: string;
  ip: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}) => {
  const { tokenRow, event, status, ip, userAgent, metadata = {} } = opts;
  const geo = await lookupGeo(ip);
  const device = parseUserAgent(userAgent || '');

  const { data: log, error } = await supabaseAdmin
    .from('token_logs')
    .insert([
      {
        org_id: tokenRow.org_id,
        token: tokenRow.token,
        event,
        status,
        ip_address: ip,
        user_agent: userAgent,
        os: device.os,
        browser: device.browser,
        device: device.device,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        timezone: geo.timezone,
        isp: geo.isp,
        latitude: geo.lat,
        longitude: geo.lon,
        metadata,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('logActivity insert failed', error.message);
    return null;
  }

  if (SUSPICIOUS_EVENTS.has(event) && status.toLowerCase() === 'success') {
    await supabaseAdmin.from('alerts').insert([
      {
        org_id: tokenRow.org_id,
        token: tokenRow.token,
        log_id: log.id,
        type: event,
        severity: 'high',
        message: `Honeytoken "${tokenRow.token_name}" was accessed`,
        details: { ip, geo, device },
      },
    ]);
  }

  return log;
};
