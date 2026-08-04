import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';
import JSZip from 'jszip';
import { injectExternalRelationship } from './ooxmlCanary.js';

const ATTACHED_TEMPLATE_REL_TYPE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/attachedTemplate';
const CANARY_REL_ID = 'rIdHgCanary';

/** Word only fetches the attached template if settings.xml itself
 * references the relationship via <w:attachedTemplate r:id="..."/> — just
 * adding the relationship file isn't enough. This inserts that element as
 * the first child of <w:settings>, which is where the WordprocessingML
 * schema expects it in the element sequence. */
const referenceAttachedTemplateInSettings = async (fileBuffer) => {
  const zip = await JSZip.loadAsync(fileBuffer);
  const settingsPath = 'word/settings.xml';
  const xml = await zip.file(settingsPath).async('string');

  const openTagEnd = xml.indexOf('>', xml.indexOf('<w:settings')) + 1;
  const injected = `<w:attachedTemplate r:id="${CANARY_REL_ID}"/>`;
  const patched = xml.slice(0, openTagEnd) + injected + xml.slice(openTagEnd);

  zip.file(settingsPath, patched);
  return zip.generateAsync({ type: 'nodebuffer' });
};

/**
 * Generates a real .docx with visible fake content, then patches in an
 * "attached template" relationship pointing at the tracking URL. Word
 * fetches a document's attached template over HTTP(S) when the file is
 * opened (this is the same technique Canarytokens.org uses for MS Word
 * honeydocs) — reasonably reliable in desktop Word, blocked by some
 * hardened/managed configurations that disable external template loading.
 */
export const generateWordDocument = async ({ content, trackingUrl }) => {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: content.heading, heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ children: [new TextRun({ text: content.subheading, italics: true, color: '666666' })] }),
          new Paragraph({ text: '' }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: content.rows.map(
              ([label, value]) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: String(value) })] }),
                  ],
                })
            ),
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ children: [new TextRun({ text: content.footerNote, size: 16, color: '888888' })] }),
        ],
      },
    ],
  });

  const baseBuffer = await Packer.toBuffer(doc);

  const withRelationship = await injectExternalRelationship(baseBuffer, 'word/_rels/settings.xml.rels', {
    id: CANARY_REL_ID,
    type: ATTACHED_TEMPLATE_REL_TYPE,
    target: trackingUrl,
  });

  return referenceAttachedTemplateInSettings(withRelationship);
};
