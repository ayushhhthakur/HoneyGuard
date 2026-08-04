import { randomBytes, randomUUID, generateKeyPairSync, createHmac } from 'crypto';

const ALPHANUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const randomAlphaNum = (length) =>
  Array.from(randomBytes(length))
    .map((b) => ALPHANUM[b % ALPHANUM.length])
    .join('');

export const randomHex = (bytes) => randomBytes(bytes).toString('hex');

export const randomBase64Url = (bytes) => randomBytes(bytes).toString('base64url');

export const uuid = () => randomUUID();

/** Generates a real, freshly-created SSH keypair (ed25519). It's a genuine
 * cryptographic keypair — not registered or trusted anywhere — which is
 * exactly what makes it a convincing honeytoken: it LOOKS and PARSES
 * identically to a real private key. */
export const generateSshKeyPair = () => {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
};

/** Minimal, dependency-free JWT signer (HS256) for generating realistic
 * fake bearer tokens with plausible claims. */
export const signFakeJwt = (payload, secret = randomHex(32)) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsigned = `${encode(header)}.${encode(payload)}`;
  const signature = createHmac('sha256', secret).update(unsigned).digest('base64url');
  return `${unsigned}.${signature}`;
};

export const fakeCompanyDomain = () => {
  const names = ['acme', 'globex', 'initech', 'umbrella', 'stark', 'wayne', 'hooli'];
  return `${names[Math.floor(Math.random() * names.length)]}.internal`;
};

export const fakePersonName = () => {
  const first = ['James', 'Maria', 'Wei', 'Amara', 'Liam', 'Priya', 'Noah', 'Fatima'];
  const last = ['Chen', 'Okafor', 'Patel', 'Novak', 'Garcia', 'Kim', 'Andersson', 'Rossi'];
  return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
};

/** SSN-shaped but obviously synthetic (900-series is never issued by SSA) — used
 * on business-document honeytokens so no output could be mistaken for real PII. */
export const fakeSsnLike = () => `9${Math.floor(Math.random() * 89 + 10)}-${Math.floor(Math.random() * 89 + 10)}-${Math.floor(Math.random() * 8999 + 1000)}`;

export const fakeIban = () => `GB${Math.floor(Math.random() * 89 + 10)}HGRD${randomAlphaNum(14).toUpperCase()}`;
