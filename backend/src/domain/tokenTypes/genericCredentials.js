import { randomAlphaNum, randomBase64Url, signFakeJwt, fakeCompanyDomain } from '../generators/primitives.js';

export const genericCredentialTypes = {
  api_key: {
    key: 'api_key',
    label: 'API Keys',
    family: 'credentials',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 90,
    rotatable: true,
    description: 'A generic, provider-agnostic API key — for internal services or unlisted third parties.',
    trackingNote:
      'Not network-trackable on its own. Wire the API gateway/service that would accept this key to call /track/:token on any request presenting it.',
    generate: async () => {
      const token = `hg_live_${randomAlphaNum(32)}`;
      return { token, secretPreview: token, metadata: {} };
    },
  },

  jwt_token: {
    key: 'jwt_token',
    label: 'JWT Tokens',
    family: 'credentials',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 30,
    rotatable: true,
    description: 'A genuinely well-formed, signed JWT with plausible internal-service claims.',
    trackingNote:
      'Not network-trackable on its own. Wire the service that would validate this JWT to call /track/:token whenever this token (or its `jti` claim) is presented.',
    generate: async () => {
      const jti = randomAlphaNum(16);
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        sub: `svc-${randomAlphaNum(6).toLowerCase()}`,
        iss: `https://auth.${fakeCompanyDomain()}`,
        aud: 'internal-api',
        role: 'service',
        iat: now,
        exp: now + 60 * 60 * 24 * 30,
        jti,
      };
      const token = signFakeJwt(payload);
      return { token, secretPreview: `${token.slice(0, 24)}…`, metadata: { claims: payload } };
    },
  },

  oauth_token: {
    key: 'oauth_token',
    label: 'OAuth Tokens',
    family: 'credentials',
    deliveryMethod: 'string',
    fileFormat: null,
    defaultExpiryDays: 60,
    rotatable: true,
    description: 'A fake OAuth2 access + refresh token pair.',
    trackingNote:
      'Not network-trackable on its own. Wire the OAuth resource server to call /track/:token when this access token is presented.',
    generate: async () => {
      const accessToken = `ya29.${randomBase64Url(48)}`;
      const refreshToken = `1//${randomBase64Url(32)}`;
      return {
        token: accessToken,
        secretPreview: accessToken,
        metadata: { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 3600 },
      };
    },
  },
};

export default genericCredentialTypes;
