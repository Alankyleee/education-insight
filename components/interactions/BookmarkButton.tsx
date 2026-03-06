'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface BookmarkButtonProps {
  resourceId?: string
  articleId?: string
  initialBookmarked: boolean
  isLoggedIn: boolean
}

export function BookmarkButton({ resourceId, articleId, initialBookmarked, isLoggedIn }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    setLoading(true)
    const prev = bookmarked
    setBookmarked(!prev) // optimistic

    try {
      const params = new URLSearchParams()
      if (resourceId) params.set('resource_id', resourceId)
      if (articleId) params.set('article_id', articleId)

      const res = await fetch(
        prev ? `/api/bookmarks?${params}` : '/api/bookmarks',
        {
          method: prev ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: prev ? undefined : JSON.stringify({ resource_id: resourceId, article_id: articleId }),
        }
      )

      if (!res.ok) throw new Error()
      toast.success(prev ? '已取消收藏' : '已添加收藏')
    } catch {
      setBookmarked(prev) // rollback
      toast.error('操作失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={bookmarked ? 'text-blue-600 border-blue-600' : ''}
    >
      {bookmarked ? (
        <><BookmarkCheck className="h-4 w-4 mr-1" />已收藏</>
      ) : (
        <><Bookmark className="h-4 w-4 mr-1" />收藏</>
      )}
    </Button>
  )
}
