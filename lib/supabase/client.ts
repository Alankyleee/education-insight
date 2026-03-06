import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Types are kept in types.ts for reference; auto-generate with supabase CLI for full type safety
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
