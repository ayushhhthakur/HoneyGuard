import pptxgen from 'pptxgenjs';
import JSZip from 'jszip';

const IMAGE_REL_TYPE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image';
const CANARY_REL_ID = 'rIdHgCanary';

/**
 * Generates a real .pptx with visible fake content, then adds a tiny
 * (0.01"x0.01") LINKED (not embedded) picture to the first slide, whose
 * relationship target is external. PowerPoint fetches linked images when
 * rendering a slide — this is the same "linked picture" canary technique
 * Canarytokens.org uses for MS PowerPoint honeydocs. Some PowerPoint
 * configurations prompt before fetching external content on untrusted
 * files — a real reliability caveat, documented rather than hidden.
 */
export const generatePowerPointDocument = async ({ content, trackingUrl }) => {
  const pres = new pptxgen();
  pres.defineLayout({ name: 'HG', width: 10, height: 7.5 });
  pres.layout = 'HG';

  const slide = pres.addSlide();
  slide.addText(content.heading, { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 22, bold: true, color: '1a1a2e' });
  slide.addText(content.subheading, { x: 0.5, y: 1.0, w: 9, h: 0.4, fontSize: 12, italic: true, color: '666666' });

  const tableRows = content.rows.map(([label, value]) => [
    { text: label, options: { bold: true, fontSize: 11 } },
    { text: String(value), options: { fontSize: 11 } },
  ]);
  slide.addTable(tableRows, { x: 0.5, y: 1.7, w: 9, colW: [3, 6], fontSize: 11 });

  slide.addText(content.footerNote, { x: 0.5, y: 6.8, w: 9, h: 0.5, fontSize: 8, color: '999999' });

  const baseBuffer = Buffer.from(await pres.write({ outputType: 'nodebuffer' }));
  return addLinkedCanaryImage(baseBuffer, trackingUrl);
};

const addLinkedCanaryImage = async (fileBuffer, trackingUrl) => {
  const zip = await JSZip.loadAsync(fileBuffer);

  const relsPath = 'ppt/slides/_rels/slide1.xml.rels';
  const rels = await zip.file(relsPath).async('string');
  const relEntry = `<Relationship Id="${CANARY_REL_ID}" Type="${IMAGE_REL_TYPE}" Target="${trackingUrl}" TargetMode="External"/>`;
  zip.file(relsPath, rels.replace('</Relationships>', `${relEntry}</Relationships>`));

  const slidePath = 'ppt/slides/slide1.xml';
  const slideXml = await zip.file(slidePath).async('string');
  const picXml =
    '<p:pic>' +
    '<p:nvPicPr><p:cNvPr id="999" name="hg-canary" descr=""/><p:cNvPicPr/><p:nvPr/></p:nvPicPr>' +
    `<p:blipFill><a:blip r:link="${CANARY_REL_ID}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>` +
    '<p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="9525" cy="9525"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>' +
    '</p:pic>';
  zip.file(slidePath, slideXml.replace('</p:spTree>', `${picXml}</p:spTree>`));

  return zip.generateAsync({ type: 'nodebuffer' });
};
