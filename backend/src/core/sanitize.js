/**
 * Strips anything that looks like markup and collapses whitespace/control
 * characters from user-supplied free text (token names, descriptions, org
 * names) before it's stored. This isn't a substitute for the frontend
 * rendering data safely (React already escapes by default) — it's
 * defense-in-depth so stored data can't carry an XSS payload into some
 * future consumer that renders it as raw HTML (an exported report, an
 * email digest, a future admin tool), and so nothing but printable text
 * ends up in a field that gets logged, emailed, or put in a CSV.
 */
export const sanitizeText = (value, { maxLength = 500 } = {}) => {
  if (value === null || value === undefined) return value;
  const str = String(value);
  return str
    .replace(/<[^>]*>/g, '') // strip tags
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') // strip control chars (keep \n, \t)
    .trim()
    .slice(0, maxLength);
};

export const sanitizeEmail = (value) => String(value || '').trim().toLowerCase().slice(0, 254);

export const sanitizeSlugSegment = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
