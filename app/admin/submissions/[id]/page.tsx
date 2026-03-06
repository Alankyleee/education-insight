'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { id: 1, name: '期刊数据库' }, { id: 2, name: '数据分析' }, { id: 3, name: '学习平台' },
  { id: 4, name: '学术工具' }, { id: 5, name: '教育政策' }, { id: 6, name: '测评工具' },
  { id: 7, name: '开放资源' }, { id: 8, name: '专业社群' },
]

export default function ReviewSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [submission, setSubmission] = useState<any>(null)
  const [form, setForm] = useState({ title: '', description: '', category_id: '' })
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('submissions').select('*').eq('id', id).single().then(({ data }) => {
      const sub = data as any
      if (sub) {
        setSubmission(sub)
        setForm({
          title: sub.title,
          description: sub.description ?? '',
          category_id: sub.category_id ? String(sub.category_id) : '',
        })
      }
    })
  }, [id])

  const handleApprove = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          title: form.title,
          description: form.description,
          category_id: form.category_id ? parseInt(form.category_id) : null,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('已批准，资源已发布')
      router.push('/admin/submissions')
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('请填写拒绝原因'); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reject_reason: rejectReason }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('已拒绝')
      router.push('/admin/submissions')
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  if (!submission) return <div className="p-8 text-gray-400">加载中...</div>

  return (
    <div className="max-w-2xl">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/admin/submissions"><ArrowLeft className="h-4 w-4 mr-1" />返回列表</Link>
      </Button>

      <h1 className="text-xl font-bold mb-4">审核提交</h1>

      <Card className="mb-4">
        <CardHeader><CardTitle className="text-base">原始提交信息</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-gray-500">链接：</span>
            <a href={submission.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{submission.url}</a>
          </div>
          {submission.submitter_name && <div><span className="text-gray-500">提交者：</span>{submission.submitter_name}</div>}
          {submission.submitter_email && <div><span className="text-gray-500">邮箱：</span>{submission.submitter_email}</div>}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">编辑发布信息</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>资源名称</Label>
            <Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>简介</Label>
            <Textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>分类</Label>
            <Select value={form.category_id} onValueChange={(v) => setForm(p => ({ ...p, category_id: v }))}>
              <SelectTrigger><SelectValue placeholder="选择分类" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!showRejectForm ? (
        <div className="flex gap-3">
          <Button onClick={handleApprove} disabled={loading} className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />批准并发布
          </Button>
          <Button variant="destructive" onClick={() => setShowRejectForm(true)} className="flex-1">
            <XCircle className="h-4 w-4 mr-2" />拒绝
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>拒绝原因</Label>
            <Textarea
              placeholder="请告知拒绝原因（如：内容不相关、链接失效等）"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="destructive" onClick={handleReject} disabled={loading} className="flex-1">确认拒绝</Button>
            <Button variant="outline" onClick={() => setShowRejectForm(false)} className="flex-1">取消</Button>
          </div>
        </div>
      )}
    </div>
  )
}
