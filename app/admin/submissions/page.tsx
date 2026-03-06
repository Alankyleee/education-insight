import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '审核提交 - 后台' }

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function SubmissionsPage({ searchParams }: PageProps) {
  const { status = 'pending' } = await searchParams
  const supabase = await createClient()

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, categories(name)')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(50)

  const statusOptions = [
    { value: 'pending', label: '待审核' },
    { value: 'approved', label: '已批准' },
    { value: 'rejected', label: '已拒绝' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">提交审核</h1>

      <div className="flex gap-2 mb-6">
        {statusOptions.map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/submissions?status=${opt.value}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              status === opt.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {!submissions?.length ? (
        <div className="text-center py-12 text-gray-400">暂无{statusOptions.find(s => s.value === status)?.label}记录</div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub: any) => (
            <Card key={sub.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{sub.title}</h3>
                      {sub.categories && (
                        <Badge variant="secondary" className="shrink-0 text-xs">{sub.categories.name}</Badge>
                      )}
                    </div>
                    <a href={sub.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline truncate block">
                      {sub.url}
                    </a>
                    {sub.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{sub.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      {sub.submitter_name && <span>提交者：{sub.submitter_name}</span>}
                      {sub.submitter_email && <span>{sub.submitter_email}</span>}
                      <span>{formatDate(sub.created_at)}</span>
                    </div>
                    {sub.reject_reason && (
                      <p className="text-xs text-red-500 mt-1">拒绝原因：{sub.reject_reason}</p>
                    )}
                  </div>

                  {status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <Button asChild size="sm">
                        <Link href={`/admin/submissions/${sub.id}`}>审核</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
