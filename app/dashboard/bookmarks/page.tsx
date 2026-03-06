import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bookmark, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '我的收藏' }

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/bookmarks')

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select(`
      id, created_at,
      resources(id, title, url, description, categories(name, slug)),
      articles(id, title, slug, excerpt, categories(name, slug))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Bookmark className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">我的收藏</h1>
        <Badge variant="secondary">{bookmarks?.length ?? 0}</Badge>
      </div>

      {!bookmarks?.length ? (
        <div className="text-center py-16 text-gray-400">
          <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg mb-2">还没有收藏</p>
          <p className="text-sm mb-4">在浏览资源时点击收藏按钮</p>
          <Button asChild><Link href="/resources">浏览资源</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bookmark: any) => {
            const resource = bookmark.resources
            const article = bookmark.articles

            if (resource) {
              return (
                <Card key={bookmark.id}>
                  <CardContent className="p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">资源</Badge>
                        {resource.categories && (
                          <span className="text-xs text-gray-400">{resource.categories.name}</span>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-sm text-gray-500 mt-1 truncate">{resource.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">收藏于 {formatDate(bookmark.created_at)}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/resources/${resource.id}`}>详情</Link>
                      </Button>
                      <Button asChild size="sm">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            }

            if (article) {
              return (
                <Card key={bookmark.id}>
                  <CardContent className="p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">文章</Badge>
                        {article.categories && (
                          <span className="text-xs text-gray-400">{article.categories.name}</span>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900">{article.title}</h3>
                      {article.excerpt && (
                        <p className="text-sm text-gray-500 mt-1 truncate">{article.excerpt}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">收藏于 {formatDate(bookmark.created_at)}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/articles/${article.slug}`}>阅读</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            }

            return null
          })}
        </div>
      )}
    </div>
  )
}
