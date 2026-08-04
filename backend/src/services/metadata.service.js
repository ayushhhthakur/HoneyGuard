import axios from 'axios';
import ipaddr from 'ipaddr.js';
import { UAParser } from 'ua-parser-js';
import { createLogger } from '../core/logger.js';

const log = createLogger('MetadataService');

export const getClientIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return req.ip;
};

const FALLBACK_METADATA = {
  ip: 'Unknown',
  ip_type: 'Unknown',
  device: { os: 'Unknown', browser: 'Unknown', device: 'Unknown' },
  location: { country: 'Unknown', city: 'Unknown', region: 'Unknown', timezone: 'Unknown', isp: 'Unknown', lat: null, lon: null },
};

/**
 * Resolve IP -> device / geo metadata. Never throws; always returns a
 * best-effort object so a flaky geo lookup can't take down a tracking
 * endpoint a honeytoken depends on.
 */
export const getUserMetadata = async (requestIp, userAgent) => {
  if (!requestIp) return FALLBACK_METADATA;

  try {
    const userIP = requestIp.replace(/^::ffff:/, '');
    const ipType = ipaddr.isValid(userIP) ? (ipaddr.parse(userIP).kind() === 'ipv4' ? 'IPv4' : 'IPv6') : 'Unknown';

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    let geoData = {};
    try {
      const geoResponse = await axios.get(`http://ip-api.com/json/${userIP}`, { timeout: 4000 });
      geoData = geoResponse.data || {};
    } catch (geoErr) {
      log.warn({ ip: userIP, err: geoErr.message }, 'geo lookup failed');
    }

    return {
      ip: userIP,
      ip_type: ipType,
      device: {
        os: result.os.name || 'Unknown',
        browser: result.browser.name || 'Unknown',
        device: result.device.type || 'desktop',
      },
      location: {
        country: geoData.country || 'Unknown',
        city: geoData.city || 'Unknown',
        region: geoData.regionName || 'Unknown',
        timezone: geoData.timezone || 'Unknown',
        isp: geoData.isp || 'Unknown',
        lat: geoData.lat ?? null,
        lon: geoData.lon ?? null,
      },
    };
  } catch (error) {
    log.error({ err: error.message }, 'Error resolving user metadata');
    return FALLBACK_METADATA;
  }
};

export default { getClientIp, getUserMetadata };
