'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { formatRelativeDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface CommentWithProfile {
  id: string
  content: string
  created_at: string
  user_id: string
  parent_id: string | null
  profiles: { username: string | null } | null
}

interface CommentSectionProps {
  resourceId?: string
  articleId?: string
  userId?: string
}

export function CommentSection({ resourceId, articleId, userId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const query = supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('is_approved', true)
      .order('created_at', { ascending: true })

    if (resourceId) query.eq('resource_id', resourceId)
    if (articleId) query.eq('article_id', articleId)

    query.then(({ data }) => setComments((data as any) ?? []))
  }, [resourceId, articleId])

  const submit = async () => {
    if (!userId) { router.push('/login'); return }
    if (!content.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource_id: resourceId,
          article_id: articleId,
          content: content.trim(),
          parent_id: replyTo,
        }),
      })
      if (!res.ok) throw new Error()
      setContent('')
      setReplyTo(null)
      toast.success('评论已发布')
      router.refresh()

      const data = await res.json()
      setComments((prev) => [...prev, data])
    } catch {
      toast.error('发布失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const deleteComment = async (id: string) => {
    try {
      await fetch(`/api/comments/${id}`, { method: 'DELETE' })
      setComments((prev) => prev.filter((c) => c.id !== id))
      toast.success('已删除评论')
    } catch {
      toast.error('删除失败')
    }
  }

  const topLevel = comments.filter((c) => !c.parent_id)
  const getReplies = (id: string) => comments.filter((c) => c.parent_id === id)

  return (
    <div className="space-y-6">
      {/* Comment form */}
      <div className="space-y-3">
        {replyTo && (
          <div className="text-sm text-blue-600 flex items-center gap-2">
            回复评论中
            <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600 text-xs">取消</button>
          </div>
        )}
        <Textarea
          placeholder={userId ? '写下你的评论...' : '登录后可以评论'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!userId}
          rows={3}
        />
        <div className="flex justify-end">
          <Button onClick={submit} disabled={loading || !content.trim() || !userId} size="sm">
            <Send className="h-4 w-4 mr-2" />
            发布评论
          </Button>
        </div>
      </div>

      {/* Comment list */}
      {topLevel.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-4">暂无评论，来发表第一条吧</p>
      ) : (
        <div className="space-y-4">
          {topLevel.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                currentUserId={userId}
                onReply={(id) => setReplyTo(id)}
                onDelete={deleteComment}
              />
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="ml-8 mt-3">
                  <CommentItem
                    comment={reply}
                    currentUserId={userId}
                    onDelete={deleteComment}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
}: {
  comment: CommentWithProfile
  currentUserId?: string
  onReply?: (id: string) => void
  onDelete: (id: string) => void
}) {
  const initials = comment.profiles?.username?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-700">{comment.profiles?.username ?? '匿名用户'}</span>
          <span className="text-xs text-gray-400">{formatRelativeDate(comment.created_at)}</span>
        </div>
        <p className="text-sm text-gray-600">{comment.content}</p>
        <div className="flex items-center gap-3 mt-2">
          {onReply && (
            <button onClick={() => onReply(comment.id)} className="text-xs text-gray-400 hover:text-blue-500">
              回复
            </button>
          )}
          {currentUserId === comment.user_id && (
            <button onClick={() => onDelete(comment.id)} className="text-xs text-gray-400 hover:text-red-500">
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
