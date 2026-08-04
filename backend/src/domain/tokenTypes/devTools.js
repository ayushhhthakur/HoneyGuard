import { randomAlphaNum, randomHex, randomBase64Url } from '../generators/primitives.js';

const trackingNoteFor = (service) =>
  `Not network-trackable on its own — HoneyGuard doesn't have access to ${service}'s audit log. Wire ${service}'s own audit/webhook events (filtered to this exact key) to call HoneyGuard's /track/:token endpoint when it's used.`;

export const devToolTypes = {
  github_pat: {
    key: 'github_pat',
    label: 'GitHub Personal Access Tokens',
    family: 'devtools',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 90,
    rotatable: true,
    description: 'Matches the real GitHub classic PAT format (ghp_ + 36 chars).',
    trackingNote: trackingNoteFor('GitHub (audit log / security overview)'),
    generate: async () => {
      const token = `ghp_${randomAlphaNum(36)}`;
      return { token, secretPreview: token, metadata: {} };
    },
  },

  slack_token: {
    key: 'slack_token',
    label: 'Slack Tokens',
    family: 'devtools',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 90,
    rotatable: true,
    description: 'Matches Slack\'s bot-token format (xoxb-…).',
    trackingNote: trackingNoteFor('Slack (Enterprise Grid audit logs)'),
    generate: async () => {
      const team = String(Math.floor(1e11 + Math.random() * 8e11));
      const token = `xoxb-${team}-${String(Math.floor(1e12 + Math.random() * 8e12))}-${randomAlphaNum(24)}`;
      return { token, secretPreview: token, metadata: {} };
    },
  },

  discord_token: {
    key: 'discord_token',
    label: 'Discord Tokens',
    family: 'devtools',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 90,
    rotatable: true,
    description: 'Matches Discord bot token\'s 3-segment base64 shape.',
    trackingNote: trackingNoteFor('Discord (bot gateway logs)'),
    generate: async () => {
      const idSegment = Buffer.from(String(Math.floor(1e17 + Math.random() * 8e17))).toString('base64url');
      const tsSegment = randomAlphaNum(6);
      const hmacSegment = randomAlphaNum(27);
      const token = `${idSegment}.${tsSegment}.${hmacSegment}`;
      return { token, secretPreview: token, metadata: {} };
    },
  },

  google_api_key: {
    key: 'google_api_key',
    label: 'Google API Keys',
    family: 'devtools',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 180,
    rotatable: true,
    description: 'Matches Google API keys\' real prefix/length (AIza…, 39 chars).',
    trackingNote: trackingNoteFor('Google Cloud (API key usage alerts)'),
    generate: async () => {
      const token = `AIza${randomAlphaNum(35)}`;
      return { token, secretPreview: token, metadata: {} };
    },
  },

  openai_key: {
    key: 'openai_key',
    label: 'OpenAI Keys',
    family: 'devtools',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 90,
    rotatable: true,
    description: 'Matches OpenAI\'s secret-key format (sk-…).',
    trackingNote: trackingNoteFor('OpenAI (usage dashboard / org audit log)'),
    generate: async () => {
      const token = `sk-${randomAlphaNum(48)}`;
      return { token, secretPreview: token, metadata: {} };
    },
  },

  stripe_key: {
    key: 'stripe_key',
    label: 'Stripe Keys',
    family: 'devtools',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 180,
    rotatable: true,
    description: 'Matches Stripe\'s live secret-key format (sk_live_…).',
    trackingNote: 'Not network-trackable on its own. Stripe restricted/live keys can\'t be safely faked against Stripe\'s API — wire your own request-proxy or Stripe webhook filtering on this key to call /track/:token.',
    generate: async () => {
      const token = `sk_live_${randomAlphaNum(24)}`;
      return { token, secretPreview: token, metadata: {} };
    },
  },

  twilio_key: {
    key: 'twilio_key',
    label: 'Twilio Keys',
    family: 'devtools',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 90,
    rotatable: true,
    description: 'A fake Twilio Account SID + Auth Token pair.',
    trackingNote: trackingNoteFor('Twilio (usage/audit logs)'),
    generate: async () => {
      const accountSid = `AC${randomHex(16)}`;
      const authToken = randomHex(16);
      return { token: authToken, secretPreview: accountSid, metadata: { accountSid, authToken } };
    },
  },

  mailgun_key: {
    key: 'mailgun_key',
    label: 'Mailgun Keys',
    family: 'devtools',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 90,
    rotatable: true,
    description: 'Matches Mailgun\'s legacy API key format (key-…).',
    trackingNote: trackingNoteFor('Mailgun (audit log / event webhooks)'),
    generate: async () => {
      const token = `key-${randomHex(16)}`;
      return { token, secretPreview: token, metadata: {} };
    },
  },

  s3_url: {
    key: 's3_url',
    label: 'S3 URLs',
    family: 'devtools',
    deliveryMethod: 'url',
    fileFormat: null,
    defaultExpiryDays: 30,
    rotatable: true,
    description: 'A presigned-S3-URL-styled link that actually resolves to a HoneyGuard tracking endpoint — genuinely network-trackable.',
    trackingNote: 'Fully tracked: the URL points at HoneyGuard\'s own /decoy/:token endpoint, styled to look like an S3 presigned URL. Opening it (via curl, browser, or an automated scraper) fires an alert.',
    // The actual URL is assembled by the token service once it knows the
    // public base URL and the freshly-created token value.
    generate: async () => {
      const objectKey = `exports/${randomAlphaNum(8)}/${randomAlphaNum(6)}.csv`;
      const trackingToken = `s3_${randomBase64Url(16)}`;
      return {
        token: trackingToken,
        secretPreview: objectKey,
        metadata: {
          bucket: 'prod-data-exports',
          objectKey,
          amzParams: {
            'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
            'X-Amz-Expires': '604800',
            'X-Amz-SignedHeaders': 'host',
          },
        },
      };
    },
  },
};

export default devToolTypes;
