import ExcelJS from 'exceljs';
import JSZip from 'jszip';

const EXTERNAL_LINK_PATH = 'xl/externalLinks/externalLink1.xml';
const EXTERNAL_LINK_RELS_PATH = 'xl/externalLinks/_rels/externalLink1.xml.rels';

/**
 * Generates a real .xlsx with visible fake content, then wires up an
 * "external workbook link" — a formula cell referencing a phantom
 * external workbook (`=[1]Sheet1!A1`), where workbook #1 is declared as an
 * externally-hosted file at the tracking URL. Excel resolves external
 * references (fetching / attempting to fetch the linked workbook) when the
 * file is opened with automatic link updates enabled — the same canary
 * class Canarytokens.org uses for MS Excel honeydocs. Some Excel
 * configurations prompt the user before updating external links rather
 * than fetching silently; that's a real reliability caveat, not hidden.
 */
export const generateExcelDocument = async ({ content, trackingUrl }) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Summary');

  sheet.getCell('A1').value = content.heading;
  sheet.getCell('A1').font = { bold: true, size: 14 };
  sheet.getCell('A2').value = content.subheading;
  sheet.getCell('A2').font = { italic: true, color: { argb: 'FF666666' } };

  let row = 4;
  for (const [label, value] of content.rows) {
    sheet.getCell(`A${row}`).value = label;
    sheet.getCell(`A${row}`).font = { bold: true };
    sheet.getCell(`B${row}`).value = String(value);
    row += 1;
  }

  row += 1;
  sheet.getCell(`A${row}`).value = content.footerNote;
  sheet.getCell(`A${row}`).font = { size: 8, color: { argb: 'FF888888' } };

  // The trigger cell — a formula referencing external workbook index 1.
  // Placed off to the side (column Z) so it doesn't visually clutter the
  // report but still evaluates on open.
  sheet.getCell('Z1').value = { formula: "='[1]Sheet1'!A1", result: '' };
  sheet.getColumn(26).hidden = true;

  sheet.columns = [{ width: 22 }, { width: 40 }];

  const baseBuffer = Buffer.from(await workbook.xlsx.writeBuffer());
  return wireExternalLink(baseBuffer, trackingUrl);
};

const wireExternalLink = async (fileBuffer, trackingUrl) => {
  const zip = await JSZip.loadAsync(fileBuffer);

  // 1. The external link part itself — declares "workbook #1" and its one sheet.
  zip.file(
    EXTERNAL_LINK_PATH,
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<externalLink xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><externalBook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rIdHgCanary"><sheetNames><sheetName val="Sheet1"/></sheetNames><sheetDataSet><sheetData sheetId="0"/></sheetDataSet></externalBook></externalLink>`
  );

  // 2. The external link's OWN relationship — THIS is the one that points
  // out of the package at the tracking URL.
  zip.file(
    EXTERNAL_LINK_RELS_PATH,
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdHgCanary" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLinkPath" Target="${trackingUrl}" TargetMode="External"/></Relationships>`
  );

  // 3. workbook.xml needs an <externalReferences> pointing (internally) at
  // the external link part above.
  const workbookXmlPath = 'xl/workbook.xml';
  const workbookXml = await zip.file(workbookXmlPath).async('string');
  const externalRefsEl = '<externalReferences><externalReference r:id="rIdHgExtLink"/></externalReferences>';
  const patchedWorkbook = workbookXml.includes('</sheets>')
    ? workbookXml.replace('</sheets>', `</sheets>${externalRefsEl}`)
    : workbookXml.replace('</workbook>', `${externalRefsEl}</workbook>`);
  zip.file(workbookXmlPath, patchedWorkbook);

  // 4. workbook.xml.rels needs an INTERNAL relationship from
  // rIdHgExtLink -> the external link part (this stays inside the package).
  const workbookRelsPath = 'xl/_rels/workbook.xml.rels';
  const workbookRels = await zip.file(workbookRelsPath).async('string');
  const internalRel = '<Relationship Id="rIdHgExtLink" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLink" Target="externalLinks/externalLink1.xml"/>';
  zip.file(workbookRelsPath, workbookRels.replace('</Relationships>', `${internalRel}</Relationships>`));

  // 5. [Content_Types].xml needs an Override so Excel knows how to parse
  // the new part.
  const contentTypesPath = '[Content_Types].xml';
  const contentTypes = await zip.file(contentTypesPath).async('string');
  const override = '<Override PartName="/xl/externalLinks/externalLink1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.externalLink+xml"/>';
  zip.file(contentTypesPath, contentTypes.replace('</Types>', `${override}</Types>`));

  return zip.generateAsync({ type: 'nodebuffer' });
};
