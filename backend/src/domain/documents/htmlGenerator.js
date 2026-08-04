/**
 * Generates a real, standalone HTML file. Unlike Office/PDF documents,
 * HTML needs no special canary trick — a plain <img> tag pointing at
 * HoneyGuard's own tracking pixel endpoint fires the moment the file is
 * opened in ANY browser (or previewed by most email/OS quick-look tools
 * that render HTML), making this the single most reliable file-based
 * honeytoken format. The fingerprint collector script is included too,
 * for browsers that execute it.
 */
export const generateHtmlDocument = ({ content, apiBase, token }) => {
  const rowsHtml = content.rows
    .map(([label, value]) => `<tr><td class="label">${escapeHtml(label)}</td><td>${escapeHtml(String(value))}</td></tr>`)
    .join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(content.heading)}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Arial, sans-serif; background:#f4f5f7; margin:0; padding:40px; color:#1a1a2e; }
  .doc { max-width:640px; margin:0 auto; background:#fff; border-radius:8px; padding:32px 40px; box-shadow:0 1px 4px rgba(0,0,0,0.08); }
  h1 { font-size:20px; margin:0 0 4px; }
  .sub { color:#777; font-size:13px; margin-bottom:24px; }
  table { width:100%; border-collapse:collapse; font-size:14px; }
  td { padding:8px 0; border-bottom:1px solid #eee; }
  td.label { font-weight:600; width:220px; color:#444; }
  .footer { margin-top:24px; font-size:11px; color:#999; }
</style>
</head>
<body>
  <div class="doc">
    <h1>${escapeHtml(content.heading)}</h1>
    <div class="sub">${escapeHtml(content.subheading)}</div>
    <table>${rowsHtml}</table>
    <div class="footer">${escapeHtml(content.footerNote)}</div>
  </div>
  <img src="${apiBase}/image/${encodeURIComponent(token)}" width="1" height="1" style="position:absolute;left:-9999px" alt="" />
  <script src="${apiBase}/fp.js" data-token="${escapeHtml(token)}" data-api="${apiBase}" async></script>
</body>
</html>`;

  return Buffer.from(html, 'utf-8');
};

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
