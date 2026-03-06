import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const type = searchParams.get('type') // 'resources' | 'articles' | null (all)

  if (!q) return NextResponse.json({ resources: [], articles: [] })

  const supabase = await createClient()

  const [resourcesResult, articlesResult] = await Promise.all([
    type === 'articles'
      ? { data: [] }
      : supabase
          .from('resources')
          .select('id, title, description, url, categories(name, slug), avg_rating')
          .eq('is_approved', true)
          .textSearch('search_vector', q, { type: 'websearch' })
          .limit(10),
    type === 'resources'
      ? { data: [] }
      : supabase
          .from('articles')
          .select('id, title, slug, excerpt, categories(name, slug)')
          .eq('is_published', true)
          .textSearch('search_vector', q, { type: 'websearch' })
          .limit(10),
  ])

  return NextResponse.json({
    resources: resourcesResult.data ?? [],
    articles: articlesResult.data ?? [],
  })
}
