import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Set Vercel function max duration (Pro: 60s, Hobby: 10s)
export const maxDuration = 60

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

export async function POST() {
  try {
    const supabase = await createAdminClient()
    const { data: resources, error } = await (supabase as any)
      .from('resources')
      .select('id, url')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!resources?.length) return NextResponse.json({ checked: 0, online: 0, offline: 0 })

    // Check all URLs in parallel
    const results = await Promise.all(
      resources.map(async (r: any) => {
        const is_online = await checkUrl(r.url)
        return { id: r.id, is_online }
      })
    )

    // Bulk update in parallel
    await Promise.all(
      results.map((result) =>
        (supabase as any)
          .from('resources')
          .update({ is_online: result.is_online, last_checked_at: new Date().toISOString() })
          .eq('id', result.id)
      )
    )

    const online = results.filter((r) => r.is_online).length
    const offline = results.length - online
    return NextResponse.json({ checked: results.length, online, offline })
  } catch (err: any) {
    console.error('[check-resources]', err)
    return NextResponse.json({ error: err.message ?? 'unknown error' }, { status: 500 })
  }
}
