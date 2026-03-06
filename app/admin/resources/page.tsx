import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatDate, truncate } from '@/lib/utils'
import { Plus, Pencil } from 'lucide-react'
import { DeleteResourceButton } from '@/components/admin/DeleteResourceButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '资源管理 - 后台' }

export default async function AdminResourcesPage() {
  const supabase = await createClient()
  const { data: resources } = await supabase
    .from('resources')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">资源管理</h1>
        <Button asChild size="sm">
          <Link href="/admin/resources/new"><Plus className="h-4 w-4 mr-1" />添加资源</Link>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 pr-4">资源名称</th>
              <th className="pb-3 pr-4">分类</th>
              <th className="pb-3 pr-4">状态</th>
              <th className="pb-3 pr-4">评分</th>
              <th className="pb-3 pr-4">添加时间</th>
              <th className="pb-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {resources?.map((r: any) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="py-3 pr-4">
                  <div className="font-medium text-gray-900">{truncate(r.title, 30)}</div>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block max-w-xs">
                    {r.url}
                  </a>
                </td>
                <td className="py-3 pr-4">
                  {r.categories ? <Badge variant="secondary">{r.categories.name}</Badge> : '—'}
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={r.is_approved ? 'default' : 'outline'}>
                    {r.is_approved ? '已发布' : '未发布'}
                  </Badge>
                </td>
                <td className="py-3 pr-4 text-gray-500">
                  {r.rating_count > 0 ? `${Number(r.avg_rating).toFixed(1)} (${r.rating_count})` : '—'}
                </td>
                <td className="py-3 pr-4 text-gray-500">{formatDate(r.created_at)}</td>
                <td className="py-3">
                  <div className="flex gap-1">
                    <Button asChild size="icon" variant="ghost">
                      <Link href={`/admin/resources/${r.id}`}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    <DeleteResourceButton id={r.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
