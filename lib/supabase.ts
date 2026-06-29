import { createClient } from "@supabase/supabase-js";

/**
 * Browser-safe Supabase client using the anon key.
 *
 * Assumes RLS (or equivalent policies) on `documentation` and `comments` allow
 * the operations this app performs. There is no server-side auth layer yet.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);