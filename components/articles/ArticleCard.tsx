import Link from 'next/link'
import { BookOpen, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate, truncate } from '@/lib/utils'
import type { Article, Category } from '@/lib/supabase/types'

interface ArticleCardProps {
  article: Article & { categories?: Pick<Category, 'name' | 'slug'> | null }
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            {article.categories && (
              <Badge variant="outline" className="text-xs">
                {article.categories.name}
              </Badge>
            )}
          </div>
          <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" />
            {formatRelativeDate(article.created_at)}
          </span>
        </div>

        <Link href={`/articles/${article.slug}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
            {article.title}
          </h3>
        </Link>

        {article.excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed">
            {truncate(article.excerpt, 120)}
          </p>
        )}

        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {article.view_count} 阅读
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
