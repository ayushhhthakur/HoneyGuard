import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    '[supabaseAdmin] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. ' +
      'Copy backend/.env.example to backend/.env and fill in your project values.'
  );
  process.exit(1);
}

// Server-side client using the SERVICE ROLE key. This bypasses Row Level
// Security, which is intentional: the Express layer is the trust boundary
// and does its own auth + RBAC checks (see middleware/auth.js) before ever
// touching this client. Never send this key to the browser.
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabaseAdmin;
