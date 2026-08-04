import { fakePersonName, fakeSsnLike, fakeIban, randomAlphaNum } from '../generators/primitives.js';

/**
 * Every field here is synthetically generated per-call (fakePersonName,
 * fakeSsnLike, etc.) — nothing is a real person's data, and SSN-shaped
 * values deliberately use the 900-series prefix the SSA never issues, so
 * no output could be mistaken for genuine PII even out of context.
 */
const genericTemplate = (typeLabel) => ({
  heading: `${typeLabel} — Internal Use Only`,
  subheading: `Reference #${randomAlphaNum(8).toUpperCase()}`,
  rows: [
    ['Prepared by', fakePersonName()],
    ['Department', 'Finance & Operations'],
    ['Classification', 'Confidential'],
  ],
  footerNote: 'This document is a security instrumented decoy. Any access outside authorized personnel will be logged.',
});

export const financialDocumentTemplate = () => ({
  heading: 'Quarterly Financial Summary — Internal Use Only',
  subheading: `Reference #${randomAlphaNum(8).toUpperCase()}`,
  rows: [
    ['Prepared by', fakePersonName()],
    ['Account holder', fakePersonName()],
    ['IBAN', fakeIban()],
    ['Total assets', `$${(Math.random() * 9_000_000 + 100_000).toFixed(2)}`],
    ['Outstanding liabilities', `$${(Math.random() * 500_000).toFixed(2)}`],
    ['Classification', 'Confidential — Finance'],
  ],
  footerNote: 'This document is a security instrumented decoy. Any access outside authorized personnel will be logged.',
});

export const healthcareRecordTemplate = () => ({
  heading: 'Patient Record Summary — Internal Use Only',
  subheading: `MRN #${randomAlphaNum(8).toUpperCase()}`,
  rows: [
    ['Patient', fakePersonName()],
    ['DOB', '01/01/1990 (synthetic)'],
    ['Attending physician', fakePersonName()],
    ['Record ID (synthetic)', fakeSsnLike()],
    ['Classification', 'Confidential — PHI (synthetic test data)'],
  ],
  footerNote: 'All fields in this document are synthetically generated test data. This document is a security instrumented decoy.',
});

export const employeeRecordTemplate = () => ({
  heading: 'Employee Record — Internal Use Only',
  subheading: `Employee ID #${randomAlphaNum(8).toUpperCase()}`,
  rows: [
    ['Name', fakePersonName()],
    ['Title', 'Senior Systems Administrator'],
    ['Manager', fakePersonName()],
    ['Employee SSN (synthetic)', fakeSsnLike()],
    ['Classification', 'Confidential — HR'],
  ],
  footerNote: 'This document is a security instrumented decoy. Any access outside authorized personnel will be logged.',
});

export const payrollDocumentTemplate = () => ({
  heading: 'Payroll Summary — Internal Use Only',
  subheading: `Pay Period #${randomAlphaNum(8).toUpperCase()}`,
  rows: [
    ['Employee', fakePersonName()],
    ['Base salary', `$${(Math.random() * 120_000 + 60_000).toFixed(2)}`],
    ['Bank account (synthetic)', fakeIban()],
    ['Processed by', fakePersonName()],
    ['Classification', 'Confidential — Payroll'],
  ],
  footerNote: 'This document is a security instrumented decoy. Any access outside authorized personnel will be logged.',
});

export const CONTENT_TEMPLATES = {
  financial_document: financialDocumentTemplate,
  healthcare_record: healthcareRecordTemplate,
  employee_record: employeeRecordTemplate,
  payroll_document: payrollDocumentTemplate,
};

export const resolveContentTemplate = (tokenTypeKey, fallbackLabel) =>
  (CONTENT_TEMPLATES[tokenTypeKey] || (() => genericTemplate(fallbackLabel)))();
