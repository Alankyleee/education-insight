import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { resource_id, article_id, score } = await req.json()

  if (!resource_id && !article_id) {
    return NextResponse.json({ error: 'resource_id or article_id required' }, { status: 400 })
  }
  if (!score || score < 1 || score > 5) {
    return NextResponse.json({ error: 'score must be 1-5' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('ratings')
    .upsert(
      { user_id: user.id, resource_id, article_id, score, updated_at: new Date().toISOString() },
      { onConflict: resource_id ? 'user_id,resource_id' : 'user_id,article_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
