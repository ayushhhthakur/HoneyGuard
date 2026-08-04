import { PDFDocument, PDFName, StandardFonts, rgb } from 'pdf-lib';

/**
 * Generates a real, valid PDF with visible fake content, plus a
 * best-effort canary: a document-level OpenAction pointing at the
 * tracking URL. Adobe Acrobat/Reader will attempt that URI when the file
 * is opened; browser-embedded PDF viewers generally do NOT execute
 * OpenActions, so this is meaningfully weaker than the Office-document
 * technique — that limitation is real and documented in the type's
 * trackingNote rather than glossed over. The tracking URL is also printed
 * as visible text so most viewers' auto-link detection (or a human) can
 * still trigger it as a fallback.
 */
export const generatePdfDocument = async ({ content, trackingUrl }) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 730;
  page.drawText(content.heading, { x: 56, y, size: 16, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
  y -= 20;
  page.drawText(content.subheading, { x: 56, y, size: 10, font, color: rgb(0.4, 0.4, 0.45) });
  y -= 36;

  for (const [label, value] of content.rows) {
    page.drawText(`${label}:`, { x: 56, y, size: 11, font: boldFont, color: rgb(0.15, 0.15, 0.2) });
    page.drawText(String(value), { x: 220, y, size: 11, font, color: rgb(0.2, 0.2, 0.25) });
    y -= 22;
  }

  y -= 20;
  page.drawText('View full report online:', { x: 56, y, size: 10, font: boldFont, color: rgb(0.15, 0.15, 0.2) });
  y -= 16;
  page.drawText(trackingUrl, { x: 56, y, size: 9, font, color: rgb(0.1, 0.4, 0.6) });

  y -= 40;
  page.drawText(content.footerNote, { x: 56, y, size: 8, font, color: rgb(0.5, 0.5, 0.55), maxWidth: 500 });

  // Best-effort open-action canary (Adobe Acrobat/Reader only).
  pdfDoc.catalog.set(
    PDFName.of('OpenAction'),
    pdfDoc.context.obj({ Type: 'Action', S: 'URI', URI: trackingUrl })
  );

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};
