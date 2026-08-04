import { cloudCredentialTypes } from './cloudCredentials.js';
import { genericCredentialTypes } from './genericCredentials.js';
import { devToolTypes } from './devTools.js';
import { documentTypes, businessDocumentTypes } from './documents.js';

/**
 * THE token type registry — every honeytoken type HoneyGuard supports is
 * declared exactly once here (across the five family files above) and
 * nothing else in the codebase hardcodes a per-type switch statement.
 * Adding a 28th type means adding one entry to one of these files; it does
 * NOT mean touching the service, controller, route, or UI layers.
 */
export const TOKEN_TYPES = {
  ...documentTypes,
  ...cloudCredentialTypes,
  ...genericCredentialTypes,
  ...devToolTypes,
  ...businessDocumentTypes,
};

export const FAMILY_LABELS = {
  documents: 'Documents',
  cloud_credentials: 'Cloud & Infrastructure Credentials',
  credentials: 'Generic Credentials',
  devtools: 'SaaS & Developer API Keys',
  business_documents: 'Business Documents',
};

export const getTokenTypeDef = (typeKey) => TOKEN_TYPES[typeKey] || null;

export const listTokenTypes = () => Object.values(TOKEN_TYPES);

export const listTokenTypesByFamily = () => {
  const grouped = {};
  for (const def of listTokenTypes()) {
    if (!grouped[def.family]) grouped[def.family] = [];
    grouped[def.family].push(def);
  }
  return grouped;
};

/** Public-facing shape (drops the `generate` function — never sent to the client). */
export const describeTokenType = (def) => ({
  key: def.key,
  label: def.label,
  family: def.family,
  familyLabel: FAMILY_LABELS[def.family] || def.family,
  deliveryMethod: def.deliveryMethod,
  fileFormat: def.fileFormat,
  defaultExpiryDays: def.defaultExpiryDays,
  rotatable: def.rotatable,
  description: def.description,
  trackingNote: def.trackingNote,
  fields: def.fields || [],
  requiresUpload: Boolean(def.requiresUpload),
});

export default TOKEN_TYPES;
