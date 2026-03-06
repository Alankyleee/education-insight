import Link from 'next/link'
import { ArrowLeft, Clock, Eye } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MarkdownRenderer } from '@/components/articles/MarkdownRenderer'
import { CommentSection } from '@/components/interactions/CommentSection'
import { RatingWidget } from '@/components/interactions/RatingWidget'
import { BookmarkButton } from '@/components/interactions/BookmarkButton'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from('articles').select('title, excerpt').eq('slug', slug).single() as any
  if (!data) return { title: '文章未找到' }
  return { title: data.title, description: data.excerpt ?? undefined }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: article }, { data: { user } }] = await Promise.all([
    sb.from('articles').select('*, categories(name, slug)').eq('slug', slug).eq('is_published', true).single() as Promise<{ data: any }>,
    supabase.auth.getUser(),
  ])

  if (!article) notFound()

  // Increment view count (fire and forget)
  sb.from('articles').update({ view_count: article.view_count + 1 }).eq('id', article.id).then(() => {})

  let userBookmark = null
  let userRating = null
  if (user) {
    const [bookmarkRes, ratingRes] = await Promise.all([
      sb.from('bookmarks').select('id').eq('user_id', user.id).eq('article_id', article.id).maybeSingle(),
      sb.from('ratings').select('id, score').eq('user_id', user.id).eq('article_id', article.id).maybeSingle(),
    ])
    userBookmark = bookmarkRes.data
    userRating = ratingRes.data
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/articles"><ArrowLeft className="h-4 w-4 mr-2" />返回文章列表</Link>
      </Button>

      <article className="bg-white border rounded-xl p-8 mb-6">
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            {(article as any).categories && (
              <Link href={`/categories/${(article as any).categories.slug}`}>
                <Badge>{(article as any).categories.name}</Badge>
              </Link>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>

          {article.excerpt && (
            <p className="text-lg text-gray-500 leading-relaxed mb-4">{article.excerpt}</p>
          )}

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatDate(article.created_at)}</span>
              <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{article.view_count} 阅读</span>
            </div>
            <BookmarkButton
              articleId={article.id}
              initialBookmarked={!!userBookmark}
              isLoggedIn={!!user}
            />
          </div>
        </header>

        <Separator className="mb-8" />

        <MarkdownRenderer content={article.content} />
      </article>

      {/* Rating */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">文章评分</h2>
        <RatingWidget
          articleId={article.id}
          initialScore={userRating?.score}
          avgRating={Number(article.avg_rating)}
          ratingCount={article.rating_count}
          isLoggedIn={!!user}
        />
      </div>

      {/* Comments */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">评论</h2>
        <CommentSection articleId={article.id} userId={user?.id} />
      </div>
    </div>
  )
}
