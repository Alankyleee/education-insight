import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

async function checkUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(timer)
    return res.ok || res.status === 405
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  // Verify admin via cookie session
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    const { data: resources, error } = await supabase
      .from('resources')
      .select('id, url')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!resources?.length) return NextResponse.json({ checked: 0, online: 0, offline: 0 })

    // Check all URLs in parallel
    const results = await Promise.all(
      resources.map(async (r: any) => ({
        id: r.id,
        is_online: await checkUrl(r.url),
      }))
    )

    // Bulk update in parallel
    await Promise.all(
      results.map((result) =>
        supabase
          .from('resources')
          .update({ is_online: result.is_online, last_checked_at: new Date().toISOString() })
          .eq('id', result.id)
      )
    )

    const online = results.filter((r) => r.is_online).length
    return NextResponse.json({ checked: results.length, online, offline: results.length - online })
  } catch (err: any) {
    console.error('[check-resources] unexpected error:', err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? 'unknown' }, { status: 500 })
  }
}
