import { createHash } from 'crypto';
import {
  randomAlphaNum,
  randomHex,
  randomBase64Url,
  uuid,
  generateSshKeyPair,
  fakeCompanyDomain,
} from '../generators/primitives.js';

export const cloudCredentialTypes = {
  aws_credentials: {
    key: 'aws_credentials',
    label: 'AWS Credentials',
    family: 'cloud_credentials',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 90,
    rotatable: true,
    description: 'A fake AWS access key pair, formatted exactly like a real IAM credential.',
    trackingNote:
      'Not network-trackable on its own — HoneyGuard cannot see AWS API calls. Wire this key\'s access key ID into a CloudTrail/GuardDuty rule (or an EventBridge rule) in the target AWS account that POSTs to HoneyGuard\'s /track/aws/:token endpoint whenever this exact key is used.',
    generate: async () => {
      const accessKeyId = `AKIA${randomAlphaNum(16).toUpperCase()}`;
      const secretAccessKey = randomBase64Url(30);
      return {
        token: accessKeyId,
        secretPreview: accessKeyId,
        metadata: { accessKeyId, secretAccessKey, region: 'us-east-1' },
      };
    },
  },

  azure_credentials: {
    key: 'azure_credentials',
    label: 'Azure Credentials',
    family: 'cloud_credentials',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 90,
    rotatable: true,
    description: 'A fake Azure AD app registration (tenant/client id + client secret).',
    trackingNote:
      'Not network-trackable directly. Wire an Azure AD sign-in log alert (or Microsoft Sentinel rule) matching this client ID to call /track/:token when authentication is attempted.',
    generate: async () => {
      const tenantId = uuid();
      const clientId = uuid();
      const clientSecret = randomBase64Url(24);
      return {
        token: clientId,
        secretPreview: clientId,
        metadata: { tenantId, clientId, clientSecret },
      };
    },
  },

  gcp_credentials: {
    key: 'gcp_credentials',
    label: 'Google Cloud Credentials',
    family: 'cloud_credentials',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 90,
    rotatable: true,
    description: 'A fake GCP service-account key JSON, structurally identical to a real one.',
    trackingNote:
      'Not network-trackable directly. Wire a Cloud Audit Log / Cloud Monitoring alert matching this private_key_id to call /track/:token on use.',
    generate: async () => {
      const projectId = `${fakeCompanyDomain().split('.')[0]}-prod`;
      const privateKeyId = randomHex(20);
      const clientId = String(Math.floor(1e19 + Math.random() * 8e19));
      const clientEmail = `honeypot-sa@${projectId}.iam.gserviceaccount.com`;
      // A throwaway (never-registered) PEM-shaped key body so the JSON parses
      // and "looks" identical to a real GCP key — it isn't a valid RSA key,
      // just correctly PEM-framed filler, which is sufficient for the bait.
      const fakePem = `-----BEGIN PRIVATE KEY-----\n${Buffer.from(randomHex(512)).toString('base64').match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----\n`;
      return {
        token: privateKeyId,
        secretPreview: clientEmail,
        metadata: {
          type: 'service_account',
          project_id: projectId,
          private_key_id: privateKeyId,
          private_key: fakePem,
          client_email: clientEmail,
          client_id: clientId,
        },
      };
    },
  },

  ssh_keys: {
    key: 'ssh_keys',
    label: 'SSH Keys',
    family: 'cloud_credentials',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 180,
    rotatable: true,
    description: 'A genuinely valid, freshly-generated ed25519 keypair (never registered anywhere).',
    trackingNote:
      'Add the public key to an authorized_keys file with a forced command (or wire sshd\'s AuthorizedKeysCommand) that calls /track/:token on any connection attempt using this key\'s fingerprint.',
    generate: async () => {
      const { publicKey, privateKey } = generateSshKeyPair();
      const fingerprint = createHash('sha256').update(publicKey).digest('base64url');
      return {
        token: fingerprint,
        secretPreview: `SHA256:${fingerprint}`,
        metadata: { publicKey, privateKey, fingerprint },
      };
    },
  },

  database_credentials: {
    key: 'database_credentials',
    label: 'Database Credentials',
    family: 'cloud_credentials',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 90,
    rotatable: true,
    description: 'A fake database connection string (host/user/password/database).',
    trackingNote:
      'Not network-trackable directly. Create a real, permission-less DB user with this username in the target database and configure its audit log to call /track/:token on any login attempt.',
    fields: [{ name: 'dbEngine', label: 'Database engine', type: 'select', options: ['postgresql', 'mysql', 'mongodb', 'mssql'], default: 'postgresql' }],
    generate: async ({ dbEngine = 'postgresql' } = {}) => {
      const username = `svc_reporting_${randomAlphaNum(4).toLowerCase()}`;
      const password = randomBase64Url(18);
      const host = `db-prod-01.${fakeCompanyDomain()}`;
      const port = { postgresql: 5432, mysql: 3306, mongodb: 27017, mssql: 1433 }[dbEngine] || 5432;
      const database = 'reporting';
      const connectionString =
        dbEngine === 'mongodb'
          ? `mongodb://${username}:${password}@${host}:${port}/${database}`
          : `${dbEngine}://${username}:${password}@${host}:${port}/${database}`;
      return {
        token: password,
        secretPreview: connectionString,
        metadata: { dbEngine, host, port, username, password, database, connectionString },
      };
    },
  },
};

export default cloudCredentialTypes;
