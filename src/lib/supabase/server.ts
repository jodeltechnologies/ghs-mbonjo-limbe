import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/** Reads run with the signed-in person's own session, so the row level
 *  security policies in supabase/02-policies.sql are actually in force. */
export function supabaseServer() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => store.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          try { store.set({ name, value, ...options }); } catch { /* server component */ }
        },
        remove: (name: string, options: CookieOptions) => {
          try { store.set({ name, value: '', ...options }); } catch { /* server component */ }
        },
      },
    }
  );
}

/** The service role key. Server only, and never for anything a user asked for
 *  directly. Used by the health route and by imports. */
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
