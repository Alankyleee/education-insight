import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Inbox, BookOpen, FileText, Users } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '后台管理' }

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: pendingCount },
    { count: resourceCount },
    { count: articleCount },
    { count: userCount },
  ] = await Promise.all([
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('resources').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: '待审核提交', value: pendingCount ?? 0, icon: Inbox, color: 'text-orange-500', href: '/admin/submissions' },
    { label: '已发布资源', value: resourceCount ?? 0, icon: BookOpen, color: 'text-blue-500', href: '/admin/resources' },
    { label: '已发布文章', value: articleCount ?? 0, icon: FileText, color: 'text-green-500', href: '/admin/articles' },
    { label: '注册用户', value: userCount ?? 0, icon: Users, color: 'text-purple-500', href: '#' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">后台概览</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <a key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{stat.label}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  )
}
