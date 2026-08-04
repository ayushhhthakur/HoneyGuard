import { z } from 'zod';

// Note: no `smtp` field. A previous version of this endpoint accepted a
// caller-supplied { host, user, pass } SMTP config here and used it to send
// the email — an SSRF / open-relay primitive gated only by a static shared
// secret. This server now only ever sends through its own configured SMTP
// credentials (see services/mailer.service.js).
export const notifyAlertEmailSchema = {
  body: z.object({
    alert: z.object({
      org_id: z.string().min(1),
      message: z.string().max(500).optional(),
      type: z.string().max(100).optional(),
      token: z.string().max(200).optional(),
      severity: z.string().max(20).optional(),
      created_at: z.string().optional(),
    }),
    recipients: z.array(z.string().email()).max(50).default([]),
  }),
};

export default { notifyAlertEmailSchema };
