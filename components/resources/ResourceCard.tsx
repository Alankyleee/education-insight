'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, Star } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getFaviconUrl, truncate } from '@/lib/utils'
import type { Resource, Category } from '@/lib/supabase/types'

interface ResourceCardProps {
  resource: Resource & { categories?: Pick<Category, 'name' | 'slug'> | null; is_online?: boolean | null }
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const favicon = getFaviconUrl(resource.url)

  return (
    <Card className="group flex flex-col h-full hover:shadow-md transition-shadow">
      <CardContent className="flex-1 p-4">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0 w-10 h-10 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center">
            <Image
              src={resource.thumbnail_url ?? favicon}
              alt={resource.title}
              width={40}
              height={40}
              className="object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = '/images/default-favicon.png' }}
            />
            {resource.is_online != null && (
              <span
                className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${resource.is_online ? 'bg-green-500' : 'bg-red-400'}`}
                title={resource.is_online ? '链接可访问' : '链接可能无法访问'}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {resource.title}
              </h3>
              {resource.is_featured && (
                <Badge variant="secondary" className="shrink-0 text-xs">精选</Badge>
              )}
            </div>
            {resource.categories && (
              <Link
                href={`/categories/${resource.categories.slug}`}
                className="text-xs text-blue-500 hover:underline"
              >
                {resource.categories.name}
              </Link>
            )}
          </div>
        </div>

        {resource.description && (
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
            {truncate(resource.description, 100)}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          {resource.rating_count > 0 ? (
            <>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{Number(resource.avg_rating).toFixed(1)}</span>
              <span className="text-gray-300">·</span>
              <span>{resource.rating_count} 评分</span>
            </>
          ) : (
            <span>暂无评分</span>
          )}
        </div>
        <Link
          href={`/resources/${resource.id}`}
          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
        >
          查看 <ExternalLink className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  )
}
