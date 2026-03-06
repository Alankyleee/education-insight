import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { data: comment } = await sb.from('comments').select('user_id').eq('id', id).single()

  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isAdmin = await supabase.rpc('is_admin')
  if (comment.user_id !== user.id && !isAdmin.data) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await sb.from('comments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
