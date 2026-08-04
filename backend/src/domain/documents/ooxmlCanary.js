import JSZip from 'jszip';

/**
 * Word/Excel/PowerPoint files (.docx/.xlsx/.pptx) are all ZIP archives
 * following the same Open Packaging Conventions — every part in the
 * package can declare "relationships" (in a `_rels/*.rels` XML file), and
 * a relationship can point at an EXTERNAL target (TargetMode="External")
 * instead of another file inside the archive. Several relationship types
 * cause the host application to fetch that external URL when the document
 * is opened — an attached template (Word), an external workbook link
 * (Excel), or a linked image (PowerPoint). That fetch is the canary.
 *
 * This is the same class of technique used by Canarytokens.org for MS
 * Office honeydocs. Reliability varies by application/version and by
 * whether the user's client blocks external content by default (mail
 * clients and some hardened Office configs do) — that caveat is real and
 * is surfaced in each type's `trackingNote`, not hidden.
 *
 * @param {Buffer} fileBuffer - the already-generated .docx/.xlsx/.pptx
 * @param {string} relsPath - path inside the zip to the .rels file to patch
 *   (e.g. 'word/_rels/settings.xml.rels')
 * @param {{id: string, type: string, target: string}} relationship
 */
export const injectExternalRelationship = async (fileBuffer, relsPath, relationship) => {
  const zip = await JSZip.loadAsync(fileBuffer);

  const existing = await zip.file(relsPath)?.async('string');
  const relEntry = `<Relationship Id="${relationship.id}" Type="${relationship.type}" Target="${relationship.target}" TargetMode="External"/>`;

  let updated;
  if (existing) {
    updated = existing.replace('</Relationships>', `${relEntry}</Relationships>`);
  } else {
    updated = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relEntry}</Relationships>`;
  }

  zip.file(relsPath, updated);
  return zip.generateAsync({ type: 'nodebuffer' });
};

/** Ensures `[Content_Types].xml` declares the override needed for a part —
 * some canary relationship types require a matching content-type override
 * to be honored by the host application. */
export const ensureContentTypeOverride = async (fileBuffer, partName, contentType) => {
  const zip = await JSZip.loadAsync(fileBuffer);
  const path = '[Content_Types].xml';
  const existing = await zip.file(path)?.async('string');
  if (!existing || existing.includes(partName)) return fileBuffer;

  const override = `<Override PartName="${partName}" ContentType="${contentType}"/>`;
  zip.file(path, existing.replace('</Types>', `${override}</Types>`));
  return zip.generateAsync({ type: 'nodebuffer' });
};
