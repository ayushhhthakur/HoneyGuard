import { z } from 'zod';

// Every environment variable the app depends on is declared here, once.
// Nothing else in the codebase should read `process.env` directly — that's
// what makes this "central configuration": one file to add a var, one place
// that knows what's required vs optional, and a boot-time failure instead of
// an undefined-is-not-a-function three services deep in production.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(1),
  // This server's own public URL — embedded into generated honeydocuments
  // (Word/Excel/PowerPoint/PDF/HTML) as the canary callback target. Must be
  // reachable from wherever a generated document might be opened, so this
  // has to be the public deployment URL, not localhost, once you're
  // actually deploying honeytokens to real targets.
  PUBLIC_BASE_URL: z.string().url().default('http://localhost:5000'),

  SUPABASE_URL: z.string().url({ message: 'SUPABASE_URL must be a valid URL' }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, 'SUPABASE_SERVICE_ROLE_KEY looks too short to be real'),

  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),

  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_SECURE: z.coerce.boolean().default(true),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  ALERT_FROM_NAME: z.string().default('HoneyGuard Security'),
  ALERT_EMAILS: z.string().default(''),

  ALERT_WEBHOOK_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Intentionally not using the structured logger here — it may depend on
  // config that failed to parse. Fail loud, fail fast, fail before we ever
  // bind a port.
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    // eslint-disable-next-line no-console
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  nodeEnv: raw.NODE_ENV,
  isProduction: raw.NODE_ENV === 'production',
  isTest: raw.NODE_ENV === 'test',
  port: raw.PORT,
  logLevel: raw.LOG_LEVEL,

  corsOrigins: raw.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
  trustProxyHops: raw.TRUST_PROXY_HOPS,
  publicBaseUrl: raw.PUBLIC_BASE_URL.replace(/\/$/, ''),

  supabase: {
    url: raw.SUPABASE_URL,
    serviceRoleKey: raw.SUPABASE_SERVICE_ROLE_KEY,
  },

  r2: {
    accountId: raw.R2_ACCOUNT_ID,
    accessKeyId: raw.R2_ACCESS_KEY_ID,
    secretAccessKey: raw.R2_SECRET_ACCESS_KEY,
    bucket: raw.R2_BUCKET,
    publicUrl: raw.R2_PUBLIC_URL,
    get isConfigured() {
      return Boolean(raw.R2_ACCOUNT_ID && raw.R2_ACCESS_KEY_ID && raw.R2_SECRET_ACCESS_KEY && raw.R2_BUCKET);
    },
  },

  smtp: {
    host: raw.SMTP_HOST,
    port: raw.SMTP_PORT,
    secure: raw.SMTP_SECURE,
    user: raw.SMTP_USER,
    pass: raw.SMTP_PASS,
    fromName: raw.ALERT_FROM_NAME,
    alertEmails: raw.ALERT_EMAILS.split(',').map((e) => e.trim()).filter(Boolean),
    get isConfigured() {
      return Boolean(raw.SMTP_USER && raw.SMTP_PASS);
    },
  },

  alertWebhookSecret: raw.ALERT_WEBHOOK_SECRET || '',
};

export default env;
