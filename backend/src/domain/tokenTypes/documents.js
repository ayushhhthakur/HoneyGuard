import { generatePdfDocument } from '../documents/pdfGenerator.js';
import { generateWordDocument } from '../documents/wordGenerator.js';
import { generateExcelDocument } from '../documents/excelGenerator.js';
import { generatePowerPointDocument } from '../documents/pptGenerator.js';
import { generateHtmlDocument } from '../documents/htmlGenerator.js';
import { resolveContentTemplate } from '../documents/contentTemplates.js';
import { randomAlphaNum } from '../generators/primitives.js';

const genericContent = (label, tokenName) => ({
  heading: tokenName || label,
  subheading: `Reference #${randomAlphaNum(8).toUpperCase()}`,
  rows: [
    ['Classification', 'Confidential'],
    ['Distribution', 'Internal only'],
  ],
  footerNote: 'This document is a security instrumented decoy. Any access outside authorized personnel will be logged.',
});

/**
 * File-format document types. Each `generate` receives `ctx` with the
 * fully-built tracking URLs (the token service assembles these once it
 * knows the freshly-created token's value) and returns a `file` payload
 * for upload to storage, instead of a bare string.
 */
export const documentTypes = {
  image: {
    key: 'image',
    label: 'Image',
    family: 'documents',
    deliveryMethod: 'file',
    fileFormat: 'image',
    defaultExpiryDays: null,
    rotatable: false,
    description: 'A user-supplied image, served through a tracked redirect.',
    trackingNote: 'Fully tracked: /image/:token logs every fetch before redirecting to the real, R2-hosted file. The oldest and most reliable HoneyGuard token type.',
    requiresUpload: true,
  },

  pdf_document: {
    key: 'pdf_document',
    label: 'PDF',
    family: 'documents',
    deliveryMethod: 'file',
    fileFormat: 'pdf',
    defaultExpiryDays: null,
    rotatable: false,
    description: 'A real PDF with a best-effort open-action canary (Adobe Acrobat/Reader) plus a visible tracking link.',
    trackingNote:
      'Best-effort: Adobe Acrobat/Reader may fetch the embedded OpenAction URL on open; most browser-embedded PDF viewers do not execute it. A visible "view online" link is included as a human-triggered fallback that works everywhere.',
    generate: async ({ tokenName }, ctx) => {
      const content = genericContent('PDF Document', tokenName);
      const buffer = await generatePdfDocument({ content, trackingUrl: ctx.decoyUrl });
      return { file: { buffer, mimetype: 'application/pdf', filename: `${slug(tokenName)}.pdf` } };
    },
  },

  word_document: {
    key: 'word_document',
    label: 'Word',
    family: 'documents',
    deliveryMethod: 'file',
    fileFormat: 'docx',
    defaultExpiryDays: null,
    rotatable: false,
    description: 'A real .docx wired with an attached-template canary — fetched by Word on open.',
    trackingNote: 'Word fetches the attached template over HTTP(S) when the file is opened. Blocked by some hardened/managed Office configurations that disable external template loading.',
    generate: async ({ tokenName }, ctx) => {
      const content = genericContent('Word Document', tokenName);
      const buffer = await generateWordDocument({ content, trackingUrl: ctx.decoyUrl });
      return { file: { buffer, mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', filename: `${slug(tokenName)}.docx` } };
    },
  },

  excel_document: {
    key: 'excel_document',
    label: 'Excel',
    family: 'documents',
    deliveryMethod: 'file',
    fileFormat: 'xlsx',
    defaultExpiryDays: null,
    rotatable: false,
    description: 'A real .xlsx wired with an external-workbook-link canary — resolved by Excel on open.',
    trackingNote: 'Excel resolves external workbook links when opened with automatic link updates enabled; some configurations prompt the user first rather than fetching silently.',
    generate: async ({ tokenName }, ctx) => {
      const content = genericContent('Excel Workbook', tokenName);
      const buffer = await generateExcelDocument({ content, trackingUrl: ctx.decoyUrl });
      return { file: { buffer, mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: `${slug(tokenName)}.xlsx` } };
    },
  },

  powerpoint_document: {
    key: 'powerpoint_document',
    label: 'PowerPoint',
    family: 'documents',
    deliveryMethod: 'file',
    fileFormat: 'pptx',
    defaultExpiryDays: null,
    rotatable: false,
    description: 'A real .pptx with a tiny linked (external) image on slide one — fetched by PowerPoint on open.',
    trackingNote: 'PowerPoint fetches linked images when rendering a slide; some configurations prompt before fetching external content in untrusted files.',
    generate: async ({ tokenName }, ctx) => {
      const content = genericContent('PowerPoint Deck', tokenName);
      const buffer = await generatePowerPointDocument({ content, trackingUrl: ctx.decoyUrl });
      return { file: { buffer, mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', filename: `${slug(tokenName)}.pptx` } };
    },
  },

  html_document: {
    key: 'html_document',
    label: 'HTML',
    family: 'documents',
    deliveryMethod: 'file',
    fileFormat: 'html',
    defaultExpiryDays: null,
    rotatable: false,
    description: 'A standalone HTML file with an embedded tracking pixel and the fingerprint collector script.',
    trackingNote: 'Fully reliable: any browser (or HTML-rendering preview tool) that opens the file fetches the tracking pixel, firing an alert. The single most reliable file-based honeytoken format.',
    generate: async ({ tokenName }, ctx) => {
      const content = genericContent('Internal Document', tokenName);
      const buffer = generateHtmlDocument({ content, apiBase: ctx.apiBase, token: ctx.token });
      return { file: { buffer, mimetype: 'text/html', filename: `${slug(tokenName)}.html` } };
    },
  },
};

/** Business-document types share the exact same file generators, just with
 * a category-specific content template and a user-selectable output format. */
export const businessDocumentGenerators = { generatePdfDocument, generateWordDocument, generateExcelDocument };

export const buildBusinessDocumentType = (typeKey, label, description) => ({
  key: typeKey,
  label,
  family: 'business_documents',
  deliveryMethod: 'file',
  fileFormat: null, // determined per-generation by the chosen `format` field
  defaultExpiryDays: null,
  rotatable: false,
  description,
  trackingNote: 'Same tracking mechanism as the underlying file format chosen (PDF open-action, Word attached-template, or Excel external-link).',
  fields: [{ name: 'format', label: 'File format', type: 'select', options: ['pdf', 'docx', 'xlsx'], default: 'pdf' }],
  generate: async ({ format = 'pdf', tokenName }, ctx) => {
    const content = { ...resolveContentTemplate(typeKey, label), heading: tokenName || resolveContentTemplate(typeKey, label).heading };
    if (format === 'docx') {
      const buffer = await generateWordDocument({ content, trackingUrl: ctx.decoyUrl });
      return { file: { buffer, mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', filename: `${slug(tokenName || label)}.docx` }, fileFormat: 'docx' };
    }
    if (format === 'xlsx') {
      const buffer = await generateExcelDocument({ content, trackingUrl: ctx.decoyUrl });
      return { file: { buffer, mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: `${slug(tokenName || label)}.xlsx` }, fileFormat: 'xlsx' };
    }
    const buffer = await generatePdfDocument({ content, trackingUrl: ctx.decoyUrl });
    return { file: { buffer, mimetype: 'application/pdf', filename: `${slug(tokenName || label)}.pdf` }, fileFormat: 'pdf' };
  },
});

export const businessDocumentTypes = {
  financial_document: buildBusinessDocumentType('financial_document', 'Financial Documents', 'A synthetic financial summary document (account balances, IBAN, liabilities).'),
  healthcare_record: buildBusinessDocumentType('healthcare_record', 'Healthcare Records', 'A synthetic patient record summary. All fields are synthetic test data, not real PHI.'),
  employee_record: buildBusinessDocumentType('employee_record', 'Employee Records', 'A synthetic employee/HR record.'),
  payroll_document: buildBusinessDocumentType('payroll_document', 'Payroll Documents', 'A synthetic payroll summary.'),
};

function slug(text) {
  return String(text || 'document')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'document';
}

export default { documentTypes, businessDocumentTypes };
