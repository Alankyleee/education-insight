import { notFound } from 'next/navigation'
import { ArticleEditor } from '@/components/admin/ArticleEditor'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface PageProps { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: '编辑文章 - 后台' }

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: article } = await supabase
    .from('articles')
    .select('id, title, slug, content, excerpt, category_id, is_published')
    .eq('id', id)
    .single()

  if (!article) notFound()

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">编辑文章</h1>
      <ArticleEditor article={article} />
    </div>
  )
}
