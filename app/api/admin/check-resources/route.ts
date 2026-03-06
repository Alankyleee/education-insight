import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

async function checkUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(timer)
    return res.ok || res.status === 405 // 405 means server responded (no HEAD support)
  } catch {
    return false
  }
}

export async function POST() {
  const supabase = await createAdminClient()
  const { data: resources, error } = await (supabase as any)
    .from('resources')
    .select('id, url')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!resources?.length) return NextResponse.json({ checked: 0 })

  // Check all URLs in parallel (batch of 10 to avoid overwhelming)
  const batchSize = 10
  let online = 0
  let offline = 0

  for (let i = 0; i < resources.length; i += batchSize) {
    const batch = resources.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map(async (r: any) => {
        const isOnline = await checkUrl(r.url)
        return { id: r.id, is_online: isOnline }
      })
    )

    for (const result of results) {
      await (supabase as any)
        .from('resources')
        .update({ is_online: result.is_online, last_checked_at: new Date().toISOString() })
        .eq('id', result.id)
      result.is_online ? online++ : offline++
    }
  }

  return NextResponse.json({ checked: resources.length, online, offline })
}
