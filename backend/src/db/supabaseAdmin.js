import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

// Server-side client using the SERVICE ROLE key. This bypasses Row Level
// Security, which is intentional: the Express layer is the trust boundary
// and does its own auth + RBAC checks (see middleware/auth.middleware.js
// and middleware/org.middleware.js) before ever touching this client.
// Never send this key to the browser, never log it (see core/logger.js
// redaction list).
export const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabaseAdmin;
