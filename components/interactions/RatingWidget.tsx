'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface RatingWidgetProps {
  resourceId?: string
  articleId?: string
  initialScore?: number
  avgRating: number
  ratingCount: number
  isLoggedIn: boolean
}

export function RatingWidget({ resourceId, articleId, initialScore, avgRating, ratingCount, isLoggedIn }: RatingWidgetProps) {
  const [hoveredScore, setHoveredScore] = useState(0)
  const [userScore, setUserScore] = useState(initialScore ?? 0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRate = async (score: number) => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    if (loading) return
    setLoading(true)

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_id: resourceId, article_id: articleId, score }),
      })
      if (!res.ok) throw new Error()
      setUserScore(score)
      toast.success('评分成功')
      router.refresh()
    } catch {
      toast.error('评分失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const displayScore = hoveredScore || userScore

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              disabled={loading}
              onMouseEnter={() => setHoveredScore(s)}
              onMouseLeave={() => setHoveredScore(0)}
              onClick={() => handleRate(s)}
              className={cn('transition-transform hover:scale-110', loading && 'cursor-not-allowed opacity-50')}
            >
              <Star
                className={cn(
                  'h-7 w-7 transition-colors',
                  s <= displayScore ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                )}
              />
            </button>
          ))}
        </div>
        {userScore > 0 && (
          <span className="text-sm text-blue-600 font-medium">你的评分：{userScore}星</span>
        )}
      </div>

      {ratingCount > 0 ? (
        <p className="text-sm text-gray-500">
          平均 <span className="font-medium text-gray-700">{avgRating.toFixed(1)}</span> 分（{ratingCount} 人评分）
        </p>
      ) : (
        <p className="text-sm text-gray-400">{isLoggedIn ? '还没有评分，成为第一个！' : '登录后可以评分'}</p>
      )}
    </div>
  )
}
