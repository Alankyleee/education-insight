import Link from 'next/link'
import type { Category } from '@/lib/supabase/types'

interface CategoryNavProps {
  categories: Category[]
  activeSlug?: string
}

export function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  const parents = categories.filter((c) => !c.parent_id)

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/resources"
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          !activeSlug
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        全部
      </Link>
      {parents.map((cat) => (
        <Link
          key={cat.id}
          href={`/categories/${cat.slug}`}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeSlug === cat.slug
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cat.icon && <span>{cat.icon}</span>}
          {cat.name}
        </Link>
      ))}
    </div>
  )
}
