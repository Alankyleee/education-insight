import Link from 'next/link'
import { ExternalLink, ArrowLeft, Star, Eye } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CommentSection } from '@/components/interactions/CommentSection'
import { RatingWidget } from '@/components/interactions/RatingWidget'
import { BookmarkButton } from '@/components/interactions/BookmarkButton'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getFaviconUrl } from '@/lib/utils'
import Image from 'next/image'
import type { Metadata } from 'next'

interface PageProps { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('resources').select('title, description').eq('id', id).single()
  if (!data) return { title: '资源未找到' }
  return { title: data.title, description: data.description ?? undefined }
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: resource }, { data: { user } }] = await Promise.all([
    supabase.from('resources').select('*, categories(name, slug)').eq('id', id).eq('is_approved', true).single(),
    supabase.auth.getUser(),
  ])

  if (!resource) notFound()

  // Increment view count (fire and forget)
  supabase.from('resources').update({ view_count: resource.view_count + 1 }).eq('id', id).then(() => {})

  let userBookmark = null
  let userRating = null
  if (user) {
    const [bookmarkRes, ratingRes] = await Promise.all([
      supabase.from('bookmarks').select('id').eq('user_id', user.id).eq('resource_id', id).maybeSingle(),
      supabase.from('ratings').select('id, score').eq('user_id', user.id).eq('resource_id', id).maybeSingle(),
    ])
    userBookmark = bookmarkRes.data
    userRating = ratingRes.data
  }

  const favicon = getFaviconUrl(resource.url)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/resources"><ArrowLeft className="h-4 w-4 mr-2" />返回资源列表</Link>
      </Button>

      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border bg-gray-50 flex items-center justify-center">
            <Image
              src={resource.thumbnail_url ?? favicon}
              alt={resource.title}
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{resource.title}</h1>
              <div className="flex items-center gap-2 shrink-0">
                <BookmarkButton
                  resourceId={id}
                  initialBookmarked={!!userBookmark}
                  isLoggedIn={!!user}
                />
                <Button asChild size="sm">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    访问网站
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
              {(resource as any).categories && (
                <Link href={`/categories/${(resource as any).categories.slug}`}>
                  <Badge variant="secondary">{(resource as any).categories.name}</Badge>
                </Link>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />{resource.view_count} 次访问
              </span>
              {resource.rating_count > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {Number(resource.avg_rating).toFixed(1)} ({resource.rating_count} 评分)
                </span>
              )}
              <span>添加于 {formatDate(resource.created_at)}</span>
            </div>
          </div>
        </div>

        {resource.description && (
          <>
            <Separator className="my-4" />
            <p className="text-gray-600 leading-relaxed">{resource.description}</p>
          </>
        )}
      </div>

      {/* Rating */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">评分</h2>
        <RatingWidget
          resourceId={id}
          initialScore={userRating?.score}
          avgRating={Number(resource.avg_rating)}
          ratingCount={resource.rating_count}
          isLoggedIn={!!user}
        />
      </div>

      {/* Comments */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">评论</h2>
        <CommentSection resourceId={id} userId={user?.id} />
      </div>
    </div>
  )
}
