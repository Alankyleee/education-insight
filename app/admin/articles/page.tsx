import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatDate, truncate } from '@/lib/utils'
import { Plus, Pencil } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '文章管理 - 后台' }

export default async function AdminArticlesPage() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, is_published, created_at, view_count, categories(name)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">文章管理</h1>
        <Button asChild size="sm">
          <Link href="/admin/articles/new"><Plus className="h-4 w-4 mr-1" />写文章</Link>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 pr-4">标题</th>
              <th className="pb-3 pr-4">分类</th>
              <th className="pb-3 pr-4">状态</th>
              <th className="pb-3 pr-4">阅读</th>
              <th className="pb-3 pr-4">创建时间</th>
              <th className="pb-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {articles?.map((a: any) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="py-3 pr-4">
                  <span className="font-medium text-gray-900">{truncate(a.title, 40)}</span>
                  <div className="text-xs text-gray-400">/articles/{a.slug}</div>
                </td>
                <td className="py-3 pr-4">
                  {a.categories ? <Badge variant="secondary">{a.categories.name}</Badge> : '—'}
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={a.is_published ? 'default' : 'outline'}>
                    {a.is_published ? '已发布' : '草稿'}
                  </Badge>
                </td>
                <td className="py-3 pr-4 text-gray-500">{a.view_count}</td>
                <td className="py-3 pr-4 text-gray-500">{formatDate(a.created_at)}</td>
                <td className="py-3">
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/admin/articles/${a.id}`}><Pencil className="h-4 w-4 mr-1" />编辑</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
