import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase: null, user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) return { supabase: null, user: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { supabase, user, error: null }
}

export async function GET() {
  const { supabase, error } = await verifyAdmin()
  if (error) return error

  const { data } = await supabase!.from('resources').select('*, categories(name)').order('created_at', { ascending: false }).limit(100)
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const { supabase, user, error } = await verifyAdmin()
  if (error) return error

  const body = await req.json() as Record<string, unknown>
  const { data, error: dbError } = await supabase!
    .from('resources')
    .insert({ ...(body as any), approved_by: user!.id })
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
